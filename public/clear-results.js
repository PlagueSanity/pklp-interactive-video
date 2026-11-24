document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('btn-clear-records');
  if (!button) return;
  button.addEventListener('click', async () => {
    let filipino = false;
    try { filipino = localStorage.getItem('pklp_dashboard_lang') === 'fil'; } catch (_) {}
    const title = document.getElementById('admin-lesson-title').textContent;
    const confirmation = prompt(filipino
      ? `Burahin ang iyong mga tala para sa "${title}"?\n\nI-download muna ang CSV kung kailangan mo ng kopya. Mawawala sa dashboard at CSV ang lahat ng tala mo para sa ADM na ito, sa lahat ng seksiyon. Mananatili ang backup sa Google Sheets. Hindi maaapektuhan ang ibang ADM at ibang guro.\n\nI-type ang CLEAR upang magpatuloy.`
      : `Clear your records for "${title}"?\n\nDownload the CSV first if you need a copy. This clears ALL your students' records for this ADM, including every section. Other ADMs and other teachers' records are unchanged. Google Sheets retains a backup, but cleared records will stay out of the dashboard and future CSV downloads.\n\nType CLEAR to continue.`);
    if (confirmation !== 'CLEAR') return;
    const pin = sessionStorage.getItem('pklp_teacher_pin');
    button.disabled = true;
    try {
      const r = await fetch('/api/admin/clear-results' + location.search, {
        method: 'POST', headers: { 'Content-Type':'application/json','x-teacher-pin':pin },
        body: JSON.stringify({ confirmation })
      });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error || (filipino ? 'Hindi mabura ang mga tala.' : 'Could not clear records.'));
      alert(filipino ? `${result.cleared} tala ang binura para sa ADM na ito. Nananatili ang backup sa Google Sheets.`
        : `${result.cleared} record(s) cleared for this ADM. Google Sheets retains a backup.`);
      document.getElementById('btn-refresh').click();
    } catch (err) { alert(err.message); }
    finally { button.disabled = false; }
  });
});
