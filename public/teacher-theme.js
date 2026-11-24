(() => {
  const STORAGE_KEY = 'pklp_teacher_theme';
  const VALID = new Set(['light', 'dark']);

  function readSavedTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (VALID.has(saved)) return saved;
    } catch (_) {}
    return 'light';
  }

  function applyTheme(theme) {
    const next = VALID.has(theme) ? theme : 'light';
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    syncControls(next);
    return next;
  }

  function syncControls(theme) {
    const current = VALID.has(theme) ? theme : readSavedTheme();
    document.querySelectorAll('[data-theme-choice]').forEach((btn) => {
      const active = btn.dataset.themeChoice === current;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function setTheme(theme) {
    const next = applyTheme(theme);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (_) {}
    window.dispatchEvent(new CustomEvent('teacher-theme-change', { detail: { theme: next } }));
    return next;
  }

  function toggleTheme() {
    return setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  }

  // Apply immediately in <head> before first paint to prevent theme flash.
  const initialTheme = applyTheme(readSavedTheme());

  document.addEventListener('DOMContentLoaded', () => {
    syncControls(document.documentElement.dataset.theme || initialTheme);
  });

  document.addEventListener('click', (event) => {
    const choiceBtn = event.target.closest('[data-theme-choice]');
    if (choiceBtn) {
      setTheme(choiceBtn.dataset.themeChoice);
      return;
    }
    const toggleBtn = event.target.closest('[data-theme-toggle]');
    if (toggleBtn) {
      toggleTheme();
    }
  });

  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      applyTheme(readSavedTheme());
    }
  });

  window.teacherTheme = {
    key: STORAGE_KEY,
    get: () => document.documentElement.dataset.theme || readSavedTheme(),
    set: setTheme,
    toggle: toggleTheme,
    sync: () => syncControls(document.documentElement.dataset.theme || readSavedTheme())
  };
})();
