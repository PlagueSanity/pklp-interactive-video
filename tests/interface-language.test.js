const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, 'public', name), 'utf8').replace(/\r\n/g,'\n');
const filipino = /\b(?:guro|aralin|ilagay|hindi|maling|tamang|pangalan|seksiyon|pakisubukang|kailangan|buksan|isara|katanungan|burahin|tumpak|nakatapos|pagpipilian|kasalukuyang)\b/i;

test('dashboard has an English translation for every interface key', () => {
  const strings = vm.runInNewContext(read('admin.js')+';I18N', {document:{addEventListener(){}}});
  for (const key of Object.keys(strings.fil)) {
    assert.ok(strings.en[key], 'Missing English key: '+key);
    assert.doesNotMatch(strings.en[key],filipino, 'Non-English interface: '+key);
  }
  assert.doesNotMatch(read('admin.js'), /\|\| I18N\.fil\[key\]/, 'English must never fall back to Filipino');
});

test('teacher HTML uses English before scripts run', () => {
  for (const name of ['admin.html','adm.html','studio.html']) {
    const html=read(name).replace(/<!--[\s\S]*?-->/g,'').replace(/<style[\s\S]*?<\/style>/g,'');
    assert.doesNotMatch(html,filipino, name+' contains untranslated interface text');
    assert.match(html,/<html lang="en">/, name+' must default to English');
  }
});

test('studio and library normalize all registered labels into English', () => {
  const code=read('teacher-language.js');
  const strings=JSON.parse(code.slice(code.indexOf('  const strings = ')+18,code.indexOf(';\n  let language')));
  for (const saved of [null,'en','unexpected']) {
    const context={window:{},document:{addEventListener(){}},localStorage:{getItem(){return saved;}}};
    vm.runInNewContext(code,context);
    for (const [input,translations] of Object.entries(strings)) {
      assert.equal(context.window.teacherText(input),translations.en, input);
      assert.doesNotMatch(context.window.teacherText(input),filipino);
    }
  }
  const context={window:{},document:{addEventListener(){}},localStorage:{getItem(){return 'fil';}}};
  vm.runInNewContext(code,context);
  assert.equal(context.window.teacherText('Lesson title:'),'Pamagat ng Aralin:');
});

test('lesson requests explicitly carry the current language, with English as default', async () => {
  const requests=[];
  let selected=null;
  const context={URL,URLSearchParams,Headers,localStorage:{getItem(){return selected;}},
    location:new URL('https://example.test/admin.html?lesson=adm-2'),
    window:{fetch:async (...args)=>requests.push(args)}};
  vm.runInNewContext(read('lesson-context.js'),context);
  await context.window.fetch('/api/admin/sections', {headers:{'x-teacher-pin':'synthetic'}});
  assert.equal(requests.at(-1)[1].headers.get('Accept-Language'),'en');
  assert.equal(requests.at(-1)[1].headers.get('x-teacher-pin'),'synthetic');
  selected='fil'; await context.window.fetch('/api/admin/session');
  assert.equal(requests.at(-1)[1].headers.get('Accept-Language'),'fil');
  selected='en'; await context.window.fetch('/api/admin/session');
  assert.equal(requests.at(-1)[1].headers.get('Accept-Language'),'en');
});
