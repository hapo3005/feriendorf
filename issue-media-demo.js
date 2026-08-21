(() => {
  const mediaByIssue = new Map();
  let pendingMedia = [];
  let mediaCommitted = false;

  const formatBytes = bytes => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '';
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
  };

  function injectMediaStyles() {
    if (document.querySelector('#issueMediaDemoStyles')) return;
    const style = document.createElement('style');
    style.id = 'issueMediaDemoStyles';
    style.textContent = `
      .media-field{display:flex;flex-direction:column;gap:8px}.media-field-label{font-size:11px;font-weight:800;color:var(--muted)}.media-field-label em{font-style:normal;font-weight:600;color:#8b9690}.media-picker{border:1.5px dashed #b9cbc2!important;background:linear-gradient(145deg,#f8fbf9,#f1f6f3);border-radius:16px!important;padding:14px!important;display:flex!important;flex-direction:row!important;align-items:center!important;gap:12px!important;cursor:pointer;transition:.18s ease}.media-picker:hover{border-color:#769b8c!important;background:#f2f7f4}.media-picker-icon{width:42px;height:42px;border-radius:13px;background:var(--forest);color:#fff;display:grid;place-items:center;font-size:22px;font-weight:500;flex:0 0 auto}.media-picker-copy{display:flex;flex-direction:column;gap:2px;min-width:0}.media-picker-copy strong{font-size:12px;color:var(--ink)}.media-picker-copy small{font-size:10px;color:var(--muted);font-weight:600}.media-picker-arrow{margin-left:auto;font-size:22px;color:var(--forest);font-weight:400}.media-preview-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:3px}.media-preview{position:relative;aspect-ratio:1/1;border-radius:13px;overflow:hidden;background:#e8eeea;border:1px solid var(--line)}.media-preview img,.media-preview video{width:100%;height:100%;object-fit:cover;display:block}.media-preview video{background:#14211c}.media-preview-remove{position:absolute;top:6px;right:6px;width:26px;height:26px;border:0;border-radius:999px;background:rgba(17,28,24,.82);color:#fff;display:grid;place-items:center;font-size:16px;line-height:1;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.2)}.media-preview-type{position:absolute;left:6px;bottom:6px;border-radius:999px;background:rgba(17,28,24,.78);color:#fff;padding:3px 7px;font-size:9px;font-weight:800}.issue-media-gallery{display:grid;grid-template-columns:repeat(3,minmax(0,150px));gap:8px;margin:14px 0 2px}.issue-media-tile{aspect-ratio:4/3;border-radius:13px;overflow:hidden;background:#e7ede9;border:1px solid var(--line);position:relative}.issue-media-tile img,.issue-media-tile video{display:block;width:100%;height:100%;object-fit:cover}.issue-media-tile video{background:#15211d}.issue-media-badges{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0 2px}.media-demo-note strong{color:var(--forest)}
      @media(max-width:620px){.media-preview-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.issue-media-gallery{grid-template-columns:repeat(2,minmax(0,1fr));max-width:360px}}
    `;
    document.head.appendChild(style);
  }

  function revokeMedia(media) {
    media.forEach(item => {
      if (item.url?.startsWith('blob:')) URL.revokeObjectURL(item.url);
    });
  }

  function clearPending() {
    revokeMedia(pendingMedia);
    pendingMedia = [];
  }

  function renderPendingMedia() {
    const preview = $('#issueMediaPreview');
    if (!preview) return;
    preview.hidden = pendingMedia.length === 0;
    preview.innerHTML = pendingMedia.map(item => `
      <div class="media-preview">
        ${item.kind === 'video'
          ? `<video src="${escapeHtml(item.url)}" muted playsinline preload="metadata"></video>`
          : `<img src="${escapeHtml(item.url)}" alt="Vorschau ${escapeHtml(item.name)}">`}
        <button class="media-preview-remove" type="button" data-remove-media="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.name)} entfernen">×</button>
        <span class="media-preview-type">${item.kind === 'video' ? 'VIDEO' : 'FOTO'}</span>
      </div>`).join('');

    $$('[data-remove-media]', preview).forEach(button => button.addEventListener('click', () => {
      const index = pendingMedia.findIndex(item => item.id === button.dataset.removeMedia);
      if (index < 0) return;
      const [removed] = pendingMedia.splice(index, 1);
      revokeMedia([removed]);
      renderPendingMedia();
    }));
  }

  function setupIssueMediaPicker() {
    const form = $('#issueForm');
    if (!form || form.querySelector('#issueMediaInput')) return;

    const note = form.querySelector('.form-note');
    const block = document.createElement('div');
    block.className = 'media-field';
    block.innerHTML = `
      <span class="media-field-label">Foto / Video <em>optional</em></span>
      <label class="media-picker" for="issueMediaInput">
        <span class="media-picker-icon">+</span>
        <span class="media-picker-copy"><strong>Foto oder Video hinzufügen</strong><small>Kamera oder Mediathek · bis zu 5 Dateien</small></span>
        <span class="media-picker-arrow">›</span>
        <input id="issueMediaInput" type="file" accept="image/*,video/*" multiple hidden>
      </label>
      <div id="issueMediaPreview" class="media-preview-grid" hidden></div>`;
    note?.insertAdjacentElement('beforebegin', block);
    if (note) {
      note.classList.add('media-demo-note');
      note.innerHTML = '<strong>Demo:</strong> Die Medienauswahl und Vorschau funktionieren bereits. Noch werden die Dateien nicht zentral hochgeladen und sind nach einem Neuladen nicht mehr als Vorschau verfügbar.';
    }

    const input = $('#issueMediaInput');
    input.addEventListener('change', () => {
      const files = [...(input.files || [])].filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
      let added = 0;
      for (const file of files) {
        if (pendingMedia.length >= 5) break;
        const kind = file.type.startsWith('video/') ? 'video' : 'image';
        pendingMedia.push({
          id: `media-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name: file.name || (kind === 'video' ? 'Video' : 'Foto'),
          type: file.type,
          size: file.size,
          kind,
          url: URL.createObjectURL(file)
        });
        added += 1;
      }
      input.value = '';
      renderPendingMedia();
      if (files.length > added) showToast('Maximal 5 Fotos/Videos pro Meldung');
    });
  }

  function issueMediaMarkup(item) {
    const live = mediaByIssue.get(item.id) || [];
    const stored = Array.isArray(item.attachments) ? item.attachments : [];
    if (!live.length && !stored.length) return '';

    if (live.length) {
      return `<div class="issue-media-gallery">${live.map(media => `
        <div class="issue-media-tile">
          ${media.kind === 'video'
            ? `<video src="${escapeHtml(media.url)}" controls playsinline preload="metadata" aria-label="${escapeHtml(media.name)}"></video>`
            : `<img src="${escapeHtml(media.url)}" alt="${escapeHtml(media.name)}">`}
        </div>`).join('')}</div>`;
    }

    const photos = stored.filter(media => media.kind === 'image').length;
    const videos = stored.filter(media => media.kind === 'video').length;
    return `<div class="issue-media-badges">${photos ? `<span class="tag">▧ ${photos} ${photos === 1 ? 'Foto' : 'Fotos'}</span>` : ''}${videos ? `<span class="tag">▶ ${videos} ${videos === 1 ? 'Video' : 'Videos'}</span>` : ''}<span class="tag">Vorschau nur in Demo-Sitzung</span></div>`;
  }

  const originalRenderIssues = renderIssues;
  renderIssues = function renderIssuesWithMedia() {
    originalRenderIssues();
    const items = [...state.issues].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    const cards = $$('#issueList > .list-card');
    items.forEach((item, index) => {
      const card = cards[index];
      const meta = card?.querySelector('.list-card-meta');
      if (!card || !meta) return;
      const markup = issueMediaMarkup(item);
      if (markup) meta.insertAdjacentHTML('beforebegin', markup);
    });
  };

  const originalOpenSheet = openSheet;
  openSheet = function openSheetWithMedia(type) {
    if (type === 'issue') {
      clearPending();
      mediaCommitted = false;
    }
    originalOpenSheet(type);
    if (type === 'issue') setupIssueMediaPicker();
  };

  submitIssue = function submitIssueWithMedia(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = uid('issue');
    const liveMedia = pendingMedia.map(media => ({ ...media }));
    const attachments = liveMedia.map(media => ({
      id: media.id,
      kind: media.kind,
      name: media.name,
      type: media.type,
      size: media.size
    }));

    state.issues.unshift({
      ...entityBase(id),
      title: String(data.get('title') || '').trim(),
      location: String(data.get('location') || '').trim(),
      details: String(data.get('details') || '').trim(),
      attachments,
      status: 'Gemeldet'
    });

    if (liveMedia.length) mediaByIssue.set(id, liveMedia);
    pendingMedia = [];
    mediaCommitted = true;
    persist();
    renderAll();
    closeSheet();
    navigate('issues');
    showToast(attachments.length ? `Problem mit ${attachments.length} Medien gespeichert` : 'Problem gespeichert');
  };

  const originalCloseSheet = closeSheet;
  closeSheet = function closeSheetWithMedia() {
    if (!mediaCommitted) clearPending();
    mediaCommitted = false;
    originalCloseSheet();
  };

  injectMediaStyles();
})();