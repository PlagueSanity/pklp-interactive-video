const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const PORT = process.env.PORT || 3000;
const TEACHER_PIN = process.env.TEACHER_PIN || '1234';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Alias for final video name
app.get('/ang_mga_tinig_ng_nakaraan_final.mp4', (req, res) => {
  res.redirect(301, '/ang_mga_tinig_ng_nakaraan.mp4');
});

app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
const dbPath = path.join(__dirname, 'data', 'pklp.sqlite');
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id TEXT UNIQUE,
    lesson_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    section TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answers_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Auto-migration: Ensure submission_id column exists if table was created in an earlier version
try {
  db.exec(`ALTER TABLE submissions ADD COLUMN submission_id TEXT;`);
} catch (e) {
  // Column already exists, safe to ignore
}

// Auto-migration: which teacher the student belongs to (NULL = main/admin teacher)
try {
  db.exec(`ALTER TABLE submissions ADD COLUMN teacher_id TEXT;`);
} catch (e) {
  // Column already exists, safe to ignore
}

// Load Lesson Data
const lessonPath = path.join(__dirname, 'data', 'lesson.json');
let lessonData = JSON.parse(fs.readFileSync(lessonPath, 'utf-8'));

// Load Section List (teacher-editable from the dashboard; students pick from it)
const sectionsPath = path.join(__dirname, 'data', 'sections.json');
const DEFAULT_SECTIONS = ['11 - STEM A', '11 - STEM B', '11 - HUMSS A', '11 - HUMSS B', '11 - ABM', '11 - TVL'];

function readSections() {
  try {
    const list = JSON.parse(fs.readFileSync(sectionsPath, 'utf-8'));
    if (Array.isArray(list)) return list;
  } catch (e) {}
  return DEFAULT_SECTIONS;
}

// Main teacher's settings (whether their class session is open)
const settingsPath = path.join(__dirname, 'data', 'settings.json');

function readMainSettings() {
  try {
    const s = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    if (s && typeof s === 'object') return s;
  } catch (e) {}
  return { isOpen: true };
}

// Teacher list (made by the main teacher; each has a secret login code and a public student link)
const teachersPath = path.join(__dirname, 'data', 'teachers.json');
const MAIN_TEACHER = { id: 'main', name: 'Pangunahing Guro', isAdmin: true };

function readTeachers() {
  try {
    const list = JSON.parse(fs.readFileSync(teachersPath, 'utf-8'));
    if (Array.isArray(list)) return list;
  } catch (e) {}
  return [];
}

function writeTeachers(list) {
  fs.writeFileSync(teachersPath, JSON.stringify(list, null, 2), 'utf-8');
  saveToSheet('teachers', list);
}

/**
 * Google Sheet storage: the teacher's own Sheet is the permanent memory.
 * Render's disk is wiped on every restart, so on startup we pull the lesson, sections,
 * teachers and results back from the Sheet, and every change is copied to it.
 * Without SHEET_API_URL + SHEET_SECRET the app just uses the local files (for local testing).
 */
const SHEET_API_URL = (process.env.SHEET_API_URL || '').trim();
const SHEET_SECRET = (process.env.SHEET_SECRET || '').trim();
const sheetOn = !!(SHEET_API_URL && SHEET_SECRET);
let sheetReady = !sheetOn;
let resolveSheetReady;
const sheetReadyPromise = new Promise(r => { resolveSheetReady = r; });
if (!sheetOn) resolveSheetReady();

const dirtyData = {};        // key -> latest value still to be saved in the Sheet
const pendingResults = [];   // student results still to be saved in the Sheet
let flushing = false;
let retryTimer = null;

async function sheetCall(action, payload = {}) {
  const r = await fetch(SHEET_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: SHEET_SECRET, action, ...payload }),
    redirect: 'follow',
    signal: AbortSignal.timeout(30000)
  });
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); } catch (e) {
    throw new Error('Sheet replied with non-JSON (check deployment access): ' + text.slice(0, 80));
  }
  if (!data.ok) throw new Error(data.error || 'Sheet error');
  return data;
}

function saveToSheet(key, value) {
  if (!sheetOn) return;
  dirtyData[key] = value;
  flushSheet();
}

function queueResultForSheet(row) {
  if (!sheetOn) return;
  pendingResults.push(row);
  flushSheet();
}

