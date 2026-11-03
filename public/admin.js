// Dashboard text in both languages (switch with the EN / FIL buttons)
const I18N = {
  fil: {
    loginHint: 'Ilagay ang iyong code ng guro.',
    loginPlaceholder: 'Halimbawa: SANTOS-7K2Q',
    loginButton: 'Pumasok',
    loginError: 'Maling code. Pakisubukang muli.',
    hello: 'Kumusta',
    mainTeacher: 'Pangunahing Guro',
    studio: 'Guro Studio',
    refresh: 'I-refresh',
    logout: 'Lumabas',
    session: 'Sesyon',
    sessionOpen: '🟢 BUKAS',
    sessionClosed: '🔴 SARADO',
    sessionOpenHint: 'Bukas: makakapagsimula ang mga mag-aaral gamit ang iyong link.',
    sessionClosedHint: 'Sarado: makikita ng mga mag-aaral na sarado pa ang sesyon. Ang mga nanonood na ay makakatapos pa rin.',
    closeSession: '🔒 Isara ang Sesyon',
    openSession: '🔓 Buksan ang Sesyon',
    linkTitle: 'Link para sa iyong mga mag-aaral',
    linkHint: 'Ibigay ang link na ito sa iyong klase. Ang mga sagot nila ay sa iyo lamang makikita.',
    copy: '📋 Kopyahin',
    copied: '✓ Nakopya',
    copyPrompt: 'Kopyahin ito:',
    sectionsTitle: 'Aking mga Seksiyon',
    sectionsHint: 'Ito ang pagpipilian ng iyong mga mag-aaral bago magsimula.',
    sectionPlaceholder: 'Halimbawa: 11 - STEM C',
    add: '➕ Idagdag',
    sectionExists: 'Nasa listahan na ang "{name}".',
    sectionsLoadError: '⚠️ Hindi ma-load ang mga seksiyon.',
    saving: 'Ini-save...',
    saved: '✓ Nai-save',
    saveError: '⚠️ Hindi na-save. Pakisubukang muli.',
    noSections: 'Wala pang seksiyon. Hindi makakapagsimula ang mga mag-aaral hangga\'t walang naidaragdag.',
    removeSectionLabel: 'Tanggalin ang {name}',
    removeSectionConfirm: 'Tanggalin ang "{name}" sa listahan ng seksiyon?',
    teachersTitle: 'Mga Guro',
    teachersHint: 'Magdagdag ng guro at ibigay sa kaniya ang kaniyang <strong>code</strong> (para sa dashboard). Siya na ang magbibigay ng sariling link sa kaniyang klase.',
    colName: 'Pangalan',
    colCode: 'Code (lihim)',
    colStudentLink: 'Link ng Mag-aaral',
    colFinished: 'Nakatapos',
    teacherPlaceholder: 'Halimbawa: Gng. Santos',
    addTeacher: '➕ Idagdag ang Guro',
    adding: 'Idinadagdag...',
    teacherAdded: '✓ Naidagdag si {name}. Code: {code}',
    teachersLoadError: '⚠️ Hindi ma-load ang mga guro.',
    noTeachers: 'Wala pang ibang guro.',
    copyTeacherTitle: 'Kopyahin ang code at link para ipadala sa guro',
    teacherMessage: 'Guro Dashboard: {dash}\nCode mo: {code}\nLink ng iyong mga mag-aaral: {link}',
    remove: '✕ Tanggalin',
    removeTeacherConfirm: 'Tanggalin si "{name}"? Hindi na gagana ang kaniyang code at link. Ang mga bagong sagot mula sa lumang link ay mapupunta sa iyo.',
    teacherRemoved: 'Tinanggal si {name}.',
    resultsTitle: 'Mga Resulta ng Aking mga Mag-aaral',
    downloadCsv: '📥 I-download ang CSV',
    metricFinished: 'Nakatapos',
    metricAverage: 'Karaniwang Iskor',
    metricPass: 'Pumasa (≥ {pct}%)',
    filterSection: 'Seksiyon:',
    all: 'Lahat',
    showing: 'Ipinapakita: {n} mag-aaral',
    noResults: 'Wala pang resulta. Ibahagi ang iyong link sa mga mag-aaral.',
    resultsLoadError: '⚠️ Hindi ma-load ang mga resulta.',
    colStudent: 'Pangalan ng Mag-aaral',
    colSection: 'Seksiyon',
    colScore: 'Iskor',
    colPercent: 'Bahagdan',
    colDate: 'Oras / Petsa',
    dateLocale: 'fil-PH',
    sheetTitle: 'Google Sheet ng Resulta',
    sheetOn: '✓ Nakakonekta',
    sheetOff: '⚠️ Hindi pa nakakonekta',
    sheetMain: 'Ang mga resulta ng iyong klase ay pumapasok sa pangunahing Google Sheet.',
    sheetMainOff: '⚠️ Walang nakakonektang Google Sheet ang site na ito (local lamang).',
    sheetConnectedTo: 'Pumapasok ang mga resulta sa: {name}',
    sheetOpen: 'Buksan ang Sheet',
    sheetChange: 'Palitan',
    sheetStep1: 'Gumawa ng bagong Google Sheet sa <a href="https://sheets.new" target="_blank" rel="noopener">sheets.new</a>.',
    sheetStep2: 'I-click ang <strong>Share</strong> at idagdag bilang <strong>Editor</strong>:',
    sheetStep3: 'Kopyahin ang link ng Sheet mula sa address bar at i-paste dito:',
    sheetPlaceholder: 'https://docs.google.com/spreadsheets/d/...',
    sheetConnect: '🔗 Ikonekta',
    sheetChecking: 'Sinusuri ang Sheet...',
    sheetDone: '✓ Nakakonekta na! Maaari mo nang buksan ang sesyon.',
    sheetNeeded: 'Ikonekta muna ang iyong Google Sheet ng resulta bago buksan ang sesyon.',
    colSheet: 'Sheet',
    err_BAD_LINK: 'Hindi ito link ng Google Sheet. Kopyahin ang buong address na nagsisimula sa https://docs.google.com/spreadsheets/d/',
    err_NO_ACCESS: 'Hindi mabuksan ang Sheet. Siguraduhing na-share ito bilang Editor sa email sa hakbang 2.',
    err_CHECK_FAILED: 'Hindi nasuri ang Sheet. Pakisubukang muli.',
    err_NO_STORAGE: 'Walang nakakonektang Google storage ang site na ito.',
    err_SHEET_REQUIRED: 'Ikonekta muna ang iyong Google Sheet ng resulta bago buksan ang sesyon.'
  },
  en: {
    loginHint: 'Enter your teacher code.',
    loginPlaceholder: 'Example: SANTOS-7K2Q',
    loginButton: 'Sign in',
    loginError: 'Wrong code. Please try again.',
    hello: 'Hello',
    mainTeacher: 'Main Teacher',
    studio: 'Teacher Studio',
    refresh: 'Refresh',
    logout: 'Log out',
    session: 'Session',
    sessionOpen: '🟢 OPEN',
    sessionClosed: '🔴 CLOSED',
    sessionOpenHint: 'Open: students can start using your link.',
    sessionClosedHint: 'Closed: students see that the session is still closed. Students already watching can still finish.',
    closeSession: '🔒 Close Session',
    openSession: '🔓 Open Session',
    linkTitle: 'Link for your students',
    linkHint: 'Give this link to your class. Only you can see their answers.',
    copy: '📋 Copy',
    copied: '✓ Copied',
    copyPrompt: 'Copy this:',
    sectionsTitle: 'My Sections',
    sectionsHint: 'Your students choose from this list before they start.',
    sectionPlaceholder: 'Example: 11 - STEM C',
    add: '➕ Add',
    sectionExists: '"{name}" is already on the list.',
    sectionsLoadError: '⚠️ Could not load the sections.',
    saving: 'Saving...',
    saved: '✓ Saved',
    saveError: '⚠️ Not saved. Please try again.',
    noSections: 'No sections yet. Students cannot start until you add one.',
    removeSectionLabel: 'Remove {name}',
    removeSectionConfirm: 'Remove "{name}" from the section list?',
    teachersTitle: 'Teachers',
    teachersHint: 'Add a teacher and give them their <strong>code</strong> (for the dashboard). They then share their own link with their class.',
    colName: 'Name',
    colCode: 'Code (secret)',
    colStudentLink: 'Student Link',
    colFinished: 'Finished',
    teacherPlaceholder: 'Example: Mrs. Santos',
    addTeacher: '➕ Add Teacher',
    adding: 'Adding...',
    teacherAdded: '✓ Added {name}. Code: {code}',
    teachersLoadError: '⚠️ Could not load the teachers.',
    noTeachers: 'No other teachers yet.',
    copyTeacherTitle: 'Copy the code and link to send to the teacher',
    teacherMessage: 'Teacher Dashboard: {dash}\nYour code: {code}\nYour students\' link: {link}',
    remove: '✕ Remove',
    removeTeacherConfirm: 'Remove "{name}"? Their code and link will stop working. New answers from the old link will come to you.',
    teacherRemoved: 'Removed {name}.',
    resultsTitle: 'My Students\' Results',
    downloadCsv: '📥 Download CSV',
    metricFinished: 'Finished',
    metricAverage: 'Average Score',
    metricPass: 'Passed (≥ {pct}%)',
    filterSection: 'Section:',
    all: 'All',
    showing: 'Showing: {n} students',
    noResults: 'No results yet. Share your link with your students.',
    resultsLoadError: '⚠️ Could not load the results.',
    colStudent: 'Student Name',
    colSection: 'Section',
    colScore: 'Score',
    colPercent: 'Percent',
    colDate: 'Time / Date',
    dateLocale: 'en-PH',
    sheetTitle: 'Results Google Sheet',
    sheetOn: '✓ Connected',
    sheetOff: '⚠️ Not connected yet',
    sheetMain: 'Your class results go to the main Google Sheet.',
    sheetMainOff: '⚠️ This site has no Google Sheet connected (local only).',
    sheetConnectedTo: 'Results are saved to: {name}',
    sheetOpen: 'Open Sheet',
    sheetChange: 'Change',
    sheetStep1: 'Create a new Google Sheet at <a href="https://sheets.new" target="_blank" rel="noopener">sheets.new</a>.',
    sheetStep2: 'Click <strong>Share</strong> and add as <strong>Editor</strong>:',
    sheetStep3: 'Copy the Sheet link from the address bar and paste it here:',
    sheetPlaceholder: 'https://docs.google.com/spreadsheets/d/...',
    sheetConnect: '🔗 Connect',
    sheetChecking: 'Checking the Sheet...',
    sheetDone: '✓ Connected! You can open your session now.',
    sheetNeeded: 'Connect your results Google Sheet before opening the session.',
    colSheet: 'Sheet',
    err_BAD_LINK: 'That is not a Google Sheet link. Copy the full address starting with https://docs.google.com/spreadsheets/d/',
    err_NO_ACCESS: 'Cannot open the Sheet. Make sure it is shared as Editor with the email in step 2.',
    err_CHECK_FAILED: 'Could not check the Sheet. Please try again.',
    err_NO_STORAGE: 'This site has no Google storage connected.',
    err_SHEET_REQUIRED: 'Connect your results Google Sheet before opening the session.'
  }
};

