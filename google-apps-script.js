/**
 * GOOGLE APPS SCRIPT: Auto-append Interactive Video Scores
 * Compliant with Claude's Architectural Audit (LockService + Deduplication)
 * 
 * INSTRUCTIONS FOR TEACHER:
 * 1. Open your Google Sheet in Google Drive.
 * 2. Click: Extensions -> Apps Script.
 * 3. Replace all existing text with this code.
 * 4. Click: Deploy -> New deployment -> Select type: Web app.
 *    - Execute as: Me (your Google account)
 *    - Who has access: Anyone
 * 5. Click "Deploy", authorize permissions, and copy the Web App URL!
 */
function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const lock = LockService.getScriptLock();
    // Wait up to 20 seconds to guarantee concurrent submissions don't collide or drop rows
    lock.waitLock(20000);
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sh = ss.getSheetByName('Results');
      if (!sh) {
        sh = ss.getActiveSheet();
        sh.setName('Results');
      }

      // Check header row
      if (sh.getLastRow() === 0) {
        sh.appendRow(['Submission ID', 'Petsa at Oras', 'Pangalan ng Mag-aaral', 'Seksiyon', 'Iskor', 'Kabuuan', 'Bahagdan (%)']);
      }

      // Deduplication: Verify submissionId doesn't already exist in column A
      let seen = null;
      if (sh.getLastRow() > 1) {
        seen = sh.getRange('A:A').createTextFinder(d.submissionId).matchEntireCell(true).findNext();
      }

      if (!seen) {
        const percent = Math.round((d.score / d.total) * 100) + '%';
        sh.appendRow([
          d.submissionId,
          new Date(),
          d.studentName,
          d.section,
          d.score,
          d.total,
          percent
        ]);
      }

      return ContentService.createTextOutput(JSON.stringify({ ok: true, duplicate: !!seen }))
        .setMimeType(ContentService.MimeType.JSON);
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    message: "PKLP Google Sheets Webhook is active and listening!"
  })).setMimeType(ContentService.MimeType.JSON);
}