// Sends queued changes one at a time (keeps their order); retries every minute on failure
async function flushSheet() {
  if (!sheetReady || flushing) return;
  flushing = true;
  let failed = false;
  // Student results first; one failing item never holds up the others
  try {
    while (pendingResults.length) {
      await sheetCall('addResult', { result: pendingResults[0] });
      pendingResults.shift();
    }
  } catch (err) {
    failed = true;
    console.warn('⚠️ Google Sheet result save failed, retrying in 1 min:', err.message);
  }
  for (const key of Object.keys(dirtyData)) {
    const value = dirtyData[key];
    try {
      await sheetCall('setData', { key, value: JSON.stringify(value) });
      if (dirtyData[key] === value) delete dirtyData[key];
    } catch (err) {
      failed = true;
      console.warn(`⚠️ Google Sheet save failed (${key}), retrying in 1 min:`, err.message);
    }
  }
  flushing = false;

  if (Object.keys(dirtyData).length || pendingResults.length) {
    if (!failed) return flushSheet(); // new changes arrived while saving
    if (!retryTimer) retryTimer = setTimeout(() => { retryTimer = null; flushSheet(); }, 60000);
  }
}

async function loadFromSheet() {
  const res = await sheetCall('load');
  const d = res.data || {};

  if (d.lesson) {
    lessonData = JSON.parse(d.lesson);
    fs.writeFileSync(lessonPath, JSON.stringify(lessonData, null, 2), 'utf-8');
  } else {
    dirtyData.lesson = lessonData; // first run: copy the current lesson into the Sheet
  }

  if (d.mainSettings) {
    fs.writeFileSync(settingsPath, JSON.stringify(JSON.parse(d.mainSettings), null, 2), 'utf-8');
  } else {
    dirtyData.mainSettings = readMainSettings();
  }

  if (d.mainSections) {
    fs.writeFileSync(sectionsPath, JSON.stringify(JSON.parse(d.mainSections), null, 2), 'utf-8');
  } else {
    dirtyData.mainSections = readSections();
  }

  if (d.teachers) {
    fs.writeFileSync(teachersPath, JSON.stringify(JSON.parse(d.teachers), null, 2), 'utf-8');
  } else {
    dirtyData.teachers = readTeachers();
  }

  const insert = db.prepare(`
    INSERT OR IGNORE INTO submissions (submission_id, lesson_id, student_name, section, score, total_questions, answers_json, teacher_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  let restored = 0;
  (res.results || []).forEach(r => {
    if (!r.submissionId) return;
    const created = r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 19).replace('T', ' ') : null;
    const out = insert.run(String(r.submissionId), String(r.lessonId || lessonData.id), String(r.studentName || ''),
      String(r.section || ''), Number(r.score) || 0, Number(r.total) || 0,
      typeof r.answers === 'string' ? r.answers : JSON.stringify(r.answers || {}),
      r.teacherId ? String(r.teacherId) : null, created);
    restored += out.changes;
  });

  sheetReady = true;
  resolveSheetReady();
  console.log(`✓ Loaded from Google Sheet (${res.sheetName || 'Sheet'}): ${restored} result(s) restored`);
  flushSheet();
}

function connectSheet() {
  loadFromSheet().catch(err => {
    console.warn('⚠️ Cannot load from Google Sheet, retrying in 20 s:', err.message);
    setTimeout(connectSheet, 20000);
  });
}

// While the Sheet is loading after a restart, hold API requests briefly so nobody sees old data
app.use('/api', (req, res, next) => {
  if (sheetReady) return next();
  Promise.race([sheetReadyPromise, new Promise(r => setTimeout(r, 25000))]).then(() => next());
});

// Changes are refused until the Sheet has loaded, so old data never overwrites the Sheet
function requireSheetReady(req, res, next) {
  if (sheetReady) return next();
  res.status(503).json({ error: 'Kumokonekta pa sa Google Sheet. Pakisubukang muli makalipas ang ilang segundo.' });
}

function randomChars(n) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O or 1/I look-alikes
  let out = '';
  for (let i = 0; i < n; i++) out += alphabet[crypto.randomInt(alphabet.length)];
  return out;
}

// Finds the teacher behind a public student link (?guro=...). No link = main teacher.
function teacherFromLink(slug) {
  if (!slug) return MAIN_TEACHER;
  return readTeachers().find(t => t.slug === String(slug).toLowerCase()) || null;
}

function cleanSectionList(sections) {
  const clean = [];
  sections.forEach(s => {
    if (typeof s !== 'string') return;
    const name = s.replace(/\s+/g, ' ').trim().slice(0, 60);
    if (name && !clean.some(c => c.toLowerCase() === name.toLowerCase())) clean.push(name);
  });
  return clean.slice(0, 100);
}

/**
 * GET /api/sections?guro=<link>
 * Returns the section choices (and teacher name) shown to that teacher's students
 */
app.get('/api/sections', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  const teacher = teacherFromLink(req.query.guro);
  if (!teacher) {
    return res.status(404).json({ error: 'Hindi kilala ang link ng guro. Hingin muli ang tamang link sa iyong guro.' });
  }
  if (teacher.isAdmin) return res.json({ sections: readSections(), teacherName: '', isOpen: readMainSettings().isOpen !== false });
  res.json({ sections: teacher.sections || [], teacherName: teacher.name, isOpen: teacher.isOpen !== false });
});

/**
 * POST /api/admin/sections
 * Saves the section list typed by the logged-in teacher in the dashboard
 */
app.post('/api/admin/sections', verifyTeacherPin, requireSheetReady, (req, res) => {
  const { sections } = req.body;
  if (!Array.isArray(sections)) {
    return res.status(400).json({ error: 'Kailangan ang listahan ng mga seksiyon.' });
  }

  const clean = cleanSectionList(sections);
  if (req.teacher.isAdmin) {
    fs.writeFileSync(sectionsPath, JSON.stringify(clean, null, 2), 'utf-8');
    saveToSheet('mainSections', clean);
  } else {
    const list = readTeachers();
    const me = list.find(t => t.id === req.teacher.id);
    if (!me) return res.status(401).json({ error: 'Hindi wasto ang code.' });
    me.sections = clean;
    writeTeachers(list);
  }
  res.json({ success: true, sections: clean });
});

/**
 * GET /api/admin/me
 * Who is logged in, and their student link
 */
app.get('/api/admin/me', verifyTeacherPin, (req, res) => {
  const t = req.teacher;
  const isOpen = t.isAdmin ? readMainSettings().isOpen !== false : t.isOpen !== false;
  res.json({ id: t.id, name: t.name, isAdmin: !!t.isAdmin, slug: t.slug || '', isOpen });
});

/**
 * POST /api/admin/session
 * Opens or closes the logged-in teacher's class session (closed = students cannot start)
 */
app.post('/api/admin/session', verifyTeacherPin, requireSheetReady, (req, res) => {
  const isOpen = req.body.isOpen === true;
  if (req.teacher.isAdmin) {
    const settings = { ...readMainSettings(), isOpen };
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
    saveToSheet('mainSettings', settings);
  } else {
    const list = readTeachers();
    const me = list.find(t => t.id === req.teacher.id);
    if (!me) return res.status(401).json({ error: 'Hindi wasto ang code.' });
    me.isOpen = isOpen;
    writeTeachers(list);
  }
  res.json({ success: true, isOpen });
});

/**
 * Teacher list (main teacher only)
 */
app.get('/api/admin/teachers', verifyTeacherPin, requireAdmin, (req, res) => {
  const counts = {};
  try {
    db.prepare('SELECT teacher_id, COUNT(*) AS n FROM submissions WHERE lesson_id = ? GROUP BY teacher_id')
      .all(lessonData.id)
      .forEach(r => { counts[r.teacher_id] = r.n; });
  } catch (e) {}
  res.json({
    teachers: readTeachers().map(t => ({ id: t.id, name: t.name, code: t.code, slug: t.slug, students: counts[t.id] || 0 }))
  });
});

app.post('/api/admin/teachers', verifyTeacherPin, requireAdmin, requireSheetReady, (req, res) => {
  const name = String(req.body.name || '').replace(/\s+/g, ' ').trim().slice(0, 60);
  if (!name) return res.status(400).json({ error: 'Ilagay ang pangalan ng guro.' });

  const list = readTeachers();
  if (list.some(t => t.name.toLowerCase() === name.toLowerCase())) {
    return res.status(400).json({ error: `Nasa listahan na si "${name}".` });
  }

  // Readable prefix from the surname, e.g. "Ma'am Santos" -> SANTOS
  const words = name.toUpperCase().replace(/[^A-Z\s]/g, '').split(/\s+/).filter(Boolean);
  const prefix = (words[words.length - 1] || 'GURO').slice(0, 8);

  let code, slug;
  do { code = `${prefix}-${randomChars(4)}`; } while (code === TEACHER_PIN || list.some(t => t.code === code));
  do { slug = `${prefix.toLowerCase()}-${randomChars(4).toLowerCase()}`; } while (list.some(t => t.slug === slug));

  const teacher = { id: 't_' + Date.now().toString(36), name, code, slug, sections: [...DEFAULT_SECTIONS], createdAt: new Date().toISOString() };
  list.push(teacher);
  writeTeachers(list);
  res.json({ success: true, teacher: { id: teacher.id, name, code, slug, students: 0 } });
});

app.delete('/api/admin/teachers/:id', verifyTeacherPin, requireAdmin, requireSheetReady, (req, res) => {
  const list = readTeachers();
  const next = list.filter(t => t.id !== req.params.id);
  if (next.length === list.length) return res.status(404).json({ error: 'Hindi nakita ang guro.' });
  writeTeachers(next);
  res.json({ success: true });
});

/**
 * POST /api/studio/save-lesson
 * Saves lesson configuration from the No-Code Studio
 */
app.post('/api/studio/save-lesson', verifyTeacherPin, requireAdmin, requireSheetReady, (req, res) => {
  const { title, subject, description, videoType, youtubeId, sheetWebhookUrl, checkpoints } = req.body;

  if (!title || !youtubeId || !checkpoints || !checkpoints.length) {
    return res.status(400).json({ error: 'Pamagat, YouTube ID, at hindi bababa sa isang checkpoint ang kinakailangan.' });
  }

  const updatedLesson = {
    id: lessonData.id || 'pklp-aralin-1',
    title: title.trim(),
    subject: (subject || 'Baitang 11 - PKLP').trim(),
    description: (description || 'Panoorin ang aralin at sagutin ang mga katanungan.').trim(),
    videoType: videoType || 'youtube',
    youtubeId: youtubeId.trim(),
    sheetWebhookUrl: (sheetWebhookUrl || '').trim(),
    checkpoints: checkpoints.map((cp, idx) => ({
      id: cp.id || `cp${idx + 1}`,
      t: Number(cp.t || cp.timestamp || 0),
      question: cp.question.trim(),
      options: cp.options,
      correctAnswer: cp.correctAnswer,
      feedbackCorrect: cp.feedbackCorrect || 'Magaling! Tumpak ang iyong sagot.',
      feedbackIncorrect: cp.feedbackIncorrect || 'Maling sagot. Pakisuri muli ang konsepto sa aralin.'
    }))
  };

  fs.writeFileSync(lessonPath, JSON.stringify(updatedLesson, null, 2), 'utf-8');
  lessonData = updatedLesson;
  saveToSheet('lesson', updatedLesson);

  res.json({
    success: true,
    message: 'Matagumpay na na-save ang aralin!',
    lesson: updatedLesson
  });
});

/**
 * GET /api/admin/lesson
 * Returns full lesson with answer keys (Teacher only)
 */
app.get('/api/admin/lesson', verifyTeacherPin, requireAdmin, (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  try {
    lessonData = JSON.parse(fs.readFileSync(lessonPath, 'utf-8'));
  } catch (e) {}
  res.json(lessonData);
});

/**
 * POST /api/voice/transform
 * Transforms input audio base64 with character pitch/tone presets directly using ffmpeg-static
 */
app.post('/api/voice/transform', (req, res) => {
  try {
    const { audioBase64, preset, semitones, speed } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'Walang audio data na natanggap.' });
    }

    const tempDir = path.join(__dirname, 'public', 'video_assets');
    fs.mkdirSync(tempDir, { recursive: true });

    const stamp = Date.now();
    const inputPath = path.join(tempDir, `temp_rec_${stamp}_in.webm`);
    const outputPath = path.join(tempDir, `temp_rec_${stamp}_out.mp3`);

    const cleanB64 = audioBase64.replace(/^data:audio\/\w+;base64,/, '');
    fs.writeFileSync(inputPath, Buffer.from(cleanB64, 'base64'));

    let filterStr = '';
    const p = preset || 'old_man';
    const s = Number(speed) || 1.0;
    const semi = Number(semitones) || 0;

    if (p === 'old_man') {
      filterStr = 'asetrate=44100*0.78,atempo=1.28,equalizer=f=200:width_type=o:width=1.2:g=5,equalizer=f=3500:width_type=o:width=1:g=-3';
    } else if (p === 'old_lady') {
      filterStr = 'asetrate=44100*0.90,atempo=1.11,equalizer=f=350:width_type=o:width=1:g=3,equalizer=f=3000:width_type=o:width=1:g=-2,tremolo=f=4.5:d=0.2';
    } else if (p === 'boy') {
      filterStr = 'asetrate=44100*1.25,atempo=0.8,equalizer=f=250:width_type=o:width=1:g=-4,equalizer=f=2400:width_type=o:width=1:g=3';
    } else if (p === 'narrator') {
      filterStr = 'equalizer=f=120:width_type=o:width=1:g=4,equalizer=f=4500:width_type=o:width=1:g=3,acompressor=threshold=-18dB:ratio=3:attack=5:release=50';
    } else {
      const factor = Math.pow(2, semi / 12);
      const tempoComp = (1 / factor) * s;
      const atempoFilters = [];
      let rem = tempoComp;
      while (rem > 2.0) { atempoFilters.push('atempo=2.0'); rem /= 2.0; }
      while (rem < 0.5) { atempoFilters.push('atempo=0.5'); rem /= 0.5; }
      atempoFilters.push(`atempo=${rem.toFixed(4)}`);
      filterStr = `asetrate=44100*${factor.toFixed(4)},${atempoFilters.join(',')}`;
    }

    const ffmpegArgs = [
      '-y',
      '-i', inputPath,
      '-af', filterStr,
      '-c:a', 'libmp3lame',
      '-b:a', '192k',
      outputPath
    ];

    const child = spawn(ffmpegPath, ffmpegArgs);
    let stderr = '';
    child.stderr.on('data', chunk => { stderr += chunk.toString(); });

    child.on('close', (code) => {
      try { fs.unlinkSync(inputPath); } catch (e) {}

      if (code !== 0 || !fs.existsSync(outputPath)) {
        console.error('FFmpeg error:', code, stderr);
        return res.status(500).json({ error: 'Nabigo ang pag-transform ng boses: ' + stderr.slice(-150) });
      }

      const outBuffer = fs.readFileSync(outputPath);
      const outB64 = outBuffer.toString('base64');
      try { fs.unlinkSync(outputPath); } catch (e) {}

      res.json({
        success: true,
        audioBase64: `data:audio/mp3;base64,${outB64}`
      });
    });
  } catch (err) {
    console.error('Error in /api/voice/transform:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Route: Root redirects to /play.html (Audit Compliant YouTube Runner)
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'play.html'));
});

/**
 * GET /api/lesson
 * Returns sanitized lesson data without answer keys (Anti-tamper)
 */
app.get('/api/lesson', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  // Re-read fresh from disk in case updated by studio
  try {
    lessonData = JSON.parse(fs.readFileSync(lessonPath, 'utf-8'));
  } catch (e) {}

  const sanitizedCheckpoints = lessonData.checkpoints.map(cp => ({
    id: cp.id,
    timestamp: cp.t || cp.timestamp,
    t: cp.t || cp.timestamp,
    question: cp.question,
    options: cp.options
  }));

  res.json({
    id: lessonData.id,
    title: lessonData.title,
    subject: lessonData.subject,
    description: lessonData.description,
    videoType: lessonData.videoType || 'youtube',
    youtubeId: lessonData.youtubeId || 'jNQXAC9IVRw',
    videoUrl: lessonData.videoUrl || '/sample.mp4',
    checkpoints: sanitizedCheckpoints
  });
});

/**
 * POST /api/checkpoints/verify
 * Server-side evaluation of student answers
 */
app.post('/api/checkpoints/verify', (req, res) => {
  const { checkpointId, selectedOption } = req.body;
  if (!checkpointId || !selectedOption) {
    return res.status(400).json({ error: 'Missing checkpointId or selectedOption' });
  }

  const cp = lessonData.checkpoints.find(c => c.id === checkpointId);
  if (!cp) {
    return res.status(404).json({ error: 'Checkpoint not found' });
  }

  const isCorrect = cp.correctAnswer === selectedOption;
  const feedback = isCorrect ? cp.feedbackCorrect : cp.feedbackIncorrect;

  res.json({
    isCorrect,
    feedback
  });
});

/**
 * POST /api/submissions
 * Saves student results with deduplication and dispatches to Google Sheet Webhook if configured
 */
app.post('/api/submissions', async (req, res) => {
  const { submissionId, studentName, section, answers, guro } = req.body;

  if (!studentName || !section || !answers) {
    return res.status(400).json({ error: 'Pangalan, seksiyon, at mga sagot ay kinakailangan.' });
  }

  // Always re-read fresh lesson configuration from disk
  try {
    lessonData = JSON.parse(fs.readFileSync(lessonPath, 'utf-8'));
  } catch (e) {}

  const subId = submissionId || ('sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));

  // Deduplication check
  try {
    const existing = db.prepare('SELECT id, score, total_questions FROM submissions WHERE submission_id = ?').get(subId);
    if (existing) {
      return res.json({
        success: true,
        score: existing.score,
        total: existing.total_questions,
        percentage: Math.round((existing.score / existing.total_questions) * 100),
        duplicate: true
      });
    }
  } catch (err) {}

  // Whose student is this? (unknown/removed link falls back to the main teacher so no score is lost)
  const teacher = teacherFromLink(guro) || MAIN_TEACHER;
  const teacherId = teacher.isAdmin ? null : teacher.id;

  // Calculate score securely
  let score = 0;
  const total = lessonData.checkpoints.length;
  const breakdown = {};

  lessonData.checkpoints.forEach(cp => {
    const studentChoice = answers[cp.id];
    const isCorrect = studentChoice === cp.correctAnswer;
    if (isCorrect) score++;
    breakdown[cp.id] = {
      selected: studentChoice,
      correct: isCorrect
    };
  });

  const percentage = Math.round((score / total) * 100);

  // 1. Save to SQLite
  try {
    const insertStmt = db.prepare(`
      INSERT INTO submissions (submission_id, lesson_id, student_name, section, score, total_questions, answers_json, teacher_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      subId,
      lessonData.id,
      studentName.trim(),
      section.trim(),
      score,
      total,
      JSON.stringify(breakdown),
      teacherId
    );
  } catch (dbErr) {
    console.error('Database write error:', dbErr.message);
  }

  // 2. Permanent copy in the Google Sheet (also fills the per-section tabs)
  queueResultForSheet({
    submissionId: subId,
    createdAt: new Date().toISOString(),
    lessonId: lessonData.id,
    teacherId: teacherId || '',
    teacherName: teacher.isAdmin ? '' : teacher.name,
    studentName: studentName.trim(),
    section: section.trim(),
    score,
    total,
    answers: JSON.stringify(breakdown)
  });

  // 3. Old webhook (only when Sheet storage is not set up, so rows are not written twice)
  if (!sheetOn && lessonData.sheetWebhookUrl && lessonData.sheetWebhookUrl.startsWith('https://script.google.com')) {
    try {
      const sheetRes = await fetch(lessonData.sheetWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: subId,
          studentName: studentName.trim(),
          section: section.trim(),
          teacher: teacher.isAdmin ? '' : teacher.name,
          score,
          total,
          percentage: `${percentage}%`
        }),
        redirect: 'follow'
      });

      const responseText = await sheetRes.text();
      let sheetJson = null;
      try {
        sheetJson = JSON.parse(responseText);
      } catch (parseErr) {
        console.warn('Google Sheet returned non-JSON (likely sign-in or permission error):', responseText.substring(0, 100));
      }

      if (sheetJson && sheetJson.ok) {
        console.log(`✓ Google Sheet sync SUCCESS -> Section: [${sheetJson.section || section}], Sheet: [${sheetJson.connectedTo || 'Default'}]`);
      } else {
        console.warn('⚠️ Google Sheet sync failed or rejected:', sheetJson ? sheetJson.error : 'Invalid response');
      }
    } catch (sheetSyncErr) {
      console.warn('Google Sheet network sync error:', sheetSyncErr.message);
    }
  }

  res.json({
    success: true,
    studentName,
    section,
    score,
    total,
    percentage
  });
});

