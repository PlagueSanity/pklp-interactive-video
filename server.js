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
    lesson_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    section TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answers_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Load Lesson Data
const lessonPath = path.join(__dirname, 'data', 'lesson.json');
let lessonData = JSON.parse(fs.readFileSync(lessonPath, 'utf-8'));

/**
 * GET /api/lesson
 * Returns sanitized lesson data to students (stripping correct answers to prevent devtools inspection)
 */
app.get('/api/lesson', (req, res) => {
  const sanitizedCheckpoints = lessonData.checkpoints.map(cp => ({
    id: cp.id,
    timestamp: cp.timestamp,
    question: cp.question,
    options: cp.options
  }));

  res.json({
    id: lessonData.id,
    title: lessonData.title,
    subject: lessonData.subject,
    description: lessonData.description,
    videoUrl: lessonData.videoUrl,
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
 * Saves final student results to SQLite database
 */
app.post('/api/submissions', (req, res) => {
  const { studentName, section, answers } = req.body;

  if (!studentName || !section || !answers) {
    return res.status(400).json({ error: 'Pangalan, seksiyon, at mga sagot ay kinakailangan.' });
  }

  // Calculate score securely on the server
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

  const insertStmt = db.prepare(`
    INSERT INTO submissions (lesson_id, student_name, section, score, total_questions, answers_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertStmt.run(
    lessonData.id,
    studentName.trim(),
    section.trim(),
    score,
    total,
    JSON.stringify(breakdown)
  );

  res.json({
    success: true,
    studentName,
    section,
    score,
    total,
    percentage: Math.round((score / total) * 100)
  });
});

/**
 * Middleware: Simple Teacher PIN Check
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
 * Returns all student submissions and summary stats
 */
app.get('/api/admin/results', verifyTeacherPin, (req, res) => {
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
    totalQuestions: lessonData.checkpoints.length,
    submissions: rows.map(r => ({
      ...r,
      answers: JSON.parse(r.answers_json)
    }))
  });
});

/**
 * GET /api/admin/export-csv
 * Exports student scores to CSV for DepEd Class Record / Excel
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
  res.send('\uFEFF' + csv); // Include BOM for proper Excel UTF-8 display
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 PKLP Interactive Video Platform is running!`);
  console.log(`📱 Student View:   http://localhost:${PORT}`);
  console.log(`📊 Guro Dashboard: http://localhost:${PORT}/admin.html`);
  console.log(`🔑 Teacher PIN:    ${TEACHER_PIN}`);
  console.log(`=======================================================`);
});
