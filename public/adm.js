(() => {
  const login = document.getElementById('login');
  const message = document.getElementById('message');
  const container = document.getElementById('lessons');
  let pin = sessionStorage.getItem('pklp_teacher_pin') || '';
  let me;
  async function api(url) {
    const r = await fetch(url, { headers: { 'x-teacher-pin': pin }, cache: 'no-store' });
    if (!r.ok) throw new Error('Could not open the library. Check your code and try again.');
    return r.json();
  }
  function link(label, href, parent) {
    const a = document.createElement('a'); a.textContent = label; a.href = href;
    a.className = 'action secondary'; parent.append(a);
  }
  async function openLibrary() {
    message.textContent = 'Loading your ADMs…';
    try {
      me = await api('/api/admin/me');
      const data = await api('/api/admin/lessons');
      sessionStorage.setItem('pklp_teacher_pin', pin);
      login.classList.add('hidden');
      document.getElementById('create').classList.toggle('hidden', !me.isAdmin);
      container.replaceChildren();
      for (const lesson of data.lessons) {
        const card = document.createElement('article'); card.className = 'card';
        const heading = document.createElement('h2'); heading.textContent = lesson.title;
        const detail = document.createElement('p'); detail.textContent = `${lesson.subject || 'ADM lesson'} · ${lesson.questions} questions`;
        const actions = document.createElement('div'); actions.className = 'actions';
        const query = '?lesson=' + encodeURIComponent(lesson.id);
        if (me.isAdmin) link('Edit lesson', '/studio.html' + query, actions);
        link('View results', '/admin.html' + query, actions);
        const copy = document.createElement('button'); copy.textContent = 'Copy student link';
        copy.onclick = async () => {
          const url = new URL('/play.html' + query, location.origin);
          if (me.slug) url.searchParams.set('guro', me.slug);
          try { await navigator.clipboard.writeText(url.href); message.textContent = 'Student link copied.'; }
          catch (_) { prompt('Copy this student link:', url.href); }
        };
        const download = document.createElement('button'); download.textContent = 'Download results CSV';
        download.onclick = async () => {
          download.disabled = true;
          try {
            const r = await fetch('/api/admin/export-csv' + query, {headers:{'x-teacher-pin':pin}});
            if (!r.ok) throw new Error('Could not download results. Try again.');
            const url = URL.createObjectURL(await r.blob());
            const a = document.createElement('a'); a.href = url; a.download = 'Results_' + lesson.id + '.csv';
            document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url),1000);
            message.textContent = 'CSV downloaded. Open it in Excel to see scores and selected answers.';
          } catch (err) { message.textContent = err.message; }
          finally { download.disabled = false; }
        };
        actions.append(copy,download); card.append(heading,detail,actions); container.append(card);
      }
      message.textContent = 'Each ADM has its own student link and results download. CSV files open in Excel.';
    } catch (err) { login.classList.remove('hidden'); message.textContent = err.message; }
  }
  login.onsubmit = e => { e.preventDefault(); pin = document.getElementById('pin').value.trim(); openLibrary(); };
  if (pin) openLibrary();
})();