/**
 * Middleware: Verify teacher code (master PIN = main teacher, or a teacher's own code)
 */
function verifyTeacherPin(req, res, next) {
  const pin = String(req.headers['x-teacher-pin'] || req.query.pin || '').trim();
  if (pin && pin === TEACHER_PIN) {
    req.teacher = MAIN_TEACHER;
    return next();
  }
  const teacher = pin && readTeachers().find(t => t.code === pin.toUpperCase());
  if (!teacher) {
    return res.status(401).json({ error: 'Hindi wasto ang code.' });
  }
  req.teacher = teacher;
  next();
}

function requireAdmin(req, res, next) {
  if (!req.teacher || !req.teacher.isAdmin) {
    return res.status(403).json({ error: 'Para lamang sa pangunahing guro.' });
  }
  next();
}

// SQL filter so each teacher only sees their own students
function teacherWhere(teacher) {
  return teacher.isAdmin ? { sql: 'teacher_id IS NULL', args: [] } : { sql: 'teacher_id = ?', args: [teacher.id] };
}

/**
 * GET /api/admin/results
 */
app.get('/api/admin/results', verifyTeacherPin, (req, res) => {
  try {
    const query = db.prepare(`
      SELECT id, student_name, section, score, total_questions, answers_json, created_at
      FROM submissions
      WHERE lesson_id = ? AND ${teacherWhere(req.teacher).sql}
      ORDER BY id DESC
    `);

    const rows = query.all(lessonData.id, ...teacherWhere(req.teacher).args);
    const totalStudents = rows.length;
    const avgScore = totalStudents > 0 
      ? (rows.reduce((sum, r) => sum + r.score, 0) / totalStudents).toFixed(1)
      : 0;

    res.json({
      lessonTitle: lessonData.title,
      totalStudents,
      averageScore: avgScore,
      totalQuestions: lessonData.checkpoints ? lessonData.checkpoints.length : 3,
      checkpointIds: (lessonData.checkpoints || []).map(cp => cp.id),
      sheetWebhookUrl: lessonData.sheetWebhookUrl || '',
      submissions: rows.map(r => ({
        ...r,
        answers: JSON.parse(r.answers_json || '{}')
      }))
    });
  } catch (err) {
    console.error('Admin results query error:', err.message);
    res.json({
      lessonTitle: lessonData.title || 'PKLP Lesson',
      totalStudents: 0,
      averageScore: 0,
      totalQuestions: 3,
      checkpointIds: [],
      sheetWebhookUrl: '',
      submissions: []
    });
  }
});

