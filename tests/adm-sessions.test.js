const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const { once } = require('node:events');

test('independent ADM sessions, teacher isolation, and restart persistence', async t => {
  const root = path.resolve(__dirname, '..');
  fs.mkdirSync(path.join(root, '.artifacts'), {recursive:true});
  const data = fs.mkdtempSync(path.join(root, '.artifacts', 'adm-test-'));
  const first = { id: 'legacy-lesson', title: 'First ADM', youtubeId: 'jNQXAC9IVRw',
    checkpoints: [{ id: 'cp1', t: 1, question: 'First question?',
      options: [{id:'A',text:'Yes'},{id:'B',text:'No'}], correctAnswer: 'A' }] };
  fs.writeFileSync(path.join(data, 'lesson.json'), JSON.stringify(first));
  fs.writeFileSync(path.join(data, 'settings.json'), JSON.stringify({isOpen:true}));
  fs.writeFileSync(path.join(data, 'teachers.json'), JSON.stringify([
    {id:'teacher-a',code:'TEST-A',slug:'teacher-a',name:'Teacher A',isOpen:true,resultsSheetUrl:'https://docs.google.com/spreadsheets/d/test-sheet'},
    {id:'teacher-b',code:'TEST-B',slug:'teacher-b',name:'Teacher B',isOpen:true,resultsSheetUrl:'https://docs.google.com/spreadsheets/d/test-sheet-b'}
  ]));
  const port = await new Promise(resolve => {
    const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const port=s.address().port; s.close(() => resolve(port)); });
  });
  let child;
  async function start() {
    let output='';
    child = spawn(process.execPath, ['server.js'], { cwd:root, windowsHide:true,
      env:{...process.env,PORT:String(port),DATA_DIR:data,TEACHER_PIN:'TEST-MAIN',SHEET_API_URL:'',SHEET_SECRET:''}, stdio:['ignore','pipe','pipe'] });
    child.stdout.on('data', chunk => { output+=chunk; });
    child.stderr.on('data', chunk => { output+=chunk; });
    for (let i=0;i<100;i++) {
      if (child.exitCode !== null) throw new Error('Test server exited: ' + child.exitCode);
      try { if ((await fetch(`http://127.0.0.1:${port}/api/lesson`)).ok) return; } catch (_) {}
      await new Promise(r => setTimeout(r,50));
    }
    throw new Error('Test server failed to start: '+output);
  }
  async function stop() { const ended=once(child,'exit'); child.kill(); await ended; }
  t.after(async () => { if(child?.exitCode === null) await stop(); });
  async function api(url, {pin='TEST-MAIN',body,method,language='en'}={}) {
    const r=await fetch(`http://127.0.0.1:${port}${url}`, {method:method || (body?'POST':'GET'),
      headers:{'x-teacher-pin':pin,'Content-Type':'application/json','Accept-Language':language},body:body?JSON.stringify(body):undefined});
    const value=r.headers.get('content-type')?.includes('application/json')?await r.json():await r.text();
    return {status:r.status,value};
  }
  await start();
  assert.equal((await api('/api/admin/me',{pin:'INVALID'})).value.error,'Invalid code.');
  assert.equal((await api('/api/admin/me',{pin:'INVALID',language:'fil'})).value.error,'Hindi wasto ang code.');
  assert.equal((await api('/api/admin/sections',{body:{sections:null}})).value.error,'A section list is required.');
  assert.equal((await api('/api/admin/sections',{body:{sections:null},language:'fil'})).value.error,'Kailangan ang listahan ng mga seksiyon.');
  assert.equal((await api('/api/admin/teachers',{body:{name:''}})).value.error,"Enter the teacher's name.");
  assert.equal((await api('/api/sections')).value.isOpen,true, 'legacy links keep their state');
  const duplicate=await api('/api/admin/duplicate-lesson', {body:{title:'Second ADM'}});
  assert.equal(duplicate.status,201);
  const second=duplicate.value.lesson.id;
  const q='?lesson='+encodeURIComponent(second);
  assert.equal((await api('/api/sections'+q)).value.isOpen,false,'new ADMs start closed');
  assert.equal((await api('/api/admin/results'+q)).value.totalStudents,0,'no copied records');
  await api('/api/admin/session'+q,{body:{isOpen:true}});
  await api('/api/admin/session',{body:{isOpen:false}});
  assert.equal((await api('/api/sections')).value.isOpen,false);
  assert.equal((await api('/api/sections'+q)).value.isOpen,true,'closing first leaves second open');
  assert.equal((await api('/api/admin/me'+q)).value.isOpen,true);
  await api('/api/admin/session'+q,{pin:'TEST-A',body:{isOpen:true}});
  assert.equal((await api('/api/sections'+q+'&guro=teacher-a')).value.isOpen,true);
  assert.equal((await api('/api/sections'+q+'&guro=teacher-b')).value.isOpen,false,'another teacher stays closed');
  assert.equal((await api('/api/admin/duplicate-lesson'+q,{pin:'TEST-A',body:{title:'Denied'}})).status,403);
  assert.equal((await api('/api/admin/session?lesson=missing',{body:{isOpen:true}})).status,404);
  const edited={...duplicate.value.lesson,title:'Second independent video',youtubeId:'PP9m-tVOHVk'};
  assert.equal((await api('/api/studio/save-lesson'+q,{body:edited})).status,200);
  assert.equal((await api('/api/lesson')).value.youtubeId,first.youtubeId);
  assert.equal((await api('/api/lesson'+q)).value.youtubeId,edited.youtubeId);
  assert.equal((await api('/api/lesson'+q)).value.checkpoints[0].correctAnswer,undefined,'no public answer keys');
  assert.equal((await api('/api/submissions',{body:{lessonId:second,submissionId:'test-second',studentName:'Test Student',section:'Test Section',answers:{cp1:'A'}}})).status,200);
  assert.equal((await api('/api/submissions',{body:{lessonId:second,guro:'teacher-a',submissionId:'test-teacher-a',studentName:'Teacher A Student',section:'Test Section',answers:{cp1:'B'}}})).status,200);
  assert.equal((await api('/api/admin/results')).value.totalStudents,0);
  assert.equal((await api('/api/admin/results'+q)).value.totalStudents,1);
  assert.equal((await api('/api/admin/results'+q,{pin:'TEST-A'})).value.totalStudents,1);
  assert.equal((await api('/api/admin/results'+q,{pin:'TEST-B'})).value.totalStudents,0);
  assert.equal((await api('/api/admin/teachers'+q)).value.teachers.find(t=>t.id==='teacher-a').students,1);
  const csv=(await api('/api/admin/export-csv'+q)).value;
  assert.match(csv,/Test Student/); assert.doesNotMatch(csv,/Teacher A Student/);
  await stop(); await start();
  assert.equal((await api('/api/sections')).value.isOpen,false);
  assert.equal((await api('/api/sections'+q)).value.isOpen,true);
  assert.equal((await api('/api/sections'+q+'&guro=teacher-a')).value.isOpen,true);
  assert.equal((await api('/api/admin/results'+q)).value.totalStudents,1);
  assert.equal((await api('/api/lesson'+q)).value.youtubeId,edited.youtubeId);
  const library=(await api('/api/admin/lessons')).value.lessons;
  assert.equal(library.length,2); assert.equal(library.find(l=>l.id===second).isOpen,true);
});