// Server messages are in Filipino; show an English version when English is chosen
const SERVER_MESSAGES_EN = {
  'Hindi wasto ang code.': 'Invalid code.',
  'Para lamang sa pangunahing guro.': 'For the main teacher only.',
  'Ilagay ang pangalan ng guro.': 'Enter the teacher\'s name.',
  'Hindi nakita ang guro.': 'Teacher not found.',
  'Kumokonekta pa sa Google Sheet. Pakisubukang muli makalipas ang ilang segundo.': 'Still connecting to the Google Sheet. Please try again in a few seconds.'
};

document.addEventListener('DOMContentLoaded', () => {
  let currentPin = sessionStorage.getItem('pklp_teacher_pin') || '';
  let me = null;
  let allSubmissions = [];
  let checkpointIds = [];
  let sectionChoices = [];
  let teacherList = [];
  let lang = 'fil';
  try { lang = localStorage.getItem('pklp_dashboard_lang') === 'en' ? 'en' : 'fil'; } catch (e) {}

  const PASS_PERCENT = 75;

  const pinModal = document.getElementById('pin-modal');
  const inputPin = document.getElementById('input-pin');
  const btnUnlock = document.getElementById('btn-unlock');
  const pinError = document.getElementById('pin-error');
  const adminMain = document.getElementById('admin-main');

  const btnRefresh = document.getElementById('btn-refresh');
  const btnLogout = document.getElementById('btn-logout');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const filterSection = document.getElementById('filter-section');
  const tbody = document.getElementById('submissions-tbody');

  const studentLink = document.getElementById('student-link');
  const btnCopyLink = document.getElementById('btn-copy-link');

  const sectionsList = document.getElementById('sections-list');
  const inputNewSection = document.getElementById('input-new-section');
  const btnAddSection = document.getElementById('btn-add-section');
  const sectionsStatus = document.getElementById('sections-status');

  const teachersCard = document.getElementById('teachers-card');
  const teachersTbody = document.getElementById('teachers-tbody');
  const inputNewTeacher = document.getElementById('input-new-teacher');
  const btnAddTeacher = document.getElementById('btn-add-teacher');
  const teachersStatus = document.getElementById('teachers-status');

  // --- Language ---
  function t(key, vars = {}) {
    const text = (I18N[lang] && I18N[lang][key]) || I18N.fil[key] || key;
    return text.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
  }

  function serverMsg(message) {
    if (I18N.fil['err_' + message]) return t('err_' + message);
    return lang === 'en' && SERVER_MESSAGES_EN[message] ? SERVER_MESSAGES_EN[message] : message;
  }

  function applyLang() {
    document.documentElement.lang = lang === 'en' ? 'en' : 'tl';
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    document.querySelectorAll('.lang-switch button').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    document.getElementById('metric-pass-label').textContent = t('metricPass', { pct: PASS_PERCENT });

    // Re-draw the parts built in code
    if (me) {
      document.getElementById('teacher-name').textContent = me.isAdmin ? t('mainTeacher') : me.name;
      renderSession(me.isOpen);
      renderSheet();
      renderHead();
      updateSectionFilter(allSubmissions);
      renderTable(allSubmissions);
      renderSections();
      if (me.isAdmin) renderTeachers(teacherList);
    } else {
      filterSection.options[0].textContent = t('all');
    }
    sectionsStatus.textContent = '';
    teachersStatus.textContent = '';
  }

  document.querySelectorAll('.lang-switch button').forEach(b => b.addEventListener('click', () => {
    lang = b.dataset.lang;
    try { localStorage.setItem('pklp_dashboard_lang', lang); } catch (e) {}
    applyLang();
  }));

  applyLang();
  if (currentPin) login(currentPin);

  btnUnlock.addEventListener('click', () => {
    const pin = inputPin.value.trim();
    if (pin) login(pin);
  });

  inputPin.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnUnlock.click();
  });

  btnRefresh.addEventListener('click', () => {
    loadResults();
    if (me && me.isAdmin) loadTeachers();
  });

  btnLogout.addEventListener('click', () => {
    sessionStorage.removeItem('pklp_teacher_pin');
    location.reload();
  });

  btnExportCsv.addEventListener('click', () => {
    if (!currentPin) return;
    window.location.href = `/api/admin/export-csv?pin=${encodeURIComponent(currentPin)}`;
  });

  btnCopyLink.addEventListener('click', () => copyText(studentLink.value, btnCopyLink));

  filterSection.addEventListener('change', () => renderTable(allSubmissions));

  function api(url, options = {}) {
    options.headers = Object.assign({ 'x-teacher-pin': currentPin }, options.headers || {});
    return fetch(url, options).then(r => {
      if (!r.ok) return r.json().catch(() => ({})).then(d => { throw new Error(serverMsg(d.error || 'Error')); });
      return r.json();
    });
  }

  function login(pin) {
    currentPin = pin;
    api('/api/admin/me')
      .then(data => {
        me = data;
        sessionStorage.setItem('pklp_teacher_pin', pin);
        pinModal.classList.add('hidden');
        adminMain.classList.remove('hidden');

        document.getElementById('teacher-name').textContent = me.isAdmin ? t('mainTeacher') : me.name;
        document.getElementById('link-studio').classList.toggle('hidden', !me.isAdmin);
        teachersCard.classList.toggle('hidden', !me.isAdmin);
        studentLink.value = linkFor(me.slug);
        renderSession(me.isOpen);
        renderSheet();

        loadResults();
        loadSections();
        if (me.isAdmin) loadTeachers();
      })
      .catch(() => {
        currentPin = '';
        pinError.classList.remove('hidden');
        sessionStorage.removeItem('pklp_teacher_pin');
      });
  }

  // --- Session open/close ---
  const btnToggleSession = document.getElementById('btn-toggle-session');
  const sessionCard = document.getElementById('session-card');

  function renderSession(isOpen) {
    me.isOpen = isOpen;
    document.getElementById('session-state').textContent = isOpen ? t('sessionOpen') : t('sessionClosed');
    document.getElementById('session-hint').textContent = isOpen ? t('sessionOpenHint') : t('sessionClosedHint');
    sessionCard.style.borderColor = isOpen ? '#86efac' : '#fca5a5';
    sessionCard.style.background = isOpen ? '#f0fdf4' : '#fef2f2';
    btnToggleSession.textContent = isOpen ? t('closeSession') : t('openSession');
    btnToggleSession.style.background = isOpen ? 'var(--danger)' : 'var(--success)';

    const needsSheet = !me.isAdmin && !(me.sheet && me.sheet.connected);
    btnToggleSession.disabled = needsSheet && !isOpen;
    btnToggleSession.style.opacity = btnToggleSession.disabled ? '0.5' : '1';
    if (needsSheet && !isOpen) document.getElementById('session-hint').textContent = t('sheetNeeded');
  }

  // --- Results Sheet ---
  const inputSheetUrl = document.getElementById('input-sheet-url');
  const btnConnectSheet = document.getElementById('btn-connect-sheet');
  const sheetStatus = document.getElementById('sheet-status');
  let changingSheet = false;

  function renderSheet() {
    const sheet = me.sheet || { connected: false };
    const connectedEl = document.getElementById('sheet-connected');
    document.getElementById('sheet-state').textContent = sheet.connected ? t('sheetOn') : t('sheetOff');
    document.getElementById('sheet-card').style.borderColor = sheet.connected ? '#86efac' : '#fcd34d';
    document.getElementById('sheet-owner-email').textContent = me.ownerEmail || '—';

    if (me.isAdmin) {
      connectedEl.textContent = sheet.connected ? t('sheetMain') : t('sheetMainOff');
      document.getElementById('sheet-steps').classList.add('hidden');
      return;
    }

    connectedEl.innerHTML = '';
    if (sheet.connected) {
      connectedEl.append(t('sheetConnectedTo', { name: sheet.name || 'Google Sheet' }) + ' · ');
      const open = document.createElement('a');
      open.href = sheet.url;
      open.target = '_blank';
      open.rel = 'noopener';
      open.textContent = t('sheetOpen');
      const change = document.createElement('a');
      change.href = '#';
      change.textContent = t('sheetChange');
      change.addEventListener('click', (e) => { e.preventDefault(); changingSheet = true; renderSheet(); });
      connectedEl.append(open, ' · ', change);
    }
    document.getElementById('sheet-steps').classList.toggle('hidden', sheet.connected && !changingSheet);
  }

  document.getElementById('btn-copy-email').addEventListener('click', (e) => copyText(me.ownerEmail || '', e.currentTarget));

  btnConnectSheet.addEventListener('click', () => {
    const url = inputSheetUrl.value.trim();
    if (!url) return;
    sheetStatus.textContent = t('sheetChecking');
    btnConnectSheet.disabled = true;
    api('/api/admin/results-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
      .then(data => {
        me.sheet = data.sheet;
        changingSheet = false;
        inputSheetUrl.value = '';
        sheetStatus.textContent = t('sheetDone');
        renderSheet();
        renderSession(me.isOpen);
      })
      .catch(err => { sheetStatus.textContent = '⚠️ ' + err.message; })
      .finally(() => { btnConnectSheet.disabled = false; });
  });

  btnToggleSession.addEventListener('click', () => {
    const next = !me.isOpen;
    if (btnToggleSession.disabled) return;
    btnToggleSession.disabled = true;
    api('/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOpen: next })
    })
      .then(data => renderSession(data.isOpen))
      .catch(err => { document.getElementById('session-hint').textContent = '⚠️ ' + err.message; })
      .finally(() => { renderSession(me.isOpen); });
  });

  function linkFor(slug) {
    return location.origin + '/play.html' + (slug ? '?guro=' + encodeURIComponent(slug) : '');
  }

  function copyText(text, btn) {
    const done = () => {
      const old = btn.textContent;
      btn.textContent = t('copied');
      setTimeout(() => { btn.textContent = old; }, 1500);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(done).catch(() => prompt(t('copyPrompt'), text));
    } else {
      prompt(t('copyPrompt'), text);
    }
  }

  // --- Results ---
  function loadResults() {
    api('/api/admin/results')
      .then(data => {
        document.getElementById('admin-lesson-title').textContent = data.lessonTitle;
        checkpointIds = data.checkpointIds || [];
        allSubmissions = data.submissions || [];

        const total = data.totalQuestions || checkpointIds.length;
        document.getElementById('metric-total-students').textContent = data.totalStudents;
        document.getElementById('metric-avg-score').textContent = `${data.averageScore} / ${total}`;

        const passing = allSubmissions.filter(s => (s.score / s.total_questions) * 100 >= PASS_PERCENT).length;
        const passRate = allSubmissions.length > 0 ? Math.round((passing / allSubmissions.length) * 100) : 0;
        document.getElementById('metric-pass-rate').textContent = `${passRate}%`;

        renderHead();
        updateSectionFilter(allSubmissions);
        renderTable(allSubmissions);
      })
      .catch(() => {
        tbody.innerHTML = `<tr><td style="color: var(--danger); padding: 16px;">${t('resultsLoadError')}</td></tr>`;
      });
  }

  function renderHead() {
    const head = document.getElementById('results-head');
    head.innerHTML = `<th>#</th><th>${t('colStudent')}</th><th>${t('colSection')}</th>`
      + checkpointIds.map((id, i) => `<th style="text-align: center;">Q${i + 1}</th>`).join('')
      + `<th style="text-align: center;">${t('colScore')}</th><th style="text-align: center;">${t('colPercent')}</th><th>${t('colDate')}</th>`;
  }

  function updateSectionFilter(submissions) {
    const sections = Array.from(new Set(submissions.map(s => s.section))).sort();
    const currentVal = filterSection.value;

    filterSection.innerHTML = '';
    const optAll = document.createElement('option');
    optAll.value = 'ALL';
    optAll.textContent = t('all');
    filterSection.appendChild(optAll);
    sections.forEach(sec => {
      const opt = document.createElement('option');
      opt.value = sec;
      opt.textContent = sec;
      filterSection.appendChild(opt);
    });

    if (sections.includes(currentVal)) filterSection.value = currentVal;
  }

  function renderTable(submissions) {
    const selectedSection = filterSection.value;
    const filtered = selectedSection === 'ALL' || !selectedSection
      ? submissions
      : submissions.filter(s => s.section === selectedSection);
    const cols = checkpointIds.length + 6;

    document.getElementById('table-count-label').textContent = t('showing', { n: filtered.length });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${cols}" style="text-align: center; color: var(--text-muted); padding: 24px;">${t('noResults')}</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    filtered.forEach((sub, idx) => {
      const tr = document.createElement('tr');
      const answers = sub.answers || {};
      const pct = Math.round((sub.score / sub.total_questions) * 100);

      const badges = checkpointIds.map(id => {
        const badge = answers[id]?.correct
          ? '<span class="badge-correct">✓</span>'
          : '<span class="badge-wrong">✗</span>';
        return `<td style="text-align: center;">${badge}</td>`;
      }).join('');

      const dateStr = new Date(String(sub.created_at).replace(' ', 'T') + 'Z').toLocaleString(t('dateLocale'), {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      tr.innerHTML = `
        <td style="color: var(--text-muted);">${idx + 1}</td>
        <td><strong>${escapeHtml(sub.student_name)}</strong></td>
        <td><span class="badge" style="background: #e2e8f0; color: #334155;">${escapeHtml(sub.section)}</span></td>
        ${badges}
        <td style="text-align: center; font-weight: 700; color: var(--primary);">${sub.score}/${sub.total_questions}</td>
        <td style="text-align: center; font-weight: 600;">${pct}%</td>
        <td style="font-size: 0.82rem; color: var(--text-muted);">${dateStr}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- Sections (each teacher has their own list) ---
  btnAddSection.addEventListener('click', () => {
    const name = inputNewSection.value.replace(/\s+/g, ' ').trim();
    if (!name) return;
    if (sectionChoices.some(s => s.toLowerCase() === name.toLowerCase())) {
      sectionsStatus.textContent = t('sectionExists', { name });
      return;
    }
    saveSections([...sectionChoices, name], () => { inputNewSection.value = ''; });
  });

  inputNewSection.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnAddSection.click();
  });

  function loadSections() {
    const guro = me && me.slug ? '&guro=' + encodeURIComponent(me.slug) : '';
    fetch('/api/sections?_t=' + Date.now() + guro, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        sectionChoices = data.sections || [];
        renderSections();
      })
      .catch(() => { sectionsStatus.textContent = t('sectionsLoadError'); });
  }

  function saveSections(next, onSaved) {
    sectionsStatus.textContent = t('saving');
    api('/api/admin/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sections: next })
    })
      .then(data => {
        sectionChoices = data.sections;
        renderSections();
        sectionsStatus.textContent = t('saved');
        if (onSaved) onSaved();
      })
      .catch(() => { sectionsStatus.textContent = t('saveError'); });
  }

  function renderSections() {
    sectionsList.innerHTML = '';
    if (sectionChoices.length === 0) {
      const empty = document.createElement('span');
      empty.style.cssText = 'color: var(--danger); font-size: 0.85rem;';
      empty.textContent = t('noSections');
      sectionsList.appendChild(empty);
      return;
    }
    sectionChoices.forEach(sec => {
      const chip = document.createElement('span');
      chip.className = 'badge';
      chip.style.cssText = 'background: #e2e8f0; color: #334155; display: inline-flex; align-items: center; gap: 6px; padding: 6px 6px 6px 12px; font-size: 0.85rem;';
      chip.textContent = sec;

      const btnRemove = document.createElement('button');
      btnRemove.type = 'button';
      btnRemove.textContent = '✕';
      btnRemove.setAttribute('aria-label', t('removeSectionLabel', { name: sec }));
      btnRemove.style.cssText = 'border: none; background: #cbd5e1; color: #334155; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; font-size: 0.75rem; line-height: 1;';
      btnRemove.addEventListener('click', () => {
        if (!confirm(t('removeSectionConfirm', { name: sec }))) return;
        saveSections(sectionChoices.filter(s => s !== sec));
      });

      chip.appendChild(btnRemove);
      sectionsList.appendChild(chip);
    });
  }

  // --- Teachers (main teacher only) ---
  btnAddTeacher.addEventListener('click', () => {
    const name = inputNewTeacher.value.replace(/\s+/g, ' ').trim();
    if (!name) return;
    teachersStatus.textContent = t('adding');
    api('/api/admin/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
      .then(data => {
        inputNewTeacher.value = '';
        teachersStatus.textContent = t('teacherAdded', { name: data.teacher.name, code: data.teacher.code });
        loadTeachers();
      })
      .catch(err => { teachersStatus.textContent = '⚠️ ' + err.message; });
  });

  inputNewTeacher.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnAddTeacher.click();
  });

  function loadTeachers() {
    api('/api/admin/teachers')
      .then(data => { teacherList = data.teachers || []; renderTeachers(teacherList); })
      .catch(() => { teachersStatus.textContent = t('teachersLoadError'); });
  }

  function renderTeachers(teachers) {
    teachersTbody.innerHTML = '';
    if (teachers.length === 0) {
      teachersTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 16px;">${t('noTeachers')}</td></tr>`;
      return;
    }
    teachers.forEach(tc => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${escapeHtml(tc.name)}</strong></td>
        <td><span class="code-pill">${escapeHtml(tc.code)}</span></td>
        <td style="font-size: 0.8rem; word-break: break-all;">${escapeHtml(linkFor(tc.slug))}</td>
        <td style="text-align: center;">${tc.students}</td>
        <td style="text-align: center;">${tc.sheetConnected ? '✓' : '—'}</td>
        <td style="white-space: nowrap;"></td>
      `;
      const actions = tr.lastElementChild;

      const btnCopy = document.createElement('button');
      btnCopy.type = 'button';
      btnCopy.className = 'btn btn-sm';
      btnCopy.style.cssText = 'padding: 4px 10px; font-size: 0.78rem; margin-right: 6px;';
      btnCopy.textContent = t('copy');
      btnCopy.title = t('copyTeacherTitle');
      btnCopy.addEventListener('click', () => copyText(
        t('teacherMessage', { dash: location.origin + '/admin.html', code: tc.code, link: linkFor(tc.slug) }), btnCopy));

      const btnRemove = document.createElement('button');
      btnRemove.type = 'button';
      btnRemove.className = 'btn btn-sm';
      btnRemove.style.cssText = 'padding: 4px 10px; font-size: 0.78rem; background: var(--danger);';
      btnRemove.textContent = t('remove');
      btnRemove.addEventListener('click', () => {
        if (!confirm(t('removeTeacherConfirm', { name: tc.name }))) return;
        api('/api/admin/teachers/' + encodeURIComponent(tc.id), { method: 'DELETE' })
          .then(() => { teachersStatus.textContent = t('teacherRemoved', { name: tc.name }); loadTeachers(); })
          .catch(err => { teachersStatus.textContent = '⚠️ ' + err.message; });
      });

      actions.appendChild(btnCopy);
      actions.appendChild(btnRemove);
      teachersTbody.appendChild(tr);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }
});