/**
 * GET /api/admin/export-csv
 */
app.get('/api/admin/export-csv', verifyTeacherPin, (req, res) => {
  const query = db.prepare(`
    SELECT student_name, section, score, total_questions, answers_json, created_at
    FROM submissions
    WHERE lesson_id = ? AND ${teacherWhere(req.teacher).sql}
    ORDER BY section ASC, student_name ASC
  `);

  const rows = query.all(lessonData.id, ...teacherWhere(req.teacher).args);
  const cpIds = (lessonData.checkpoints || []).map(cp => cp.id);

  let csv = 'Pangalan ng Mag-aaral,Seksiyon,Iskor,Kabuuang Aytem,Bahagdan (%),'
    + cpIds.map((id, i) => `Q${i + 1} Tumpak?`).join(',') + ',Petsa ng Pagpasa\n';

  rows.forEach(r => {
    const answers = JSON.parse(r.answers_json);
    const marks = cpIds.map(id => (answers[id]?.correct ? 'OO' : 'HINDI')).join(',');
    const percent = Math.round((r.score / r.total_questions) * 100);
    const cleanName = `"${r.student_name.replace(/"/g, '""')}"`;
    const cleanSection = `"${r.section.replace(/"/g, '""')}"`;

    csv += `${cleanName},${cleanSection},${r.score},${r.total_questions},${percent}%,${marks},${r.created_at}\n`;
  });

  const fileTag = req.teacher.isAdmin ? '' : '_' + req.teacher.slug;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="Resulta_${lessonData.id}${fileTag}.csv"`);
  res.send('\uFEFF' + csv);
});

if (sheetOn) connectSheet();

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 PKLP Interactive Video Platform (Audit-Compliant)`);
  console.log(`📱 YouTube Runner: http://localhost:${PORT}/play.html`);
  console.log(`📊 Guro Dashboard: http://localhost:${PORT}/admin.html`);
  console.log(`🗂️  Google Sheet:   ${sheetOn ? 'connected storage' : 'not set (local files only)'}`);
  console.log(`=======================================================`);
});
