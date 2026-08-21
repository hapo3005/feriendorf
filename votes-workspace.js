(() => {
  let activeVoteFilter = 'all';

  const iconSvg = type => {
    const paths = {
      vote: '<path d="m5 12 4 4L19 6"/><path d="M4 4h16v16H4z"/>',
      people: '<path d="M16 19a4 4 0 0 0-8 0"/><circle cx="12" cy="9" r="3"/><path d="M19 19a3 3 0 0 0-2.2-2.9M5 19a3 3 0 0 1 2.2-2.9"/>',
      open: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
      spark: '<path d="M12 3 9.8 8.6 4 10.3l4.2 4.1L7.1 21 12 17.8 16.9 21l-1.1-6.6 4.2-4.1-5.8-1.7Z"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[type] || paths.vote}</svg>`;
  };

  function injectVoteStyles() {
    if (document.querySelector('#voteWorkspaceStyles')) return;
    const style = document.createElement('style');
    style.id = 'voteWorkspaceStyles';
    style.textContent = `
      .vote-workspace{display:grid;gap:16px}.vote-intro-note{display:flex;align-items:flex-start;gap:11px;padding:13px 15px;border:1px solid #ded8cb;border-radius:15px;background:rgba(255,253,248,.82);color:#6f786f;font-size:11px;line-height:1.5}.vote-intro-note svg{width:18px;height:18px;flex:0 0 auto;color:#35561f;margin-top:1px}.vote-intro-note strong{color:#284414}
      .vote-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.vote-stat{display:flex;align-items:center;gap:12px;padding:15px 16px;border:1px solid #e1dccf;border-radius:18px;background:#fffdf8;box-shadow:0 10px 30px rgba(39,45,40,.05)}.vote-stat-icon{width:40px;height:40px;border-radius:13px;background:#edf4e6;color:#35561f;display:grid;place-items:center;flex:0 0 auto}.vote-stat-icon svg{width:19px;height:19px}.vote-stat-copy{display:flex;flex-direction:column;gap:1px}.vote-stat-copy strong{font-size:20px;color:#17201c;letter-spacing:-.035em}.vote-stat-copy span{font-size:9px;color:#7b837d;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
      .vote-highlight{display:grid;grid-template-columns:1.2fr .85fr;gap:12px}.vote-how-card,.vote-rule-card{border:1px solid #e1dccf;border-radius:22px;background:#fffdf8;box-shadow:0 12px 34px rgba(39,45,40,.05)}.vote-how-card{padding:18px;background:linear-gradient(135deg,#fffefb 0%,#faf8f2 52%,#f4f8ee 100%)}.vote-how-badge{display:inline-flex;align-items:center;gap:7px;border-radius:999px;padding:7px 10px;background:#edf4e6;color:#35561f;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.vote-how-badge svg{width:14px;height:14px}.vote-how-card h2{font-size:22px;letter-spacing:-.04em;margin:12px 0 7px}.vote-how-card>p{font-size:11px;line-height:1.55;color:#79817c;margin:0}.vote-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:14px}.vote-step{padding:11px 12px;border-radius:15px;background:#fffdf8;border:1px solid #e5e0d5}.vote-step strong{display:block;font-size:11px;color:#17201c}.vote-step span{display:block;font-size:9px;line-height:1.45;color:#7c847e;margin-top:3px}
      .vote-rule-card{padding:16px;display:grid;align-content:start;gap:11px}.vote-rule-icon{width:40px;height:40px;border-radius:13px;background:#fff1d2;color:#8e5e18;display:grid;place-items:center}.vote-rule-icon svg{width:19px;height:19px}.vote-rule-card h3{font-size:18px;letter-spacing:-.03em;margin:0}.vote-rule-card p{font-size:10px;line-height:1.55;color:#79817c;margin:0}.vote-rule-card .button{justify-self:start;margin-top:2px}
      .vote-library{border:1px solid #e1dccf;border-radius:22px;background:#fffdf8;padding:18px;box-shadow:0 12px 34px rgba(39,45,40,.05)}.vote-toolbar{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;margin-bottom:14px}.vote-list-head strong{font-size:12px}.vote-list-head span{font-size:9px;color:#878e89;display:block;margin-top:2px}.vote-filter-chips{display:flex;flex-wrap:wrap;gap:8px}.vote-chip{height:36px;border:1px solid #ded8cb;border-radius:999px;background:#faf8f2;padding:0 12px;color:#35561f;font-size:10px;font-weight:800;cursor:pointer}.vote-chip.is-active,.vote-chip:hover{background:#edf4e6;border-color:#9fc66d}.vote-reset{height:36px;border:1px solid #ded8cb;border-radius:999px;background:#fffdf8;padding:0 12px;color:#6f786f;font-size:9px;font-weight:800;cursor:pointer}
      .vote-rich-list{display:grid;gap:10px}.vote-rich-card{border:1px solid #e5e0d5;border-radius:18px;padding:15px;background:linear-gradient(180deg,#fffefb,#faf7f0)}.vote-rich-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.vote-rich-head h3{font-size:14px;line-height:1.35;letter-spacing:-.02em;margin:0;color:#17201c}.vote-status{flex:0 0 auto;font-size:8px;border-radius:999px;padding:5px 8px;background:#fff1d2;color:#8e5e18;font-weight:800}.vote-status.done{background:#edf4e6;color:#35561f}.vote-rich-meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.vote-mini-tag{font-size:8px;border-radius:999px;padding:4px 7px;background:#f4f1ea;color:#6d756f;font-weight:750}.vote-choices{display:grid;gap:8px;margin-top:13px}.vote-choice{position:relative;overflow:hidden;border:1px solid #ded8cb;border-radius:14px;background:#fffdf8;padding:0;cursor:pointer;text-align:left;min-height:48px}.vote-choice:hover{border-color:#b7c99e}.vote-choice.is-selected{border-color:#8bb45b;box-shadow:0 0 0 3px rgba(184,223,134,.14)}.vote-choice-fill{position:absolute;inset:0 auto 0 0;background:#edf4e6;pointer-events:none}.vote-choice-content{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:11px 12px}.vote-choice-content strong{font-size:11px;color:#17201c}.vote-choice-result{font-size:9px;color:#6f786f;font-weight:800}.vote-summary{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:10px;font-size:9px;color:#7a827d}.vote-summary strong{color:#35561f}.vote-local-note{font-size:8px;color:#919790}
      .vote-empty{padding:30px 16px;text-align:center;border:1px dashed #ddd7ca;border-radius:16px;background:#faf8f2}.vote-empty-icon{width:50px;height:50px;margin:0 auto 10px;border-radius:15px;background:#edf4e6;color:#35561f;display:grid;place-items:center}.vote-empty-icon svg{width:22px;height:22px}.vote-empty strong{display:block;font-size:13px}.vote-empty p{font-size:10px;line-height:1.5;color:#818984;max-width:500px;margin:6px auto 0}.vote-empty-actions{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:14px}
      @media(max-width:980px){.vote-highlight{grid-template-columns:1fr}.vote-steps{grid-template-columns:1fr}}@media(max-width:720px){.vote-stats{grid-template-columns:1fr}.vote-toolbar{grid-template-columns:1fr;align-items:flex-start}.vote-rich-head{flex-direction:column}.vote-status{align-self:flex-start}.vote-summary{align-items:flex-start;flex-direction:column}}
    `;
    document.head.appendChild(style);
  }

  function ensureWorkspace() {
    const list = document.querySelector('#voteList');
    if (!list) return null;
    const section = list.closest('.content-section');
    if (!section) return null;
    if (!document.querySelector('#voteWorkspace')) {
      section.innerHTML = `
        <div class="vote-workspace" id="voteWorkspace">
          <div class="vote-intro-note"><span>${iconSvg('spark')}</span><div><strong>Mitreden ohne Chat-Chaos:</strong> Kleine Meinungsbilder werden zentral gestellt, beantwortet und nachvollziehbar zusammengefasst – bewusst noch ohne rechtliche Bindungswirkung.</div></div>
          <div class="vote-stats">
            <article class="vote-stat"><span class="vote-stat-icon">${iconSvg('vote')}</span><div class="vote-stat-copy"><strong id="voteMetricTotal">0</strong><span>Abstimmungen</span></div></article>
            <article class="vote-stat"><span class="vote-stat-icon">${iconSvg('open')}</span><div class="vote-stat-copy"><strong id="voteMetricOpen">0</strong><span>Noch offen für mich</span></div></article>
            <article class="vote-stat"><span class="vote-stat-icon">${iconSvg('people')}</span><div class="vote-stat-copy"><strong id="voteMetricDone">0</strong><span>Von mir beantwortet</span></div></article>
          </div>
          <div class="vote-highlight">
            <article class="vote-how-card">
              <span class="vote-how-badge">${iconSvg('vote')} Einfach mitreden</span>
              <h2>Eine Frage. Ein klares Stimmungsbild.</h2>
              <p>Für praktische Fragen im Dorf reicht oft eine schnelle Rückmeldung. Statt Antworten über WhatsApp, E-Mail und Zuruf zu verteilen, bleibt das Meinungsbild an einem Ort.</p>
              <div class="vote-steps">
                <div class="vote-step"><strong>Frage einstellen</strong><span>Kurz und eindeutig formulieren, worüber gesprochen werden soll.</span></div>
                <div class="vote-step"><strong>Stimme abgeben</strong><span>Eigentümer wählen eine Option; die eigene Auswahl bleibt sichtbar.</span></div>
                <div class="vote-step"><strong>Ergebnis sehen</strong><span>Zwischenstand und Stimmen werden direkt in der Karte angezeigt.</span></div>
              </div>
            </article>
            <aside class="vote-rule-card">
              <span class="vote-rule-icon">${iconSvg('info')}</span>
              <span class="section-label">Bewusst getrennt</span>
              <h3>Stimmungsbild ≠ Beschluss</h3>
              <p>Dieser MVP-Bereich ist absichtlich nur für unverbindliche Meinungsbilder gedacht. Rechtlich verbindliche Beschlüsse bekommen später einen eigenen, sauber abgesicherten Prozess.</p>
              <button class="button button-primary" type="button" data-dynamic-action="open-vote">+ Abstimmung starten</button>
            </aside>
          </div>
          <div class="vote-library" id="voteLibrary">
            <div class="vote-toolbar">
              <div class="vote-list-head"><strong id="voteListTitle">Alle Abstimmungen</strong><span id="voteResultCount">0 Einträge</span></div>
              <div class="vote-filter-chips">
                <button class="vote-chip is-active" type="button" data-vote-filter="all">Alle</button>
                <button class="vote-chip" type="button" data-vote-filter="open">Noch offen</button>
                <button class="vote-chip" type="button" data-vote-filter="done">Beantwortet</button>
              </div>
              <button class="vote-reset" type="button" id="voteResetFilter">Filter zurücksetzen</button>
            </div>
            <div class="vote-rich-list" id="voteRichList"></div>
          </div>
        </div>`;
    }
    return document.querySelector('#voteWorkspace');
  }

  function filteredVotes() {
    const items = [...state.votes].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    return items.filter(item => {
      const done = Number.isInteger(item.selected);
      return activeVoteFilter === 'all' || (activeVoteFilter === 'done' ? done : !done);
    });
  }

  function renderVoteStats() {
    const total = state.votes.length;
    const done = state.votes.filter(item => Number.isInteger(item.selected)).length;
    const open = total - done;
    document.querySelector('#voteMetricTotal').textContent = total;
    document.querySelector('#voteMetricOpen').textContent = open;
    document.querySelector('#voteMetricDone').textContent = done;
  }

  function renderVoteList() {
    const root = document.querySelector('#voteRichList');
    if (!root) return;
    const items = filteredVotes();
    const titles = { all: 'Alle Abstimmungen', open: 'Noch offen für mich', done: 'Von mir beantwortet' };
    document.querySelector('#voteListTitle').textContent = titles[activeVoteFilter] || titles.all;
    document.querySelector('#voteResultCount').textContent = `${items.length} ${items.length === 1 ? 'Eintrag' : 'Einträge'}`;
    document.querySelectorAll('[data-vote-filter]').forEach(button => button.classList.toggle('is-active', button.dataset.voteFilter === activeVoteFilter));

    if (!items.length) {
      const message = activeVoteFilter === 'open'
        ? ['Alles beantwortet', 'Aktuell gibt es keine Abstimmung, bei der deine Stimme noch fehlt.']
        : activeVoteFilter === 'done'
        ? ['Noch nichts beantwortet', 'Sobald du an einer Abstimmung teilnimmst, erscheint sie hier mit deiner Auswahl.']
        : ['Noch keine Abstimmung', 'Hier können einfache, unverbindliche Stimmungsbilder für die Eigentümergemeinschaft gestartet werden.'];
      root.innerHTML = `<div class="vote-empty"><span class="vote-empty-icon">${iconSvg('vote')}</span><strong>${message[0]}</strong><p>${message[1]}</p><div class="vote-empty-actions"><button class="button button-primary" type="button" data-dynamic-action="open-vote">+ Abstimmung starten</button></div></div>`;
      return;
    }

    root.innerHTML = items.map(item => {
      const total = item.options.reduce((sum, option) => sum + Number(option.count || 0), 0);
      const done = Number.isInteger(item.selected);
      return `<article class="vote-rich-card">
        <div class="vote-rich-head"><div><h3>${escapeHtml(item.question)}</h3><div class="vote-rich-meta"><span class="vote-mini-tag">Unverbindlich</span><span class="vote-mini-tag">erstellt ${escapeHtml(fmtDateTime(item.created_at))}</span></div></div><span class="vote-status ${done ? 'done' : ''}">${done ? 'Beantwortet ✓' : 'Noch offen'}</span></div>
        <div class="vote-choices">${item.options.map((option, index) => {
          const count = Number(option.count || 0);
          const pct = total ? Math.round((count / total) * 100) : 0;
          return `<button class="vote-choice ${item.selected === index ? 'is-selected' : ''}" type="button" data-rich-vote-id="${escapeHtml(item.id)}" data-rich-vote-option="${index}"><span class="vote-choice-fill" style="width:${pct}%"></span><span class="vote-choice-content"><strong>${escapeHtml(option.label)}${item.selected === index ? ' ✓' : ''}</strong><span class="vote-choice-result">${count} · ${pct}%</span></span></button>`;
        }).join('')}</div>
        <div class="vote-summary"><span><strong>${total}</strong> ${total === 1 ? 'Stimme' : 'Stimmen'} im aktuellen MVP-Datensatz</span><span class="vote-local-note">Deine Auswahl wird nur in diesem Browser gespeichert.</span></div>
      </article>`;
    }).join('');

    document.querySelectorAll('[data-rich-vote-id]').forEach(button => button.addEventListener('click', () => {
      const item = state.votes.find(vote => vote.id === button.dataset.richVoteId);
      if (!item) return;
      const next = Number(button.dataset.richVoteOption);
      if (Number.isInteger(item.selected)) item.options[item.selected].count = Math.max(0, Number(item.options[item.selected].count || 0) - 1);
      if (item.selected === next) {
        item.selected = null;
        showToast('Stimme zurückgenommen');
      } else {
        item.options[next].count = Number(item.options[next].count || 0) + 1;
        item.selected = next;
        showToast('Stimme gespeichert');
      }
      persist();
      renderAll();
    }));
  }

  function bindWorkspace() {
    document.querySelectorAll('[data-vote-filter]').forEach(button => {
      if (button.dataset.bound === 'true') return;
      button.dataset.bound = 'true';
      button.addEventListener('click', () => { activeVoteFilter = button.dataset.voteFilter || 'all'; renderVoteList(); });
    });
    const reset = document.querySelector('#voteResetFilter');
    if (reset && reset.dataset.bound !== 'true') {
      reset.dataset.bound = 'true';
      reset.addEventListener('click', () => { activeVoteFilter = 'all'; renderVoteList(); });
    }
  }

  document.addEventListener('click', event => {
    const voteAction = event.target.closest('#voteWorkspace [data-dynamic-action="open-vote"]');
    if (voteAction) openSheet('vote');
  });

  const originalRenderVotes = renderVotes;
  renderVotes = function renderVotesWorkspace() {
    originalRenderVotes();
    ensureWorkspace();
    renderVoteStats();
    renderVoteList();
    bindWorkspace();
  };

  injectVoteStyles();
})();
