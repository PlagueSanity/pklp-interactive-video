// PKLP Interactive Video — Google Sheet storage + results webhook
// I-paste ito sa Extensions → Apps Script ng iyong Google Sheet.

// ===================== DALAWANG LINYA LANG ANG PAPALITAN =====================
// 1. Ang BUONG address ng Google Sheet mo (galing sa address bar).
const SHEET_URL = 'PASTE_THE_FULL_GOOGLE_SHEET_ADDRESS_HERE';
// 2. Ang lihim na susi (dapat kapareho ng SHEET_SECRET sa Render).
const SECRET = 'PASTE_THE_SECRET_KEY_HERE';
// ============================================================================

const DATA_TAB = '_Data';       // lesson, sections, settings, teachers (huwag galawin)
const RESULTS_TAB = '_Results'; // lahat ng resulta, para maibalik pagkatapos mag-restart ang site
const RESULT_COLS = ['Submission ID', 'Petsa (UTC)', 'Lesson ID', 'Teacher ID', 'Guro', 'Pangalan ng Mag-aaral',
  'Seksiyon', 'Iskor', 'Kabuuan', 'Mga Sagot (JSON)'];
const SECTION_HEADERS = ['Submission ID', 'Petsa at Oras', 'Pangalan ng Mag-aaral', 'Iskor', 'Kabuuan', 'Bahagdan (%)', 'Guro'];

function getSpreadsheet_() {
  const m = SHEET_URL.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (!m) throw new Error('SHEET_URL is not a Google Sheets address. Copy it from the address bar.');
  return SpreadsheetApp.openById(m[1]);
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Stop typed names like "=HYPERLINK(...)" from being run as formulas.
function cell_(v) {
  const s = String(v == null ? '' : v).trim().slice(0, 100);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function tab_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f1f5f9');
    sh.setFrozenRows(1);
  } else if (sh.getLastColumn() < headers.length) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  }
  return sh;
}

function findRow_(sh, id) {
  if (!id || sh.getLastRow() < 2) return null;
  return sh.getRange(2, 1, sh.getLastRow() - 1, 1).createTextFinder(String(id)).matchEntireCell(true).findNext();
}

// ---------- Actions used by the site ----------

function load_(ss) {
  const data = {};
  const dataSh = tab_(ss, DATA_TAB, ['Key', 'Value (JSON)', 'Updated']);
  if (dataSh.getLastRow() > 1) {
    dataSh.getRange(2, 1, dataSh.getLastRow() - 1, 2).getValues().forEach(r => {
      if (r[0]) data[String(r[0])] = String(r[1]);
    });
  }

  const resSh = tab_(ss, RESULTS_TAB, RESULT_COLS);
  const results = [];
  if (resSh.getLastRow() > 1) {
    resSh.getRange(2, 1, resSh.getLastRow() - 1, RESULT_COLS.length).getValues().forEach(r => {
      if (!r[0]) return;
      results.push({
        submissionId: String(r[0]),
        createdAt: r[1] instanceof Date ? r[1].toISOString() : String(r[1]),
        lessonId: String(r[2]), teacherId: String(r[3]), studentName: String(r[5]),
        section: String(r[6]), score: Number(r[7]), total: Number(r[8]), answers: String(r[9] || '{}')
      });
    });
  }
  return { ok: true, sheetName: ss.getName(), data, results };
}

function setData_(ss, key, value) {
  if (['lesson', 'mainSections', 'mainSettings', 'teachers'].indexOf(key) < 0) throw new Error('Unknown key: ' + key);
  const sh = tab_(ss, DATA_TAB, ['Key', 'Value (JSON)', 'Updated']);
  const found = findRow_(sh, key);
  const row = found ? found.getRow() : sh.getLastRow() + 1;
  sh.getRange(row, 1, 1, 3).setValues([[key, String(value), new Date()]]);
  return { ok: true, key };
}

function addResult_(ss, d) {
  const resSh = tab_(ss, RESULTS_TAB, RESULT_COLS);
  if (findRow_(resSh, d.submissionId)) return { ok: true, duplicate: true };
  resSh.appendRow([cell_(d.submissionId), d.createdAt ? new Date(d.createdAt) : new Date(), cell_(d.lessonId),
    cell_(d.teacherId), cell_(d.teacherName), cell_(d.studentName), cell_(d.section),
    Number(d.score), Number(d.total), String(d.answers || '{}')]);
  writeSectionRow_(ss, d);
  return { ok: true };
}

// Easy-to-read copy: one tab per section (same as the old webhook)
function writeSectionRow_(ss, d) {
  const name = String(d.section || '').replace(/\s+/g, ' ').trim().toUpperCase().slice(0, 50) || 'IBA PANG SEKSIYON';
  const sh = tab_(ss, name, SECTION_HEADERS);
  if (findRow_(sh, d.submissionId)) return { ok: true, duplicate: true, section: name };
  const score = Number(d.score), total = Number(d.total);
  const pct = total > 0 ? Math.round((score / total) * 100) + '%' : '';
  sh.appendRow([cell_(d.submissionId), new Date(), cell_(d.studentName), score, total, pct, cell_(d.teacher || d.teacherName)]);
  return { ok: true, section: name, sheetName: ss.getName() };
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const d = JSON.parse(e.postData.contents);
    lock.waitLock(20000);
    const ss = getSpreadsheet_();

    // Old webhook format (no action): just the per-section tab, as before
    if (!d.action) return json_(writeSectionRow_(ss, d));

    if (!SECRET || SECRET.indexOf('PASTE_') === 0 || d.secret !== SECRET) {
      return json_({ ok: false, error: 'Wrong secret' });
    }
    if (d.action === 'load') return json_(load_(ss));
    if (d.action === 'setData') return json_(setData_(ss, d.key, d.value));
    if (d.action === 'addResult') return json_(addResult_(ss, d.result || {}));
    return json_({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Open the web app URL in a browser to see which Sheet it is connected to.
function doGet() {
  try {
    const ss = getSpreadsheet_();
    return json_({ ok: true, message: 'PKLP storage is ready!', konektadoSa: ss.getName() });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// Run this once from the editor: it asks for permission and creates the storage tabs.
function subukan() {
  const ss = getSpreadsheet_();
  tab_(ss, DATA_TAB, ['Key', 'Value (JSON)', 'Updated']);
  tab_(ss, RESULTS_TAB, RESULT_COLS);
  Logger.log('Handa na ang ' + ss.getName() + ' (' + ss.getUrl() + ')');
}
