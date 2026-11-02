/**
 * GOOGLE APPS SCRIPT: Auto-append Interactive Video Scores by Section
 * Compliant with Claude's Architectural Audit (LockService + Section Tab Separation + Deduplication)
 * 
 * INSTRUCTIONS FOR TEACHER:
 * 1. Open your Google Sheet in Google Drive.
 * 2. Click: Extensions -> Apps Script.
 * 3. Replace all existing text with this code.
 * 4. Click: Deploy -> Manage deployments -> Click the Pencil ✏️ (Edit) -> Version: New version -> Deploy.
 */
function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const lock = LockService.getScriptLock();
    // Wait up to 20 seconds to guarantee concurrent submissions don't collide or drop rows
    lock.waitLock(20000);
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();

      // Get section name (e.g. "11 - STEM A")
      const sectionName = (d.section || 'Iba pang Seksiyon').trim();

      // Find or automatically create a separate tab for this section
      let sh = ss.getSheetByName(sectionName);
      if (!sh) {
        sh = ss.insertSheet(sectionName);
        sh.appendRow(['Submission ID', 'Petsa at Oras', 'Pangalan ng Mag-aaral', 'Iskor', 'Kabuuan', 'Bahagdan (%)']);
        sh.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#f1f5f9');
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
          d.score,
          d.total,
          percent
        ]);
      }

      return ContentService.createTextOutput(JSON.stringify({ ok: true, duplicate: !!seen, section: sectionName }))
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
    message: "PKLP Section-Separated Webhook is ready!"
  })).setMimeType(ContentService.MimeType.JSON);
}
