(() => {
  const TYPES = [
    { id:'help', label:'Hilfe gesucht', short:'Hilfe', desc:'Hauscheck, kleine Hilfe oder Unterstützung im Dorf.', icon:'help', action:'Ich kann helfen' },
    { id:'offer', label:'Hilfe angeboten', short:'Angebot', desc:'Du bist vor Ort und kannst etwas übernehmen oder mitbringen.', icon:'offer', action:'Interesse' },
    { id:'borrow', label:'Leihen & Verleihen', short:'Leihen', desc:'Werkzeug, Leiter oder andere Dinge unkompliziert teilen.', icon:'borrow', action:'Interesse anmelden' },
    { id:'together', label:'Gemeinsam organisieren', short:'Gemeinsam', desc:'Besorgung, Fahrt oder andere Aktion mit mehreren bündeln.', icon:'together', action:'Mitmachen' },
    { id:'tip', label:'Tipp & Empfehlung', short:'Tipp', desc:'Erfahrungen, Kontakte und hilfreiche Empfehlungen teilen.', icon:'tip', action:'Tipp merken' },
    { id:'give', label:'Abzugeben', short:'Abzugeben', desc:'Dinge verschenken oder unkompliziert weitergeben.', icon:'give', action:'Interesse' }
  ];
  let activeFilter = 'all';
  let showDone = false;

  const icons = {
    help:'<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z"/>',
    offer:'<path d="M4 13h5l2 2 4-4 5 2v5H4z"/><path d="M7 13V7a2 2 0 0 1 4 0v5m0-3a2 2 0 0 1 4 0v3"/>',
    borrow:'<path d="M5 8h14v10H5z"/><path d="M8 8V5h8v3m-5 5h2"/>',
    together:'<circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M14 16.5a4 4 0 0 1 6.5 3.5"/>',
    tip:'<path d="M9 18h6m-5 3h4"/><path d="M8 14a6 6 0 1 1 8 0c-1 .8-1.5 1.7-1.5 3h-5c0-1.3-.5-2.2-1.5-3Z"/>',
    give:'<path d="M4 10h16v10H4zM3 6h18v4H3z"/><path d="M12 6v14M12 6c-1.5-3.5-5-3.5-5 0 0 1.5 2 2 5 0m0-3c1.5-3.5 5-3.5 5 0 0 1.5-2 2-5 0"/>',
    spark:'<path d="M12 3 9.8 8.6 4 10.3l4.2 4.1L7.1 21 12 17.8 16.9 21l-1.1-6.6 4.2-4.1-5.8-1.7Z"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    filter:'<path d="M4 6h16M7 12h10m-7 6h4"/>'
  };
  const svg = key => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[key] || icons.help}</svg>`;

  function normalizeType(item) {
    if (TYPES.some(type => type.id === item.kind_id)) return item.kind_id;
    const kind = String(item.kind || '').toLowerCase();
    if (kind.includes('verleih') || kind.includes('leih')) return 'borrow';
    if (kind.includes('tipp') || kind.includes('empfehl')) return 'tip';
    if (kind.includes('gemeinsam') || kind.includes('bestell') || kind.includes('besorg')) return 'together';
    if (kind.includes('angebot')) return 'offer';
    if (kind.includes('abzugeben') || kind.includes('verschenk')) return 'give';
    return 'help';
  }
  const typeFor = item => TYPES.find(type => type.id === normalizeType(item)) || TYPES[0];
  const isDone = item => item.status === 'done' || item.status === 'Erledigt';

  function injectStyles() {
    if (document.querySelector('#communityWorkspaceStyles')) return;
    const style = document.createElement('style');
    style.id = 'communityWorkspaceStyles';
    style.textContent = `
      .community-workspace{display:grid;gap:16px}.community-intro{display:flex;align-items:flex-start;gap:11px;padding:13px 15px;border:1px solid #ded8cb;border-radius:15px;background:rgba(255,253,248,.82);color:#6f786f;font-size:11px;line-height:1.5}.community-intro svg{width:18px;height:18px;flex:0 0 auto;color:#35561f;margin-top:1px}.community-intro strong{color:#284414}
      .community-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.community-stat{display:flex;align-items:center;gap:12px;padding:15px 16px;border:1px solid #e1dccf;border-radius:18px;background:#fffdf8;box-shadow:0 10px 30px rgba(39,45,40,.05)}.community-stat-icon{width:40px;height:40px;border-radius:13px;background:#edf4e6;color:#35561f;display:grid;place-items:center}.community-stat-icon svg{width:19px;height:19px}.community-stat-copy strong{display:block;font-size:20px;color:#17201c;letter-spacing:-.035em}.community-stat-copy span{font-size:9px;color:#7b837d;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
      .community-create{border:1px solid #e1dccf;border-radius:22px;background:linear-gradient(135deg,#fffefb,#faf8f2 55%,#f4f8ee);padding:18px;box-shadow:0 12px 34px rgba(39,45,40,.05)}.community-create-head{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin-bottom:13px}.community-create-head h2{font-size:22px;letter-spacing:-.04em;margin:3px 0 0}.community-create-head p{font-size:10px;color:#7c847e;margin:0;max-width:470px}.community-type-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.community-type-card{border:1px solid #e4dfd4;border-radius:17px;background:#fffdf8;padding:14px;text-align:left;display:flex;gap:11px;align-items:flex-start;cursor:pointer;color:#17201c;transition:.18s ease}.community-type-card:hover{transform:translateY(-2px);border-color:#c7d6b4;box-shadow:0 12px 26px rgba(39,45,40,.06)}.community-type-icon{width:38px;height:38px;border-radius:12px;background:#edf4e6;color:#35561f;display:grid;place-items:center;flex:0 0 auto}.community-type-icon svg{width:18px;height:18px}.community-type-copy strong{font-size:11px;display:block}.community-type-copy span{display:block;font-size:9px;color:#7c847e;line-height:1.45;margin-top:3px}
      .community-library{border:1px solid #e1dccf;border-radius:22px;background:#fffdf8;padding:18px;box-shadow:0 12px 34px rgba(39,45,40,.05)}.community-toolbar{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;margin-bottom:14px}.community-list-head strong{font-size:12px}.community-list-head span{font-size:9px;color:#878e89;display:block;margin-top:2px}.community-filter-chips{display:flex;flex-wrap:wrap;gap:7px}.community-chip{height:34px;border:1px solid #ded8cb;border-radius:999px;background:#faf8f2;padding:0 11px;color:#35561f;font-size:9px;font-weight:800;cursor:pointer}.community-chip.is-active,.community-chip:hover{background:#edf4e6;border-color:#9fc66d}.community-done-toggle{height:34px;border:1px solid #ded8cb;border-radius:999px;background:#fffdf8;padding:0 11px;color:#6f786f;font-size:9px;font-weight:800;cursor:pointer}.community-done-toggle.is-active{background:#f1efe9;color:#17201c}
      .community-post-list{display:grid;gap:10px}.community-post{border:1px solid #e5e0d5;border-radius:18px;padding:15px;background:linear-gradient(180deg,#fffefb,#faf7f0)}.community-post.is-done{opacity:.72;background:#f6f3ec}.community-post-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.community-post-title{display:flex;gap:11px;min-width:0}.community-post-icon{width:42px;height:42px;border-radius:13px;background:#edf4e6;color:#35561f;display:grid;place-items:center;flex:0 0 auto}.community-post-icon svg{width:19px;height:19px}.community-post h3{font-size:14px;line-height:1.35;margin:0;color:#17201c}.community-post p{font-size:10px;line-height:1.55;color:#727b75;margin:5px 0 0}.community-post-status{font-size:8px;border-radius:999px;padding:5px 8px;background:#edf4e6;color:#35561f;font-weight:800;white-space:nowrap}.community-post-status.done{background:#ece9e2;color:#6f756f}.community-post-meta{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}.community-tag{font-size:8px;border-radius:999px;padding:4px 7px;background:#f4f1ea;color:#6d756f;font-weight:750}.community-tag.type{background:#fff1d2;color:#8e5e18}.community-post-actions{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:10px;border-top:1px solid #e7e2d8}.community-response{font-size:9px;color:#7d857f}.community-buttons{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.community-action{height:36px;border:0;border-radius:11px;padding:0 13px;font-size:9px;font-weight:800;cursor:pointer}.community-action.primary{background:#0f2317;color:#fff}.community-action.soft{background:#edf4e6;color:#35561f}.community-action.ghost{border:1px solid #ddd8cd;background:#fffdf8;color:#6f786f}
      .community-empty{padding:30px 16px;text-align:center;border:1px dashed #ddd7ca;border-radius:16px;background:#faf8f2}.community-empty-icon{width:50px;height:50px;margin:0 auto 10px;border-radius:15px;background:#edf4e6;color:#35561f;display:grid;place-items:center}.community-empty-icon svg{width:22px;height:22px}.community-empty strong{display:block;font-size:13px}.community-empty p{font-size:10px;line-height:1.5;color:#818984;max-width:520px;margin:6px auto 0}.community-empty .button{margin-top:13px}
      .board-kind-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.board-kind-option{position:relative}.board-kind-option input{position:absolute;opacity:0;pointer-events:none}.board-kind-option span{display:flex;align-items:center;gap:9px;min-height:50px;border:1px solid #ded8cb;border-radius:14px;padding:10px 11px;background:#faf8f2;cursor:pointer;font-size:10px;font-weight:750}.board-kind-option input:checked+span{background:#edf4e6;border-color:#8fb763;box-shadow:0 0 0 3px rgba(184,223,134,.14)}.board-kind-option svg{width:17px;height:17px;color:#35561f;flex:0 0 auto}
      @media(max-width:980px){.community-type-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.community-toolbar{grid-template-columns:1fr;align-items:flex-start}}@media(max-width:720px){.community-stats{grid-template-columns:1fr}.community-type-grid{grid-template-columns:1fr}.community-create-head{align-items:flex-start;flex-direction:column}.community-post-head{flex-direction:column}.community-post-status{align-self:flex-start}.community-post-actions{align-items:flex-start;flex-direction:column}.community-buttons{justify-content:flex-start}.board-kind-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function boardForm(selected='help') {
    return `<form class="form-stack" id="boardFormV2">
      <div><span class="media-field-label">Was für ein Beitrag ist es?</span><div class="board-kind-grid">${TYPES.map(type => `<label class="board-kind-option"><input type="radio" name="kind_id" value="${type.id}" ${type.id===selected?'checked':''}><span>${svg(type.icon)}${escapeHtml(type.label)}</span></label>`).join('')}</div></div>
      <label>Titel<input name="title" required maxlength="90" placeholder="z. B. Kann jemand am Wochenende nach Haus 27 schauen?"></label>
      <label>Beschreibung<textarea name="text" required maxlength="700" placeholder="Kurz beschreiben, worum es geht und was gebraucht oder angeboten wird."></textarea></label>
      <div class="form-row"><label>Wann?<input name="when" maxlength="80" placeholder="z. B. Samstagvormittag"></label><label>Ort / Haus<input name="location" maxlength="80" placeholder="optional"></label></div>
      <p class="form-note">Der Beitrag wird im MVP lokal in diesem Browser gespeichert. Persönliche Kontaktdaten bitte noch nicht eintragen.</p>
      <button class="button button-primary" type="submit">Beitrag veröffentlichen</button>
    </form>`;
  }

  const baseOpenSheet = openSheet;
  function openBoardSheet(selected='help') {
    baseOpenSheet('board');
    $('#sheetLabel').textContent = 'Gemeinschaft';
    $('#sheetTitle').textContent = TYPES.find(type => type.id===selected)?.label || 'Beitrag erstellen';
    $('#sheetBody').innerHTML = boardForm(selected);
    $('#boardFormV2').addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const kindId = String(data.get('kind_id') || 'help');
      const type = TYPES.find(item => item.id === kindId) || TYPES[0];
      state.board.unshift({
        ...entityBase(uid('board')),
        kind_id: kindId,
        kind: type.label,
        title: String(data.get('title') || '').trim(),
        text: String(data.get('text') || '').trim(),
        when: String(data.get('when') || '').trim(),
        location: String(data.get('location') || '').trim(),
        status: 'open',
        responded: false
      });
      persist(); renderAll(); closeSheet(); navigate('community'); showToast('Beitrag veröffentlicht');
    });
    $('#boardFormV2 input[name="title"]')?.focus();
  }
  openSheet = function communityAwareSheet(type) {
    if (type === 'board') return openBoardSheet('help');
    return baseOpenSheet(type);
  };

  function ensureWorkspace() {
    const list = $('#boardList');
    if (!list) return null;
    const section = list.closest('.content-section');
    if (!section) return null;
    if (!$('#communityWorkspace')) {
      section.innerHTML = `<div class="community-workspace" id="communityWorkspace">
        <div class="community-intro"><span>${svg('spark')}</span><div><strong>Nachbarschaft statt Nachrichtenflut:</strong> Jeder Beitrag hat einen klaren Zweck, eine passende Aktion und einen Status. So sieht man sofort, wo noch Hilfe, Interesse oder Mitmacher gebraucht werden.</div></div>
        <div class="community-stats">
          <article class="community-stat"><span class="community-stat-icon">${svg('help')}</span><div class="community-stat-copy"><strong id="communityMetricRequests">0</strong><span>Offene Anfragen</span></div></article>
          <article class="community-stat"><span class="community-stat-icon">${svg('offer')}</span><div class="community-stat-copy"><strong id="communityMetricOffers">0</strong><span>Aktive Angebote</span></div></article>
          <article class="community-stat"><span class="community-stat-icon">${svg('together')}</span><div class="community-stat-copy"><strong id="communityMetricTogether">0</strong><span>Gemeinsame Aktionen</span></div></article>
        </div>
        <section class="community-create">
          <div class="community-create-head"><div><span class="section-label">Direkt starten</span><h2>Was möchtest du teilen?</h2></div><p>Wähle zuerst den passenden Beitragstyp. Dadurch bekommt jeder Beitrag genau die Aktion, die im Alltag sinnvoll ist.</p></div>
          <div class="community-type-grid">${TYPES.map(type => `<button class="community-type-card" type="button" data-board-new="${type.id}"><span class="community-type-icon">${svg(type.icon)}</span><span class="community-type-copy"><strong>${escapeHtml(type.label)}</strong><span>${escapeHtml(type.desc)}</span></span></button>`).join('')}</div>
        </section>
        <section class="community-library">
          <div class="community-toolbar"><div class="community-list-head"><strong id="communityListTitle">Aktive Beiträge</strong><span id="communityResultCount">0 Einträge</span></div><div class="community-filter-chips">
            <button class="community-chip is-active" data-board-filter="all" type="button">Alle</button><button class="community-chip" data-board-filter="help" type="button">Hilfe</button><button class="community-chip" data-board-filter="borrow" type="button">Leihen</button><button class="community-chip" data-board-filter="together" type="button">Gemeinsam</button><button class="community-chip" data-board-filter="tip" type="button">Tipps</button><button class="community-chip" data-board-filter="give" type="button">Abzugeben</button>
          </div><button class="community-done-toggle" id="communityDoneToggle" type="button">Erledigte anzeigen</button></div>
          <div class="community-post-list" id="communityPostList"></div>
        </section>
      </div>`;
    }
    return $('#communityWorkspace');
  }

  function filtered() {
    return [...state.board].sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))).filter(item => {
      if (!showDone && isDone(item)) return false;
      const type = normalizeType(item);
      if (activeFilter === 'all') return true;
      if (activeFilter === 'help') return type === 'help' || type === 'offer';
      return type === activeFilter;
    });
  }

  function renderStats() {
    const active = state.board.filter(item => !isDone(item));
    $('#communityMetricRequests').textContent = active.filter(item => ['help','borrow'].includes(normalizeType(item))).length;
    $('#communityMetricOffers').textContent = active.filter(item => ['offer','give'].includes(normalizeType(item))).length;
    $('#communityMetricTogether').textContent = active.filter(item => normalizeType(item)==='together').length;
  }

  function renderPosts() {
    const root = $('#communityPostList'); if (!root) return;
    const items = filtered();
    $('#communityResultCount').textContent = `${items.length} ${items.length===1?'Eintrag':'Einträge'}`;
    $('#communityListTitle').textContent = showDone ? 'Beiträge inkl. erledigt' : 'Aktive Beiträge';
    $$('[data-board-filter]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.boardFilter===activeFilter));
    $('#communityDoneToggle')?.classList.toggle('is-active', showDone);
    if (!items.length) {
      root.innerHTML = `<div class="community-empty"><span class="community-empty-icon">${svg(activeFilter==='all'?'help':activeFilter)}</span><strong>Noch keine passenden Beiträge</strong><p>Starte den ersten konkreten Nachbarschaftsbeitrag – Hilfe, Leihen, gemeinsames Organisieren oder einen Tipp.</p><button class="button button-primary" type="button" data-board-new="${activeFilter==='all'?'help':activeFilter}">+ Beitrag erstellen</button></div>`;
      bindDynamic(root); return;
    }
    root.innerHTML = items.map(item => {
      const type = typeFor(item), done = isDone(item), responded = !!item.responded;
      const responseText = type.id==='tip' ? (responded?'Tipp gemerkt':'Noch nicht gemerkt') : (responded?'Du hast Interesse angemeldet':'Noch keine Aktion von dir');
      return `<article class="community-post ${done?'is-done':''}"><div class="community-post-head"><div class="community-post-title"><span class="community-post-icon">${svg(type.icon)}</span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text || 'Keine weiteren Angaben.')}</p></div></div><span class="community-post-status ${done?'done':''}">${done?'Erledigt':'Offen'}</span></div><div class="community-post-meta"><span class="community-tag type">${escapeHtml(type.label)}</span>${item.when?`<span class="community-tag">${escapeHtml(item.when)}</span>`:''}${item.location?`<span class="community-tag">${escapeHtml(item.location)}</span>`:''}<span class="community-tag">${escapeHtml(fmtDateTime(item.created_at))}</span></div><div class="community-post-actions"><span class="community-response">${escapeHtml(responseText)}</span><div class="community-buttons">${done?'':`<button class="community-action ${responded?'soft':'primary'}" type="button" data-board-respond="${escapeHtml(item.id)}">${responded?'Aktion zurücknehmen':escapeHtml(type.action)}</button>`}<button class="community-action ghost" type="button" data-board-done="${escapeHtml(item.id)}">${done?'Wieder öffnen':'Als erledigt markieren'}</button></div></div></article>`;
    }).join('');
    bindDynamic(root);
  }

  function bindDynamic(root=document) {
    $$('[data-board-new]',root).forEach(btn => { if(btn.dataset.bound)return; btn.dataset.bound='1'; btn.addEventListener('click',()=>openBoardSheet(btn.dataset.boardNew||'help')); });
    $$('[data-board-respond]',root).forEach(btn => btn.addEventListener('click',()=>{ const item=state.board.find(x=>x.id===btn.dataset.boardRespond); if(!item)return; item.responded=!item.responded; persist(); renderAll(); showToast(item.responded?'Aktion gespeichert':'Aktion zurückgenommen'); }));
    $$('[data-board-done]',root).forEach(btn => btn.addEventListener('click',()=>{ const item=state.board.find(x=>x.id===btn.dataset.boardDone); if(!item)return; item.status=isDone(item)?'open':'done'; persist(); renderAll(); showToast(isDone(item)?'Beitrag erledigt':'Beitrag wieder geöffnet'); }));
  }

  function bindWorkspace() {
    $$('[data-board-filter]').forEach(btn=>{ if(btn.dataset.bound)return; btn.dataset.bound='1'; btn.addEventListener('click',()=>{activeFilter=btn.dataset.boardFilter||'all';renderPosts();}); });
    const done=$('#communityDoneToggle'); if(done && !done.dataset.bound){done.dataset.bound='1';done.addEventListener('click',()=>{showDone=!showDone;renderPosts();});}
    bindDynamic($('#communityWorkspace'));
  }

  const baseRenderBoard = renderBoard;
  renderBoard = function renderCommunityWorkspace() {
    baseRenderBoard(); ensureWorkspace(); renderStats(); renderPosts(); bindWorkspace();
  };

  injectStyles();
})();
