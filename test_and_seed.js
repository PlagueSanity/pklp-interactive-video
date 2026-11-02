async function runTests() {
  const base = 'http://localhost:3000';
  console.log('1. Testing GET /api/lesson...');
  const resLesson = await fetch(`${base}/api/lesson`);
  const lesson = await resLesson.json();
  console.log('✓ Lesson Title:', lesson.title);
  console.log('✓ Checkpoints count:', lesson.checkpoints.length);

  console.log('\n2. Testing POST /api/checkpoints/verify...');
  const resVerify = await fetch(`${base}/api/checkpoints/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checkpointId: 'cp1', selectedOption: 'A' })
  });
  const verifyData = await resVerify.json();
  console.log('✓ Verify result:', verifyData);

  console.log('\n3. Seeding sample student responses...');
  const sampleStudents = [
    { name: 'Dela Cruz, Juan', section: '11 - STEM A', answers: { cp1: 'A', cp2: 'B', cp3: 'A' } },
    { name: 'Santos, Maria Clara', section: '11 - STEM A', answers: { cp1: 'A', cp2: 'A', cp3: 'A' } },
    { name: 'Reyes, Mark Anthony', section: '11 - HUMSS B', answers: { cp1: 'B', cp2: 'B', cp3: 'A' } },
    { name: 'Bautista, Princess', section: '11 - TVL', answers: { cp1: 'A', cp2: 'B', cp3: 'B' } }
  ];

  for (const s of sampleStudents) {
    const res = await fetch(`${base}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: s.name,
        section: s.section,
        answers: s.answers
      })
    });
    const data = await res.json();
    console.log(`✓ Seeded ${s.name}: Score ${data.score}/${data.total} (${data.percentage}%)`);
  }

  console.log('\n4. Testing GET /api/admin/results...');
  const resAdmin = await fetch(`${base}/api/admin/results?pin=1234`);
  const adminData = await resAdmin.json();
  console.log('✓ Admin Stats:', {
    totalStudents: adminData.totalStudents,
    averageScore: adminData.averageScore,
    passRate: `${Math.round((adminData.submissions.filter(s => s.score >= 2).length / adminData.totalStudents) * 100)}%`
  });

  console.log('\n5. Testing CSV Export...');
  const resCsv = await fetch(`${base}/api/admin/export-csv?pin=1234`);
  const csvText = await resCsv.text();
  console.log('✓ CSV Header and sample line:\n', csvText.split('\n').slice(0, 3).join('\n'));
}

runTests().catch(console.error);
