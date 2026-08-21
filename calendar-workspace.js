(() => {
  let activeCalendarFilter = 'all';

  const iconSvg = type => {
    const paths = {
      calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4m8-4v4M3 10h18"/>',
      service: '<path d="M14 4a2 2 0 1 1 2.8 2.8l-2.1 2.1 1.4 1.4-1.4 1.4-1.4-1.4-4.2 4.2a2 2 0 1 1-2.8-2.8l4.2-4.2-1.4-1.4L10.5 5l1.4 1.4 2.1-2.1Z"/><path d="m3 21 6-6"/>',
      people: '<path d="M16 19a4 4 0 0 0-8 0"/><circle cx="12" cy="9" r="3"/><path d="M19 19a3 3 0 0 0-2.2-2.9M5 19a3 3 0 0 1 2.2-2.9"/>',
      spark: '<path d="M12 3 9.8 8.6 4 10.3l4.2 4.1L7.1 21 12 17.8 16.9 21l-1.1-6.6 4.2-4.1-5.8-1.7Z"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[type] || paths.calendar}</svg>`;
  };

  function injectCalendarStyles() {
    if (document.querySelector('#calendarWorkspaceStyles')) return;
    const style = document.createElement('style');
    style.id = 'calendarWorkspaceStyles';
    style.textContent = `
      .calendar-workspace{display:grid;gap:16px}
      .calendar-intro-note{display:flex;align-items:flex-start;gap:11px;padding:13px 15px;border:1px solid #ded8cb;border-radius:15px;background:rgba(255,253,248,.82);color:#6f786f;font-size:11px;line-height:1.5}
      .calendar-intro-note svg{width:18px;height:18px;flex:0 0 auto;color:#35561f;margin-top:1px}.calendar-intro-note strong{color:#284414}
      .calendar-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      .calendar-stat{display:flex;align-items:center;gap:12px;padding:15px 16px;border:1px solid #e1dccf;border-radius:18px;background:#fffdf8;box-shadow:0 10px 30px rgba(39,45,40,.05)}
      .calendar-stat-icon{width:40px;height:40px;border-radius:13px;background:#edf4e6;color:#35561f;display:grid;place-items:center;flex:0 0 auto}.calendar-stat-icon svg{width:19px;height:19px}
      .calendar-stat-copy{display:flex;flex-direction:column;gap:1px}.calendar-stat-copy strong{font-size:20px;color:#17201c;letter-spacing:-.035em}.calendar-stat-copy span{font-size:9px;color:#7b837d;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
      .calendar-highlight{display:grid;grid-template-columns:1.2fr .85fr;gap:12px}
      .calendar-provider-card,.calendar-actions-card{border:1px solid #e1dccf;border-radius:22px;background:#fffdf8;box-shadow:0 12px 34px rgba(39,45,40,.05)}
      .calendar-provider-card{padding:18px;background:linear-gradient(135deg,#fffefb 0%,#faf8f2 52%,#f4f8ee 100%)}
      .calendar-provider-badge{display:inline-flex;align-items:center;gap:7px;border-radius:999px;padding:7px 10px;background:#edf4e6;color:#35561f;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.calendar-provider-badge svg{width:14px;height:14px}
      .calendar-provider-card h2{font-size:22px;letter-spacing:-.04em;margin:12px 0 7px}.calendar-provider-card p{font-size:11px;line-height:1.55;color:#79817c;margin:0}
      .calendar-provider-points{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:14px}.calendar-provider-point{padding:11px 12px;border-radius:15px;background:#fffdf8;border:1px solid #e5e0d5}.calendar-provider-point strong{display:block;font-size:11px;color:#17201c}.calendar-provider-point span{display:block;font-size:9px;line-height:1.45;color:#7c847e;margin-top:3px}
      .calendar-actions-card{padding:16px;display:grid;gap:10px}.calendar-actions-card h3{margin:0;font-size:18px;letter-spacing:-.03em}.calendar-actions-card p{margin:0;font-size:10px;line-height:1.55;color:#79817c}.calendar-mini-actions{display:grid;gap:8px}.calendar-mini-action{display:flex;align-items:center;gap:11px;padding:12px;border:1px solid #e5e0d5;border-radius:15px;background:#faf8f2;color:#17201c;cursor:pointer;text-align:left}.calendar-mini-action:hover{background:#f2f7ea;border-color:#cbd9b8}.calendar-mini-action .icon{width:36px;height:36px;border-radius:12px;background:#edf4e6;color:#35561f;display:grid;place-items:center;flex:0 0 auto}.calendar-mini-action .icon svg{width:17px;height:17px}.calendar-mini-action strong{display:block;font-size:11px}.calendar-mini-action small{display:block;font-size:9px;color:#7b837d;margin-top:3px}
      .calendar-library{border:1px solid #e1dccf;border-radius:22px;background:#fffdf8;padding:18px;box-shadow:0 12px 34px rgba(39,45,40,.05)}
      .calendar-toolbar{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;margin-bottom:14px}.calendar-list-head strong{font-size:12px}.calendar-list-head span{font-size:9px;color:#878e89;display:block;margin-top:2px}.calendar-filter-chips{display:flex;flex-wrap:wrap;gap:8px}.calendar-chip{height:36px;border:1px solid #ded8cb;border-radius:999px;background:#faf8f2;padding:0 12px;color:#35561f;font-size:10px;font-weight:800;cursor:pointer}.calendar-chip.is-active,.calendar-chip:hover{background:#edf4e6;border-color:#9fc66d}.calendar-reset{height:36px;border:1px solid #ded8cb;border-radius:999px;background:#fffdf8;padding:0 12px;color:#6f786f;font-size:9px;font-weight:800;cursor:pointer}
      .calendar-list{display:grid;gap:10px}.calendar-event-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:13px;align-items:flex-start;border:1px solid #e5e0d5;border-radius:18px;padding:14px;background:linear-gradient(180deg,#fffefb,#faf7f0)}
      .calendar-event-icon{width:44px;height:44px;border-radius:14px;background:#edf4e6;color:#35561f;display:grid;place-items:center;flex:0 0 auto}.calendar-event-icon svg{width:19px;height:19px}
      .calendar-event-main{min-width:0}.calendar-event-main strong{display:block;font-size:13px;color:#17201c}.calendar-event-main p{font-size:10px;line-height:1.5;color:#7b837d;margin:4px 0 0}.calendar-event-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.calendar-tag{font-size:8px;border-radius:999px;padding:4px 7px;background:#edf4e6;color:#35561f;font-weight:750}.calendar-tag.alt{background:#fff1d2;color:#8e5e18}.calendar-tag.soft{background:#f4f1ea;color:#6d756f}
      .calendar-event-side{display:grid;justify-items:end;gap:8px;min-width:132px}.calendar-date-box{padding:8px 11px;border-radius:14px;background:#f3efe5;border:1px solid #e1dccf;text-align:right}.calendar-date-box strong{display:block;font-size:11px;color:#17201c}.calendar-date-box span{display:block;font-size:8px;color:#7b837d;margin-top:3px}
      .calendar-join-box{display:grid;justify-items:end;gap:6px}.calendar-interest{font-size:9px;color:#7c847e}.calendar-action-button{height:36px;border:0;border-radius:11px;padding:0 13px;font-size:10px;font-weight:800;cursor:pointer}.calendar-action-button.primary{background:#0f2317;color:#fff}.calendar-action-button.soft{background:#edf4e6;color:#35561f}
      .calendar-empty{padding:30px 16px;text-align:center;border:1px dashed #ddd7ca;border-radius:16px;background:#faf8f2}.calendar-empty-icon{width:50px;height:50px;margin:0 auto 10px;border-radius:15px;background:#edf4e6;color:#35561f;display:grid;place-items:center}.calendar-empty-icon svg{width:22px;height:22px}.calendar-empty strong{display:block;font-size:13px}.calendar-empty p{font-size:10px;line-height:1.5;color:#818984;max-width:500px;margin:6px auto 0}.calendar-empty-actions{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:14px}
      @media(max-width:980px){.calendar-highlight{grid-template-columns:1fr}.calendar-provider-points{grid-template-columns:1fr}}
      @media(max-width:720px){.calendar-stats{grid-template-columns:1fr}.calendar-toolbar{grid-template-columns:1fr;align-items:flex-start}.calendar-event-row{grid-template-columns:auto minmax(0,1fr)}.calendar-event-side{grid-column:2;justify-items:start;min-width:0}.calendar-date-box{text-align:left}.calendar-join-box{justify-items:start}}
    `;
    document.head.appendChild(style);
  }

  function ensureWorkspace() {
    const list = document.querySelector('#eventList');
    if (!list) return null;
    const section = list.closest('.content-section');
    if (!section) return null;
    if (!document.querySelector('#calendarWorkspace')) {
      section.innerHTML = `
        <div class="calendar-workspace" id="calendarWorkspace">
          <div class="calendar-intro-note"><span>${iconSvg('spark')}</span><div><strong>Termine klar bündeln:</strong> Gemeinschaftstermine und Dienstleistereinsätze werden hier an einem Ort gesammelt, damit Eigentümer schneller sehen, wann etwas passiert und ob sich ein gemeinsamer Bedarf lohnt.</div></div>
          <div class="calendar-stats">
            <article class="calendar-stat"><span class="calendar-stat-icon">${iconSvg('calendar')}</span><div class="calendar-stat-copy"><strong id="calendarMetricTotal">0</strong><span>Geplante Termine</span></div></article>
            <article class="calendar-stat"><span class="calendar-stat-icon">${iconSvg('service')}</span><div class="calendar-stat-copy"><strong id="calendarMetricService">0</strong><span>Dienstleister-Einsätze</span></div></article>
            <article class="calendar-stat"><span class="calendar-stat-icon">${iconSvg('people')}</span><div class="calendar-stat-copy"><strong id="calendarMetricNeeds">0</strong><span>Gebündelte Bedarfe</span></div></article>
          </div>
          <div class="calendar-highlight">
            <article class="calendar-provider-card">
              <span class="calendar-provider-badge">${iconSvg('service')} Gemeinsam sparen</span>
              <h2>Ist ohnehin jemand im Dorf?</h2>
              <p>Wenn Elektriker, Gärtner oder andere Dienstleister sowieso schon vor Ort sind, können weitere Eigentümer ihren Bedarf direkt dazubuchen – weniger Fahrten, weniger Leerlauf und oft bessere Konditionen.</p>
              <div class="calendar-provider-points">
                <div class="calendar-provider-point"><strong>Dienstleister ankündigen</strong><span>Eintragen, wann jemand vor Ort ist und worum es geht.</span></div>
                <div class="calendar-provider-point"><strong>Bedarf anmelden</strong><span>Andere Eigentümer können sich mit einem Klick anhängen.</span></div>
                <div class="calendar-provider-point"><strong>Besser abstimmen</strong><span>Alle sehen frühzeitig, was im Dorf geplant ist.</span></div>
              </div>
            </article>
            <aside class="calendar-actions-card">
              <div><span class="section-label">Direkt starten</span><h3>Was möchtest du teilen?</h3><p>Schnell zum richtigen Eintrag – ohne Umwege.</p></div>
              <div class="calendar-mini-actions">
                <button class="calendar-mini-action" type="button" data-calendar-new="service"><span class="icon">${iconSvg('service')}</span><span><strong>Dienstleister eintragen</strong><small>Elektriker, Gärtner, Wartung & mehr</small></span></button>
                <button class="calendar-mini-action" type="button" data-calendar-new="community"><span class="icon">${iconSvg('calendar')}</span><span><strong>Gemeinschaftstermin teilen</strong><small>Besprechung, Arbeitseinsatz oder Treffen</small></span></button>
              </div>
            </aside>
          </div>
          <div class="calendar-library" id="calendarLibrary">
            <div class="calendar-toolbar">
              <div class="calendar-list-head"><strong id="calendarListTitle">Alle Termine</strong><span id="calendarResultCount">0 Einträge</span></div>
              <div class="calendar-filter-chips">
                <button class="calendar-chip is-active" type="button" data-calendar-filter="all">Alle</button>
                <button class="calendar-chip" type="button" data-calendar-filter="service">Dienstleister</button>
                <button class="calendar-chip" type="button" data-calendar-filter="community">Gemeinschaft</button>
              </div>
              <button class="calendar-reset" type="button" id="calendarResetFilter">Filter zurücksetzen</button>
            </div>
            <div class="calendar-list" id="calendarRichList"></div>
          </div>
        </div>`;
    }
    return document.querySelector('#calendarWorkspace');
  }

  function visibleEvents() {
    const items = [...state.events].sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.created_at).localeCompare(String(b.created_at)));
    return items.filter(item => activeCalendarFilter === 'all' || item.kind === activeCalendarFilter);
  }

  function renderCalendarStats() {
    const total = state.events.length;
    const service = state.events.filter(item => item.kind === 'service').length;
    const needs = state.events.filter(item => item.kind === 'service').reduce((sum, item) => sum + Number(item.interest_count || 0), 0);
    document.querySelector('#calendarMetricTotal')?.replaceChildren(document.createTextNode(String(total)));
    document.querySelector('#calendarMetricService')?.replaceChildren(document.createTextNode(String(service)));
    document.querySelector('#calendarMetricNeeds')?.replaceChildren(document.createTextNode(String(needs)));
  }

  function renderCalendarList() {
    const root = document.querySelector('#calendarRichList');
    if (!root) return;
    const items = visibleEvents();
    const titleMap = { all: 'Alle Termine', service: 'Dienstleister im Dorf', community: 'Gemeinschaftstermine' };
    document.querySelector('#calendarListTitle').textContent = titleMap[activeCalendarFilter] || 'Alle Termine';
    document.querySelector('#calendarResultCount').textContent = `${items.length} ${items.length === 1 ? 'Eintrag' : 'Einträge'}`;
    document.querySelectorAll('[data-calendar-filter]').forEach(button => button.classList.toggle('is-active', button.dataset.calendarFilter === activeCalendarFilter));

    if (!items.length) {
      root.innerHTML = `<div class="calendar-empty"><span class="calendar-empty-icon">${iconSvg('calendar')}</span><strong>${activeCalendarFilter === 'service' ? 'Noch keine Dienstleister-Termine' : activeCalendarFilter === 'community' ? 'Noch keine Gemeinschaftstermine' : 'Noch keine Termine'}</strong><p>${activeCalendarFilter === 'service' ? 'Sobald jemand aus dem Dorf einen Elektriker, Gärtner oder anderen Dienstleister einträgt, erscheint der Einsatz hier und weitere Eigentümer können ihren Bedarf bündeln.' : activeCalendarFilter === 'community' ? 'Besprechungen, Treffen oder gemeinsame Arbeitseinsätze werden hier sichtbar, sobald sie eingetragen wurden.' : 'Gemeinschaftstermine und Dienstleisterbesuche können hier zentral angekündigt werden, damit alle Eigentümer frühzeitig Bescheid wissen.'}</p><div class="calendar-empty-actions"><button class="button button-primary" type="button" data-calendar-new="service">+ Termin eintragen</button></div></div>`;
      bindCalendarActions(root);
      return;
    }

    root.innerHTML = items.map(item => {
      const dateText = item.date ? fmtDate(item.date, false) : 'Termin offen';
      const createdText = fmtDateTime(item.created_at);
      return `<article class="calendar-event-row"><span class="calendar-event-icon">${item.kind === 'service' ? iconSvg('service') : iconSvg('calendar')}</span><div class="calendar-event-main"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.details || (item.kind === 'service' ? 'Dienstleisterbesuch im Feriendorf.' : 'Gemeinsamer Termin im Feriendorf.'))}</p><div class="calendar-event-meta"><span class="calendar-tag ${item.kind === 'service' ? 'alt' : ''}">${item.kind === 'service' ? 'Dienstleister' : 'Gemeinschaft'}</span>${item.provider ? `<span class="calendar-tag soft">${escapeHtml(item.provider)}</span>` : ''}<span class="calendar-tag soft">eingetragen ${escapeHtml(createdText)}</span></div></div><div class="calendar-event-side"><div class="calendar-date-box"><strong>${escapeHtml(dateText)}</strong><span>${item.kind === 'service' ? 'Einsatz geplant' : 'Termin geplant'}</span></div>${item.kind === 'service' ? `<div class="calendar-join-box"><div class="calendar-interest"><strong>${Number(item.interest_count || 0)}</strong> weitere Bedarfe</div><button class="calendar-action-button ${item.joined ? 'soft' : 'primary'}" type="button" data-join-event="${escapeHtml(item.id)}">${item.joined ? 'Bedarf angemeldet ✓' : 'Bedarf anmelden'}</button></div>` : ''}</div></article>`;
    }).join('');

    document.querySelectorAll('#calendarRichList [data-join-event]').forEach(button => button.addEventListener('click', () => {
      const item = state.events.find(event => event.id === button.dataset.joinEvent);
      if (!item) return;
      item.joined = !item.joined;
      item.interest_count = Math.max(0, Number(item.interest_count || 0) + (item.joined ? 1 : -1));
      persist();
      renderAll();
      showToast(item.joined ? 'Bedarf angemeldet' : 'Anmeldung entfernt');
    }));
  }

  function preselectEventType(kind) {
    openSheet('event');
    const select = document.querySelector('#eventForm select[name="kind"]');
    if (select) select.value = kind;
  }

  function bindCalendarActions(root = document) {
    root.querySelectorAll('[data-calendar-new]').forEach(button => {
      if (button.dataset.bound === 'true') return;
      button.dataset.bound = 'true';
      button.addEventListener('click', () => preselectEventType(button.dataset.calendarNew || 'service'));
    });
  }

  function bindCalendarWorkspace() {
    document.querySelectorAll('[data-calendar-filter]').forEach(button => {
      if (button.dataset.bound === 'true') return;
      button.dataset.bound = 'true';
      button.addEventListener('click', () => {
        activeCalendarFilter = button.dataset.calendarFilter || 'all';
        renderCalendarList();
      });
    });
    const reset = document.querySelector('#calendarResetFilter');
    if (reset && reset.dataset.bound !== 'true') {
      reset.dataset.bound = 'true';
      reset.addEventListener('click', () => {
        activeCalendarFilter = 'all';
        renderCalendarList();
      });
    }
    bindCalendarActions(document.querySelector('#calendarWorkspace'));
  }

  const originalRenderEvents = renderEvents;
  renderEvents = function renderEventsWorkspace() {
    originalRenderEvents();
    ensureWorkspace();
    renderCalendarStats();
    renderCalendarList();
    bindCalendarWorkspace();
  };

  injectCalendarStyles();
})();