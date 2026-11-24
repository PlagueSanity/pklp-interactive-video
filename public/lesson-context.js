(() => {
  const scoped = new Set(['/api/lesson','/api/admin/lesson','/api/admin/results','/api/admin/export-csv',
    '/api/studio/save-lesson','/api/checkpoints/verify','/api/sections',
    '/api/admin/me','/api/admin/session','/api/admin/duplicate-lesson','/api/admin/teachers']);
  const original = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === 'string') {
      const lesson = new URLSearchParams(location.search).get('lesson');
      const url = new URL(input, location.href);
      if (url.origin === location.origin && scoped.has(url.pathname) && lesson) {
        url.searchParams.set('lesson', lesson);
        input = url.href;
      }
    }
    return original(input, init);
  };
})();
