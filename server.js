const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const PORT = process.env.PORT || 3000;
const TEACHER_PIN = process.env.TEACHER_PIN || '1234';

app.use(cors());
app.use(express.json());
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

// Load Lesson Data
const lessonPath = path.join(__dirname, 'data', 'lesson.json');
let lessonData = JSON.parse(fs.readFileSync(lessonPath, 'utf-8'));

/**
 * POST /api/studio/save-lesson
 * Saves lesson configuration from the No-Code Studio
 */
app.post('/api/studio/save-lesson', verifyTeacherPin, (req, res) => {
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
app.get('/api/admin/lesson', verifyTeacherPin, (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  try {
    lessonData = JSON.parse(fs.readFileSync(lessonPath, 'utf-8'));
  } catch (e) {}
  res.json(lessonData);
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
  const { submissionId, studentName, section, answers } = req.body;

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
      INSERT INTO submissions (submission_id, lesson_id, student_name, section, score, total_questions, answers_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      subId,
      lessonData.id,
      studentName.trim(),
      section.trim(),
      score,
      total,
      JSON.stringify(breakdown)
    );
  } catch (dbErr) {
    console.error('Database write error:', dbErr.message);
  }

  // 2. Dispatch to Google Sheets Webhook if configured (Awaited with redirect: follow)
  if (lessonData.sheetWebhookUrl && lessonData.sheetWebhookUrl.startsWith('https://script.google.com')) {
    try {
      const sheetRes = await fetch(lessonData.sheetWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: subId,
          studentName: studentName.trim(),
          section: section.trim(),
          score,
          total,
          percentage: `${percentage}%`
        }),
        redirect: 'follow'
      });
      const sheetJson = await sheetRes.json().catch(() => ({}));
      console.log('Google Sheet webhook sync success:', sheetJson);
    } catch (sheetSyncErr) {
      console.warn('Google Sheet sync notice:', sheetSyncErr.message);
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
 * Middleware: Verify Teacher PIN
 */
function verifyTeacherPin(req, res, next) {
  const pin = req.headers['x-teacher-pin'] || req.query.pin;
  if (pin !== TEACHER_PIN) {
    return res.status(401).json({ error: 'Hindi wasto ang Teacher PIN.' });
  }
  next();
}

/**
 * GET /api/admin/results
 */
app.get('/api/admin/results', verifyTeacherPin, (req, res) => {
  try {
    const query = db.prepare(`
      SELECT id, student_name, section, score, total_questions, answers_json, created_at
      FROM submissions
      WHERE lesson_id = ?
      ORDER BY id DESC
    `);

    const rows = query.all(lessonData.id);
    const totalStudents = rows.length;
    const avgScore = totalStudents > 0 
      ? (rows.reduce((sum, r) => sum + r.score, 0) / totalStudents).toFixed(1)
      : 0;

    res.json({
      lessonTitle: lessonData.title,
      totalStudents,
      averageScore: avgScore,
      totalQuestions: lessonData.checkpoints ? lessonData.checkpoints.length : 3,
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
    WHERE lesson_id = ?
    ORDER BY section ASC, student_name ASC
  `);

  const rows = query.all(lessonData.id);

  let csv = 'Pangalan ng Mag-aaral,Seksiyon,Iskor,Kabuuang Aytem,Bahagdan (%),Q1 Tumpak?,Q2 Tumpak?,Q3 Tumpak?,Petsa ng Pagpasa\n';

  rows.forEach(r => {
    const answers = JSON.parse(r.answers_json);
    const q1 = answers.cp1?.correct ? 'OO' : 'HINDI';
    const q2 = answers.cp2?.correct ? 'OO' : 'HINDI';
    const q3 = answers.cp3?.correct ? 'OO' : 'HINDI';
    const percent = Math.round((r.score / r.total_questions) * 100);
    const cleanName = `"${r.student_name.replace(/"/g, '""')}"`;
    const cleanSection = `"${r.section.replace(/"/g, '""')}"`;

    csv += `${cleanName},${cleanSection},${r.score},${r.total_questions},${percent}%,${q1},${q2},${q3},${r.created_at}\n`;
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="Resulta_${lessonData.id}.csv"`);
  res.send('\uFEFF' + csv);
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 PKLP Interactive Video Platform (Audit-Compliant)`);
  console.log(`📱 YouTube Runner: http://localhost:${PORT}/play.html`);
  console.log(`📊 Guro Dashboard: http://localhost:${PORT}/admin.html`);
  console.log(`🔑 Teacher PIN:    ${TEACHER_PIN}`);
  console.log(`=======================================================`);
});
