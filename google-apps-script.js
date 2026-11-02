/**
 * GOOGLE APPS SCRIPT: Foolproof Section-Separated Webhook
 * Based on Claude's Audit: Explicit Sheet Binding + Formula Protection + LockService
 * 
 * =========================================================================
 * ⚙️ CONFIGURATION FOR TEACHER:
 * Paste the FULL URL of your Google Sheet between the quotes below.
 * Example: "https://docs.google.com/spreadsheets/d/1abcXYZ123.../edit"
 * =========================================================================
 */
const SHEET_URL = "PASTE_YOUR_GOOGLE_SHEET_URL_HERE";

/**
 * Extracts Google Spreadsheet ID from any full URL or direct ID string
 */
function extractSheetId(urlOrId) {
  if (!urlOrId || urlOrId === "PASTE_YOUR_GOOGLE_SHEET_URL_HERE") {
    throw new Error("Paki-paste ang buong URL ng iyong Google Sheet sa SHEET_URL line sa itaas.");
  }
  const clean = urlOrId.trim();
  const match = clean.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : clean;
}

/**
 * Protects against CSV / Formula Injection attacks (e.g. =cmd|' /C ...)
 */
function sanitizeInput(text) {
  if (typeof text !== 'string') return text;
  const trimmed = text.trim();
  if (/^[=\+\-@]/.test(trimmed)) {
    return "'" + trimmed;
  }
  return trimmed;
}

/**
 * Normalizes section names so "11 - stem a" and "11 - STEM A " land in the exact same tab
 */
function normalizeSection(rawSection) {
  if (!rawSection) return "IBA PANG SEKSIYON";
  return rawSection.trim().replace(/\s+/g, ' ').toUpperCase();
}

/**
 * Handles incoming POST requests from the video platform
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responseJson({ ok: false, error: "Walang natanggap na data payload." });
    }

    const d = JSON.parse(e.postData.contents);
    const sheetId = extractSheetId(SHEET_URL);
    const ss = SpreadsheetApp.openById(sheetId);

    const lock = LockService.getScriptLock();
    // Wait up to 20 seconds for other concurrent student submissions to complete
    lock.waitLock(20000);

    try {
      const sectionName = normalizeSection(d.section);

      // Find or create the dedicated tab for this section
      let sh = ss.getSheetByName(sectionName);
      if (!sh) {
        sh = ss.insertSheet(sectionName);
        sh.appendRow(['Submission ID', 'Petsa at Oras', 'Pangalan ng Mag-aaral', 'Iskor', 'Kabuuan', 'Bahagdan (%)']);
        sh.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#e2e8f0');
        sh.setFrozenRows(1);
      }

      // Deduplication check: skips row 1 header
      let seen = null;
      if (sh.getLastRow() > 1) {
        seen = sh.getRange(2, 1, sh.getLastRow() - 1, 1)
          .createTextFinder(d.submissionId)
          .matchEntireCell(true)
          .findNext();
      }

      if (!seen) {
        const percent = Math.round((Number(d.score || 0) / Number(d.total || 1)) * 100) + '%';
        sh.appendRow([
          sanitizeInput(d.submissionId),
          new Date(),
          sanitizeInput(d.studentName),
          Number(d.score || 0),
          Number(d.total || 0),
          percent
        ]);
      }

      return responseJson({
        ok: true,
        duplicate: !!seen,
        section: sectionName,
        connectedTo: ss.getName()
      });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return responseJson({ ok: false, error: err.toString() });
  }
}

/**
 * GET Request: Opening the Web App URL in a browser confirms the connected spreadsheet!
 */
function doGet(e) {
  try {
    const sheetId = extractSheetId(SHEET_URL);
    const ss = SpreadsheetApp.openById(sheetId);
    return responseJson({
      ok: true,
      status: "Active and Ready",
      connectedTo: ss.getName(),
      spreadsheetUrl: ss.getUrl()
    });
  } catch (err) {
    return responseJson({
      ok: false,
      error: "Setup Notice: " + err.message
    });
  }
}

/**
 * Helper function to output JSON
 */
function responseJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * =========================================================================
 * 🧪 QUICK TEST FUNCTION (FOR TEACHER):
 * In Apps Script, select "testConnection" in the dropdown at the top,
 * and click "▶ Run". A "TEST" tab will appear in your Google Sheet immediately!
 * =========================================================================
 */
function testConnection() {
  const sheetId = extractSheetId(SHEET_URL);
  const ss = SpreadsheetApp.openById(sheetId);
  let sh = ss.getSheetByName("TEST");
  if (!sh) sh = ss.insertSheet("TEST");
  sh.appendRow(["TEST RUN", new Date(), "Gumagana ang koneksyon!", "3", "3", "100%"]);
  Logger.log("✓ Matagumpay! Tumingin sa iyong Google Sheet, may 'TEST' tab na lumabas!");
}
