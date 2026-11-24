(() => {
  const ui = text => window.teacherText(text);
  window.addEventListener('teacher-language-change', () => { if (me) openLibrary(); });
  const login = document.getElementById('login');
  const message = document.getElementById('message');
  const container = document.getElementById('lessons');
  let pin = sessionStorage.getItem('pklp_teacher_pin') || '';
  let me;

  function currentLanguage() {
    try { return localStorage.getItem('pklp_dashboard_lang') === 'fil' ? 'fil' : 'en'; } catch (_) { return 'en'; }
  }

  function setStatus(text, tone = '') {
    message.textContent = text;
    message.classList.toggle('is-error', tone === 'error');
    message.classList.toggle('is-success', tone === 'success');
  }

  async function api(url) {
    const r = await fetch(url, {
      headers: { 'x-teacher-pin': pin, 'Accept-Language': currentLanguage() },
      cache: 'no-store'
    });
    if (!r.ok) throw new Error(ui("Could not open the library. Check your code and try again."));
    return r.json();
  }

  function link(label, href, parent, extraClass = 'secondary') {
    const a = document.createElement('a');
    a.textContent = label;
    a.href = href;
    a.className = 'action ' + extraClass;
    parent.append(a);
  }

  async function openLibrary() {
    setStatus(ui("Loading your ADMs…"));
    try {
      me = await api('/api/admin/me');
      const data = await api('/api/admin/lessons');
      sessionStorage.setItem('pklp_teacher_pin', pin);
      login.classList.add('hidden');
      document.getElementById('create').classList.toggle('hidden', !me.isAdmin);
      container.replaceChildren();
      for (const lesson of data.lessons) {
        const card = document.createElement('article');
        card.className = 'card';

        const top = document.createElement('div');
        const metaRow = document.createElement('div');
        metaRow.className = 'card-meta-row';

        const heading = document.createElement('h2');
        heading.textContent = lesson.title;

        const statusPill = document.createElement('span');
        statusPill.className = 'status-pill ' + (lesson.isOpen ? 'is-open' : 'is-closed');
        statusPill.textContent = lesson.isOpen ? '🟢 ' + ui("Open") : '🔴 ' + ui("Closed");

        metaRow.append(heading, statusPill);

        const detail = document.createElement('p');
        detail.textContent = `${lesson.subject || ui("ADM lesson")} · ${lesson.questions} ${ui("questions")}`;

        top.append(metaRow, detail);

        const actions = document.createElement('div');
        actions.className = 'actions';
        const query = '?lesson=' + encodeURIComponent(lesson.id);
        if (me.isAdmin) link(ui("Edit lesson"), '/studio.html' + query, actions, 'btn-pink-soft');
        link(ui("View results"), '/admin.html' + query, actions, 'secondary');

        const copy = document.createElement('button');
        copy.type = 'button';
        copy.className = 'btn btn-secondary';
        copy.textContent = ui("Copy student link");
        copy.onclick = async () => {
          const url = new URL('/play.html' + query, location.origin);
          if (me.slug) url.searchParams.set('guro', me.slug);
          try {
            await navigator.clipboard.writeText(url.href);
            setStatus(ui("Student link copied."), 'success');
          } catch (_) {
            prompt(ui("Copy this student link:"), url.href);
          }
        };

        const download = document.createElement('button');
        download.type = 'button';
        download.className = 'btn';
        download.textContent = ui("Download results CSV");
        download.onclick = async () => {
          download.disabled = true;
          try {
            const r = await fetch('/api/admin/export-csv' + query, {
              headers: { 'x-teacher-pin': pin, 'Accept-Language': currentLanguage() }
            });
            if (!r.ok) throw new Error(ui("Could not download results. Try again."));
            const url = URL.createObjectURL(await r.blob());
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Results_' + lesson.id + '.csv';
            document.body.append(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            setStatus(ui("CSV downloaded. Open it in Excel to see scores and selected answers."), 'success');
          } catch (err) {
            setStatus(err.message, 'error');
          } finally {
            download.disabled = false;
          }
        };

        actions.append(copy, download);
        card.append(top, actions);
        container.append(card);
      }
      setStatus(ui("Each ADM has its own student link and results download. CSV files open in Excel."));
    } catch (err) {
      login.classList.remove('hidden');
      setStatus(err.message, 'error');
    }
  }

  login.onsubmit = e => {
    e.preventDefault();
    pin = document.getElementById('pin').value.trim();
    openLibrary();
  };
  if (pin) openLibrary();
})();
