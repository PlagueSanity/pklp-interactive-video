document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('btn-clear-records');
  if (!button) return;
  button.addEventListener('click', async () => {
    const title = document.getElementById('admin-lesson-title').textContent;
    const confirmation = prompt(`Clear your records for "${title}"?\n\nDownload the CSV first if you need a copy. This clears ALL your students' records for this ADM, including every section. Other ADMs and other teachers' records are unchanged. Google Sheets retains a backup, but cleared records will stay out of the dashboard and future CSV downloads.\n\nType CLEAR to continue.`);
    if (confirmation !== 'CLEAR') return;
    const pin = sessionStorage.getItem('pklp_teacher_pin');
    button.disabled = true;
    try {
      const r = await fetch('/api/admin/clear-results' + location.search, {
        method: 'POST', headers: { 'Content-Type':'application/json','x-teacher-pin':pin },
        body: JSON.stringify({ confirmation })
      });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error || 'Could not clear records.');
      alert(`${result.cleared} record(s) cleared for this ADM. Google Sheets retains a backup.`);
      document.getElementById('btn-refresh').click();
    } catch (err) { alert(err.message); }
    finally { button.disabled = false; }
  });
});
