(() => {
  const loadScript = src => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  loadScript('./issue-media-core.js')
    .then(() => loadScript('./documents.js'))
    .then(() => loadScript('./calendar-workspace.js'))
    .then(() => loadScript('./votes-workspace.js'))
    .then(() => loadScript('./community-workspace.js'))
    .then(() => renderAll())
    .catch(() => console.warn('Demo-Erweiterung konnte nicht geladen werden.'));
})();