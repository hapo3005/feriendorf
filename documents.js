(() => {
  const CATEGORIES = [
    { id: 'grundlagen', title: 'Regeln & Grundlagen', description: 'Satzung, Ordnungen, Vereinbarungen und Nutzungsregeln.', icon: 'book' },
    { id: 'beschluesse', title: 'Protokolle & Beschlüsse', description: 'Versammlungsprotokolle, Beschlüsse und Entscheidungsstände.', icon: 'check' },
    { id: 'finanzen', title: 'Finanzen & Abrechnungen', description: 'Abrechnungen, Wirtschaftsdaten, Umlagen und Kostenübersichten.', icon: 'euro' },
    { id: 'technik', title: 'Pläne & Technik', description: 'Lagepläne, Leitungen, Anlagen, Wartung und technische Unterlagen.', icon: 'plan' },
    { id: 'vertraege', title: 'Verträge & Dienstleister', description: 'Verträge, Angebote, Ansprechpartner und Leistungsunterlagen.', icon: 'briefcase' },
    { id: 'formulare', title: 'Formulare & Vorlagen', description: 'Wiederkehrende Formulare, Vorlagen und praktische Downloads.', icon: 'form' }
  ];

  const fileUrls = new Map();
  let activeCategory = 'all';
  let searchTerm = '';

  const iconSvg = type => {
    const paths = {
      book: '<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z"/><path d="M8 4v16m3-11h4m-4 4h4"/>',
      check: '<path d="M5 4h14v16H5z"/><path d="m8 12 2.5 2.5L16 9M8 7h8"/>',
      euro: '<circle cx="12" cy="12" r="9"/><path d="M16 8.5a5 5 0 1 0 0 7M7.5 11h7m-7 3h6"/>',
      plan: '<path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2V6Z"/><path d="M9 4v14m6-12v14"/>',
      briefcase: '<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M9 7V4h6v3m-12 5h18m-11 0v2h4v-2"/>',
      form: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h4M9 12h6m-6 4h6"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[type] || paths.form}</svg>`;
  };

  function ensureDocumentState() {
    if (!Array.isArray(state.documents)) {
      state.documents = [];
      persist();
    }
  }

  function injectDocumentStyles() {
    if ($('#documentWorkspaceStyles')) return;
    const style = document.createElement('style');
    style.id = 'documentWorkspaceStyles';
    style.textContent = `
      .documents-view-head{align-items:flex-end}.documents-view-head .button{flex:0 0 auto}
      .docs-workspace{display:grid;gap:16px}
      .docs-demo-note{display:flex;align-items:flex-start;gap:11px;padding:13px 15px;border:1px solid #ded8cb;border-radius:15px;background:rgba(255,253,248,.82);color:#6f786f;font-size:11px;line-height:1.5}
      .docs-demo-note svg{width:18px;height:18px;flex:0 0 auto;color:#35561f;margin-top:1px}.docs-demo-note strong{color:#284414}
      .docs-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      .docs-stat{display:flex;align-items:center;gap:12px;padding:15px 16px;border:1px solid #e1dccf;border-radius:18px;background:#fffdf8;box-shadow:0 10px 30px rgba(39,45,40,.05)}
      .docs-stat-icon{width:40px;height:40px;border-radius:13px;background:#edf4e6;color:#35561f;display:grid;place-items:center;flex:0 0 auto}.docs-stat-icon svg{width:19px;height:19px}
      .docs-stat-copy{display:flex;flex-direction:column;gap:1px}.docs-stat-copy strong{font-size:20px;color:#17201c;letter-spacing:-.035em}.docs-stat-copy span{font-size:9px;color:#7b837d;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
      .docs-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin-bottom:11px}.docs-section-head h2{font-size:20px;letter-spacing:-.035em;margin:3px 0 0}.docs-section-head p{font-size:10px;color:#828984;margin:0}
      .doc-category-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      .doc-category-card{appearance:none;text-align:left;border:1px solid #e1dccf;border-radius:19px;background:#fffdf8;padding:16px;min-height:142px;display:flex;flex-direction:column;gap:9px;cursor:pointer;color:#17201c;box-shadow:0 10px 28px rgba(39,45,40,.045);transition:.18s ease}
      .doc-category-card:hover{transform:translateY(-2px);border-color:#cdd9bf;box-shadow:0 15px 34px rgba(39,45,40,.075)}.doc-category-card.is-active{border-color:#9fc66d;box-shadow:0 0 0 3px rgba(184,223,134,.16),0 13px 32px rgba(39,45,40,.07)}
      .doc-category-top{display:flex;align-items:center;justify-content:space-between;gap:9px}.doc-category-icon{width:38px;height:38px;border-radius:12px;background:#edf4e6;color:#35561f;display:grid;place-items:center}.doc-category-icon svg{width:18px;height:18px}.doc-category-count{font-size:9px;font-weight:800;color:#6f786f;background:#f4f1ea;border:1px solid #e4dfd4;border-radius:999px;padding:4px 7px}
      .doc-category-card strong{font-size:13px;letter-spacing:-.015em}.doc-category-card p{font-size:10px;line-height:1.45;color:#7b837d;margin:0}.doc-category-open{margin-top:auto;font-size:9px;color:#35561f;font-weight:800}
      .docs-library{border:1px solid #e1dccf;border-radius:22px;background:#fffdf8;padding:18px;box-shadow:0 12px 34px rgba(39,45,40,.05)}
      .docs-library-toolbar{display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:10px;align-items:center;margin-bottom:14px}.doc-search{position:relative}.doc-search svg{position:absolute;width:16px;height:16px;left:13px;top:50%;transform:translateY(-50%);color:#7a837d}.doc-search input{width:100%;height:44px;border:1px solid #ded8cb;border-radius:13px;background:#faf8f2;color:#17201c;padding:0 13px 0 39px;font:inherit;font-size:11px;outline:none}.doc-search input:focus{border-color:#9fc66d;box-shadow:0 0 0 4px rgba(184,223,134,.16)}
      .doc-filter-reset{height:44px;border:1px solid #ded8cb;border-radius:13px;background:#faf8f2;padding:0 13px;color:#35561f;font-size:10px;font-weight:800;cursor:pointer}.doc-filter-reset:hover{background:#edf4e6}
      .doc-list-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}.doc-list-head strong{font-size:12px}.doc-list-head span{font-size:9px;color:#878e89}
      .doc-list{display:grid;gap:8px}.doc-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid #e5e0d5;border-radius:15px;padding:12px;background:linear-gradient(180deg,#fffefb,#faf7f0)}
      .doc-file-icon{width:42px;height:42px;border-radius:12px;background:#edf4e6;color:#35561f;display:grid;place-items:center}.doc-file-icon svg{width:19px;height:19px}.doc-row-main{min-width:0}.doc-row-main strong{display:block;font-size:12px;color:#17201c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.doc-row-main p{font-size:9px;color:#808882;margin:3px 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.doc-row-meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.doc-mini-tag{font-size:8px;border-radius:999px;padding:3px 6px;background:#edf4e6;color:#35561f;font-weight:750}.doc-mini-tag.local{background:#fff1d2;color:#8e5e18}
      .doc-row-actions{display:flex;align-items:center;gap:6px}.doc-icon-button{width:34px;height:34px;border:1px solid #ded8cb;border-radius:11px;background:#fffdf8;color:#35561f;display:grid;place-items:center;cursor:pointer}.doc-icon-button:hover{background:#edf4e6}.doc-icon-button.danger{color:#a95140}.doc-icon-button svg{width:15px;height:15px}
      .docs-empty{padding:28px 16px;text-align:center;border:1px dashed #ddd7ca;border-radius:16px;background:#faf8f2}.docs-empty .doc-empty-icon{width:48px;height:48px;margin:0 auto 10px;border-radius:15px;background:#edf4e6;color:#35561f;display:grid;place-items:center}.docs-empty .doc-empty-icon svg{width:22px;height:22px}.docs-empty strong{display:block;font-size:13px}.docs-empty p{font-size:10px;line-height:1.5;color:#818984;max-width:480px;margin:6px auto 0}
      .document-file-picker{border:1.5px dashed #cbd9b8!important;border-radius:15px!important;background:#faf8f2!important;padding:14px!important;display:flex!important;align-items:center!important;gap:11px!important;cursor:pointer}.document-file-picker:hover{background:#f2f7ea!important;border-color:#9fc66d!important}.document-file-picker input{display:none}.document-file-icon{width:38px;height:38px;border-radius:12px;background:#07100d;color:#d6f4a8;display:grid;place-items:center;flex:0 0 auto}.document-file-icon svg{width:18px;height:18px}.document-file-copy{display:flex;flex-direction:column;gap:2px}.document-file-copy strong{font-size:11px;color:#17201c}.document-file-copy small{font-size:9px;color:#737b75}
      @media(max-width:900px){.doc-category-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:620px){.documents-view-head{align-items:flex-start}.documents-view-head .button{width:100%}.docs-stats{grid-template-columns:1fr}.doc-category-grid{grid-template-columns:1fr}.docs-library{padding:13px}.docs-library-toolbar{grid-template-columns:1fr}.doc-row{grid-template-columns:auto minmax(0,1fr)}.doc-row-actions{grid-column:2;justify-content:flex-start}.docs-section-head{align-items:flex-start;flex-direction:column}.doc-category-card{min-height:126px}}
    `;
    document.head.appendChild(style);
  }

  function category(id) {
    return CATEGORIES.find(item => item.id === id) || CATEGORIES[0];
  }

  function formatSize(bytes) {
    const n = Number(bytes || 0);
    if (!n) return '';
    if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
    return `${(n / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
  }

  function documentDate(item) {
    return item.document_date ? fmtDate(item.document_date, false) : fmtDateTime(item.created_at);
  }

  function filteredDocuments() {
    const needle = searchTerm.trim().toLocaleLowerCase('de-DE');
    return [...state.documents]
      .filter(item => activeCategory === 'all' || item.category === activeCategory)
      .filter(item => {
        if (!needle) return true;
        const haystack = [item.title, item.note, item.file?.name, category(item.category).title].join(' ').toLocaleLowerCase('de-DE');
        return haystack.includes(needle);
      })
      .sort((a, b) => String(b.document_date || b.created_at).localeCompare(String(a.document_date || a.created_at)));
  }

  function renderCategories() {
    const root = $('#docCategoryGrid');
    if (!root) return;
    root.innerHTML = CATEGORIES.map(item => {
      const count = state.documents.filter(doc => doc.category === item.id).length;
      return `<button class="doc-category-card ${activeCategory === item.id ? 'is-active' : ''}" type="button" data-doc-category="${item.id}">
        <span class="doc-category-top"><span class="doc-category-icon">${iconSvg(item.icon)}</span><span class="doc-category-count">${count} ${count === 1 ? 'Dokument' : 'Dokumente'}</span></span>
        <strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.description)}</p><span class="doc-category-open">Bereich ansehen →</span>
      </button>`;
    }).join('');
    $$('[data-doc-category]', root).forEach(button => button.addEventListener('click', () => {
      activeCategory = button.dataset.docCategory;
      renderDocuments();
      $('#docLibrary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  }

  function renderDocumentList() {
    const root = $('#documentList');
    if (!root) return;
    const items = filteredDocuments();
    const active = activeCategory === 'all' ? 'Alle Dokumente' : category(activeCategory).title;
    $('#docListTitle').textContent = active;
    $('#docResultCount').textContent = `${items.length} ${items.length === 1 ? 'Treffer' : 'Treffer'}`;

    if (!items.length) {
      root.innerHTML = `<div class="docs-empty"><span class="doc-empty-icon">${iconSvg('form')}</span><strong>${searchTerm ? 'Keine passenden Dokumente' : 'Hier ist noch nichts abgelegt'}</strong><p>${searchTerm ? 'Suchbegriff oder Bereich ändern.' : 'Sobald ein echtes Dokument vorliegt, kannst du es hier für die Demo lokal erfassen. Es werden keine Beispiel-Unterlagen erfunden.'}</p></div>`;
      return;
    }

    root.innerHTML = items.map(item => {
      const cat = category(item.category);
      const canOpen = fileUrls.has(item.id);
      const fileDetails = item.file?.name ? `${item.file.name}${item.file.size ? ` · ${formatSize(item.file.size)}` : ''}` : 'ohne Datei-Metadaten';
      return `<article class="doc-row">
        <span class="doc-file-icon">${iconSvg('form')}</span>
        <div class="doc-row-main"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.note || fileDetails)}</p><div class="doc-row-meta"><span class="doc-mini-tag">${escapeHtml(cat.title)}</span><span class="doc-mini-tag">${escapeHtml(documentDate(item))}</span>${item.file?.name ? `<span class="doc-mini-tag local">lokal erfasst</span>` : ''}</div></div>
        <div class="doc-row-actions">${canOpen ? `<button class="doc-icon-button" type="button" data-doc-open="${escapeHtml(item.id)}" aria-label="Dokument öffnen"><svg viewBox="0 0 24 24"><path d="M5 19 19 5m-9 0h9v9"/></svg></button>` : ''}<button class="doc-icon-button danger" type="button" data-doc-remove="${escapeHtml(item.id)}" aria-label="Dokument entfernen"><svg viewBox="0 0 24 24"><path d="M4 7h16m-10 4v6m4-6v6M8 7l1-3h6l1 3m-10 0 1 14h10l1-14"/></svg></button></div>
      </article>`;
    }).join('');

    $$('[data-doc-open]', root).forEach(button => button.addEventListener('click', () => {
      const url = fileUrls.get(button.dataset.docOpen);
      if (url) window.open(url, '_blank', 'noopener');
    }));
    $$('[data-doc-remove]', root).forEach(button => button.addEventListener('click', () => removeDocument(button.dataset.docRemove)));
  }

  function renderDocuments() {
    ensureDocumentState();
    const total = state.documents.length;
    $('#docTotal').textContent = total;
    $('#docCategories').textContent = CATEGORIES.length;
    const latest = [...state.documents].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0];
    $('#docLatest').textContent = latest ? documentDate(latest) : '—';
    renderCategories();
    renderDocumentList();
  }

  function openDocumentSheet() {
    const sheet = $('#formSheet');
    const body = $('#sheetBody');
    $('#sheetLabel').textContent = 'Dokumente';
    $('#sheetTitle').textContent = 'Dokument hinzufügen';
    body.innerHTML = `<form class="form-stack" id="documentForm">
      <label>Titel<input name="title" required maxlength="100" placeholder="z. B. Protokoll Eigentümerversammlung"></label>
      <div class="form-row"><label>Bereich<select name="category">${CATEGORIES.map(item => `<option value="${item.id}" ${activeCategory === item.id ? 'selected' : ''}>${escapeHtml(item.title)}</option>`).join('')}</select></label><label>Dokumentdatum<input name="document_date" type="date"></label></div>
      <label>Notiz<textarea name="note" maxlength="300" placeholder="Optional: Worum geht es in diesem Dokument?"></textarea></label>
      <label class="document-file-picker" for="documentFile"><span class="document-file-icon">${iconSvg('form')}</span><span class="document-file-copy"><strong id="documentFileLabel">Datei auswählen</strong><small>PDF, Bild, Word oder Excel · in der Demo nur lokal</small></span><input id="documentFile" name="file" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"></label>
      <p class="form-note"><strong>Demo-Modus:</strong> Titel, Kategorie und Dateiinformation werden in diesem Browser gespeichert. Der Dateiinhalt selbst bleibt nur bis zum Neuladen verfügbar. Zentrale, geschützte Ablage folgt mit dem Backend.</p>
      <button class="button button-primary" type="submit">Dokument lokal hinzufügen</button>
    </form>`;
    sheet.classList.add('is-open');
    sheet.setAttribute('aria-hidden', 'false');
    $('#sheetBackdrop').hidden = false;
    document.body.style.overflow = 'hidden';

    const fileInput = $('#documentFile');
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      $('#documentFileLabel').textContent = file ? file.name : 'Datei auswählen';
    });
    $('#documentForm').addEventListener('submit', submitDocument);
    body.querySelector('input,select,textarea')?.focus();
  }

  function submitDocument(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = form.querySelector('[name="file"]')?.files?.[0] || null;
    const id = uid('document');
    const item = {
      ...entityBase(id),
      title: String(data.get('title') || '').trim(),
      category: String(data.get('category') || 'grundlagen'),
      document_date: String(data.get('document_date') || ''),
      note: String(data.get('note') || '').trim(),
      file: file ? { name: file.name, type: file.type, size: file.size } : null,
      storage: 'local-demo'
    };
    state.documents.unshift(item);
    if (file) fileUrls.set(id, URL.createObjectURL(file));
    persist();
    activeCategory = item.category;
    searchTerm = '';
    closeSheet();
    navigate('documents');
    renderDocuments();
    showToast(file ? 'Dokument für die Demo hinzugefügt' : 'Dokumenteintrag hinzugefügt');
  }

  function removeDocument(id) {
    const item = state.documents.find(doc => doc.id === id);
    if (!item) return;
    if (!window.confirm(`„${item.title}“ aus der lokalen Demo entfernen?`)) return;
    const url = fileUrls.get(id);
    if (url) URL.revokeObjectURL(url);
    fileUrls.delete(id);
    state.documents = state.documents.filter(doc => doc.id !== id);
    persist();
    renderDocuments();
    showToast('Dokument entfernt');
  }

  function buildWorkspace() {
    const section = $('[data-view="documents"]');
    if (!section) return;
    section.innerHTML = `
      <div class="page-head documents-view-head"><div><span class="eyebrow">Dokumente</span><h1>Wichtige Unterlagen griffbereit.</h1><p>Protokolle, Regeln, Abrechnungen, Pläne und Verträge – klar sortiert und später zentral für berechtigte Eigentümer verfügbar.</p></div><button class="button button-primary" type="button" data-action="open-document">+ Dokument hinzufügen</button></div>
      <section class="content-section docs-workspace">
        <div class="docs-demo-note"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8v.01"/></svg><div><strong>Bereich bereits nutzbar:</strong> Die Ablagestruktur, Suche, Filter und lokale Dokumenterfassung funktionieren in der Demo. Vertrauliche Originalunterlagen bitte erst nach Login/Backend zentral ablegen.</div></div>
        <div class="docs-stats">
          <div class="docs-stat"><span class="docs-stat-icon">${iconSvg('form')}</span><span class="docs-stat-copy"><strong id="docTotal">0</strong><span>Dokumente</span></span></div>
          <div class="docs-stat"><span class="docs-stat-icon">${iconSvg('plan')}</span><span class="docs-stat-copy"><strong id="docCategories">6</strong><span>Ablagebereiche</span></span></div>
          <div class="docs-stat"><span class="docs-stat-icon">${iconSvg('check')}</span><span class="docs-stat-copy"><strong id="docLatest">—</strong><span>Zuletzt ergänzt</span></span></div>
        </div>
        <div><div class="docs-section-head"><div><span class="section-label">Sauber sortiert</span><h2>Dokumentenablage</h2></div><p>Ein Bereich pro Zweck – damit niemand suchen muss.</p></div><div class="doc-category-grid" id="docCategoryGrid"></div></div>
        <div class="docs-library" id="docLibrary">
          <div class="docs-library-toolbar"><label class="doc-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg><input id="docSearch" type="search" placeholder="Dokumente durchsuchen …" autocomplete="off"></label><button class="doc-filter-reset" id="docFilterReset" type="button">Alle Bereiche</button></div>
          <div class="doc-list-head"><strong id="docListTitle">Alle Dokumente</strong><span id="docResultCount">0 Treffer</span></div><div class="doc-list" id="documentList"></div>
        </div>
      </section>`;

    $('[data-action="open-document"]')?.addEventListener('click', openDocumentSheet);
    $('#docSearch')?.addEventListener('input', event => { searchTerm = event.currentTarget.value; renderDocumentList(); });
    $('#docFilterReset')?.addEventListener('click', () => { activeCategory = 'all'; searchTerm = ''; $('#docSearch').value = ''; renderDocuments(); });
  }

  function initDocuments() {
    ensureDocumentState();
    injectDocumentStyles();
    buildWorkspace();
    renderDocuments();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initDocuments);
  else initDocuments();
})();