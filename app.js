const STORAGE_KEY = 'feriendorf.intern.v1';
const COMMUNITY_ID = 'de-rp-kerschenbach-feriendorf';

const todayIso = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const defaultState = () => ({
  meta: {
    schema_version: 1,
    community_id: COMMUNITY_ID,
    house_id: null,
    created_at: new Date().toISOString()
  },
  news: [
    {
      id: 'system-welcome',
      community_id: COMMUNITY_ID,
      type: 'system',
      title: 'Feriendorf Intern ist eingerichtet',
      text: 'Ab jetzt können gemeinschaftliche Themen hier zentral gesammelt werden. Offizielle Dorfmeldungen werden erst angezeigt, wenn sie tatsächlich eingetragen wurden.',
      created_at: new Date().toISOString()
    }
  ],
  issues: [],
  events: [],
  votes: [],
  board: []
});

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!parsed || parsed.meta?.schema_version !== 1) return defaultState();
    return {
      ...defaultState(),
      ...parsed,
      meta: { ...defaultState().meta, ...(parsed.meta || {}) },
      news: Array.isArray(parsed.news) ? parsed.news : [],
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
      votes: Array.isArray(parsed.votes) ? parsed.votes : [],
      board: Array.isArray(parsed.board) ? parsed.board : []
    };
  } catch {
    return defaultState();
  }
}

let state = loadState();
let currentView = 'home';
let deferredInstallPrompt = null;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const uid = prefix => `${prefix}-${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
const escapeHtml = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function entityBase(id) {
  return {
    id,
    community_id: state.meta.community_id,
    house_id: state.meta.house_id,
    created_at: new Date().toISOString()
  };
}

function fmtDate(value, withWeekday = true) {
  if (!value) return 'Termin offen';
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat('de-DE', {
    weekday: withWeekday ? 'short' : undefined,
    day: '2-digit',
    month: '2-digit',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  }).format(date);
}

function fmtDateTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  }).format(new Date(value));
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

function navigate(view) {
  currentView = view;
  $$('.view').forEach(section => section.classList.toggle('is-active', section.dataset.view === view));
  $$('.side-nav-item,.mobile-nav-item').forEach(button => {
    if (!button.dataset.viewTarget) return;
    button.classList.toggle('is-active', button.dataset.viewTarget === view);
  });
  $('#moreButton')?.classList.toggle('is-active', ['community', 'documents'].includes(view));
  closeMoreMenu();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function emptyState(icon, title, text, action = '') {
  return `<div class="empty-state"><span>${icon}</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p>${action}</div>`;
}

function renderNews() {
  const list = $('#newsList');
  if (!list) return;
  const items = [...state.news].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 5);
  list.innerHTML = items.length
    ? items.map(item => `<article class="news-item"><span class="news-dot"></span><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.text)}</p><time>${escapeHtml(fmtDateTime(item.created_at))}</time></div></article>`).join('')
    : emptyState('i', 'Noch keine Meldungen', 'Offizielle Hinweise erscheinen hier, sobald sie eingetragen wurden.');
}

const issueStatuses = ['Gemeldet', 'In Prüfung', 'Beauftragt', 'Erledigt'];
function renderIssues() {
  const list = $('#issueList');
  if (!list) return;
  const items = [...state.issues].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  if (!items.length) {
    list.innerHTML = emptyState('!', 'Keine offenen Meldungen', 'Wenn etwas an gemeinschaftlichen Flächen oder Anlagen auffällt, kann es hier einmal zentral gemeldet werden.');
    return;
  }
  list.innerHTML = items.map(item => {
    const statusClass = item.status === 'Erledigt' ? '' : item.status === 'Beauftragt' ? 'warning' : 'danger';
    return `<article class="list-card">
      <div class="list-card-head"><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.details || 'Keine weiteren Angaben.')}</p></div><button class="status-button" type="button" data-cycle-issue="${escapeHtml(item.id)}">Status ändern</button></div>
      <div class="list-card-meta"><span class="tag ${statusClass}">${escapeHtml(item.status)}</span>${item.location ? `<span class="tag">${escapeHtml(item.location)}</span>` : ''}<span class="tag">gemeldet ${escapeHtml(fmtDateTime(item.created_at))}</span></div>
    </article>`;
  }).join('');
  $$('[data-cycle-issue]').forEach(button => button.addEventListener('click', () => {
    const item = state.issues.find(issue => issue.id === button.dataset.cycleIssue);
    if (!item) return;
    const next = (issueStatuses.indexOf(item.status) + 1) % issueStatuses.length;
    item.status = issueStatuses[next];
    persist();
    renderAll();
    showToast(`Status: ${item.status}`);
  }));
}

function renderEvents() {
  const list = $('#eventList');
  if (!list) return;
  const items = [...state.events].sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.created_at).localeCompare(String(b.created_at)));
  if (!items.length) {
    list.innerHTML = emptyState('◷', 'Noch keine Termine', 'Gemeinschaftstermine und Dienstleisterbesuche können hier zentral angekündigt werden.');
    return;
  }
  list.innerHTML = items.map(item => `<article class="list-card">
    <div class="list-card-head"><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.details || (item.kind === 'service' ? 'Dienstleisterbesuch im Feriendorf.' : 'Gemeinsamer Termin im Feriendorf.'))}</p></div><span class="tag ${item.kind === 'service' ? 'warning' : ''}">${escapeHtml(fmtDate(item.date))}</span></div>
    <div class="list-card-meta"><span class="tag">${item.kind === 'service' ? 'Dienstleister' : 'Gemeinschaft'}</span>${item.provider ? `<span class="tag">${escapeHtml(item.provider)}</span>` : ''}</div>
    ${item.kind === 'service' ? `<div class="service-join"><small><strong>${Number(item.interest_count || 0)}</strong> weitere Bedarfe angemeldet</small><button class="button ${item.joined ? 'button-soft' : 'button-primary'}" type="button" data-join-event="${escapeHtml(item.id)}">${item.joined ? 'Bedarf angemeldet ✓' : 'Bedarf anmelden'}</button></div>` : ''}
  </article>`).join('');
  $$('[data-join-event]').forEach(button => button.addEventListener('click', () => {
    const item = state.events.find(event => event.id === button.dataset.joinEvent);
    if (!item) return;
    item.joined = !item.joined;
    item.interest_count = Math.max(0, Number(item.interest_count || 0) + (item.joined ? 1 : -1));
    persist();
    renderAll();
    showToast(item.joined ? 'Bedarf angemeldet' : 'Anmeldung entfernt');
  }));
}

function renderVotes() {
  const list = $('#voteList');
  if (!list) return;
  const items = [...state.votes].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  if (!items.length) {
    list.innerHTML = emptyState('✓', 'Noch keine Abstimmung', 'Hier können einfache, unverbindliche Stimmungsbilder für die Eigentümergemeinschaft gestartet werden.');
    return;
  }
  list.innerHTML = items.map(item => {
    const total = item.options.reduce((sum, option) => sum + Number(option.count || 0), 0);
    return `<article class="list-card"><h3>${escapeHtml(item.question)}</h3><p>Unverbindliches Stimmungsbild · erstellt ${escapeHtml(fmtDateTime(item.created_at))}</p>
      <div class="vote-options">${item.options.map((option, index) => `<button type="button" class="vote-option ${item.selected === index ? 'is-selected' : ''}" data-vote-id="${escapeHtml(item.id)}" data-vote-option="${index}">${escapeHtml(option.label)} · ${Number(option.count || 0)}</button>`).join('')}</div>
      <div class="vote-result">${total} ${total === 1 ? 'Stimme' : 'Stimmen'} in diesem MVP-Browser gespeichert.</div>
    </article>`;
  }).join('');
  $$('[data-vote-id]').forEach(button => button.addEventListener('click', () => {
    const item = state.votes.find(vote => vote.id === button.dataset.voteId);
    if (!item) return;
    const next = Number(button.dataset.voteOption);
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

function renderBoard() {
  const list = $('#boardList');
  if (!list) return;
  const items = [...state.board].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  if (!items.length) {
    list.innerHTML = emptyState('♡', 'Noch keine Beiträge', 'Hilfe suchen, etwas verleihen, Tipps teilen oder eine gemeinsame Besorgung anstoßen.');
    return;
  }
  list.innerHTML = items.map(item => `<article class="list-card"><div class="list-card-head"><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></div><span class="tag">${escapeHtml(item.kind)}</span></div><div class="list-card-meta"><span class="tag">${escapeHtml(fmtDateTime(item.created_at))}</span></div></article>`).join('');
}

function renderMetrics() {
  const openIssues = state.issues.filter(item => item.status !== 'Erledigt').length;
  const upcomingEvents = state.events.filter(item => !item.date || item.date >= todayIso()).length;
  const openVotes = state.votes.length;
  $('#metricIssues').textContent = openIssues;
  $('#metricEvents').textContent = upcomingEvents;
  $('#metricVotes').textContent = openVotes;
}

function renderAll() {
  renderMetrics();
  renderNews();
  renderIssues();
  renderEvents();
  renderVotes();
  renderBoard();
}

function openSheet(type) {
  const sheet = $('#formSheet');
  const backdrop = $('#sheetBackdrop');
  const label = $('#sheetLabel');
  const title = $('#sheetTitle');
  const body = $('#sheetBody');

  const templates = {
    issue: {
      label: 'Schaden melden', title: 'Was ist aufgefallen?',
      html: `<form class="form-stack" id="issueForm"><label>Titel<input name="title" required maxlength="80" placeholder="z. B. Straßenlampe ausgefallen"></label><label>Ort / Bereich<input name="location" maxlength="80" placeholder="z. B. Zufahrt / Haus 12"></label><label>Beschreibung<textarea name="details" maxlength="500" placeholder="Kurz beschreiben, was du gesehen hast."></textarea></label><p class="form-note">Fotos und zentrale Synchronisierung kommen mit dem Backend. Der Eintrag wird im MVP lokal gespeichert.</p><button class="button button-primary" type="submit">Problem speichern</button></form>`
    },
    event: {
      label: 'Termin teilen', title: 'Was findet statt?',
      html: `<form class="form-stack" id="eventForm"><label>Art<select name="kind"><option value="service">Dienstleister im Dorf</option><option value="community">Gemeinschaftstermin</option></select></label><label>Titel<input name="title" required maxlength="80" placeholder="z. B. Elektriker vor Ort"></label><div class="form-row"><label>Datum<input name="date" type="date" required min="${todayIso()}"></label><label>Dienstleister / Kontakt<input name="provider" maxlength="80" placeholder="optional"></label></div><label>Details<textarea name="details" maxlength="500" placeholder="Was sollten die anderen wissen?"></textarea></label><button class="button button-primary" type="submit">Termin speichern</button></form>`
    },
    vote: {
      label: 'Mitreden', title: 'Meinung einholen',
      html: `<form class="form-stack" id="voteForm"><label>Frage<input name="question" required maxlength="140" placeholder="z. B. Sollen wir einen gemeinsamen Arbeitseinsatz planen?"></label><div class="form-row"><label>Option 1<input name="option1" required maxlength="50" value="Ja"></label><label>Option 2<input name="option2" required maxlength="50" value="Nein"></label></div><p class="form-note">Dieser Bereich ist aktuell nur für unverbindliche Meinungsbilder gedacht – nicht für rechtlich verbindliche Beschlüsse.</p><button class="button button-primary" type="submit">Abstimmung starten</button></form>`
    },
    board: {
      label: 'Gemeinschaft', title: 'Beitrag erstellen',
      html: `<form class="form-stack" id="boardForm"><label>Art<select name="kind"><option>Hilfe gesucht</option><option>Zu verleihen</option><option>Tipp</option><option>Gemeinsam bestellen</option></select></label><label>Titel<input name="title" required maxlength="80" placeholder="z. B. Leiter für Samstag gesucht"></label><label>Nachricht<textarea name="text" required maxlength="500" placeholder="Worum geht es?"></textarea></label><button class="button button-primary" type="submit">Beitrag veröffentlichen</button></form>`
    }
  };
  const template = templates[type];
  if (!template) return;
  label.textContent = template.label;
  title.textContent = template.title;
  body.innerHTML = template.html;
  sheet.classList.add('is-open');
  sheet.setAttribute('aria-hidden', 'false');
  backdrop.hidden = false;
  document.body.style.overflow = 'hidden';

  if (type === 'issue') $('#issueForm').addEventListener('submit', submitIssue);
  if (type === 'event') $('#eventForm').addEventListener('submit', submitEvent);
  if (type === 'vote') $('#voteForm').addEventListener('submit', submitVote);
  if (type === 'board') $('#boardForm').addEventListener('submit', submitBoard);
  body.querySelector('input,select,textarea')?.focus();
}

function closeSheet() {
  const sheet = $('#formSheet');
  sheet.classList.remove('is-open');
  sheet.setAttribute('aria-hidden', 'true');
  $('#sheetBackdrop').hidden = true;
  document.body.style.overflow = '';
}

function submitIssue(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  state.issues.unshift({
    ...entityBase(uid('issue')),
    title: String(data.get('title') || '').trim(),
    location: String(data.get('location') || '').trim(),
    details: String(data.get('details') || '').trim(),
    status: 'Gemeldet'
  });
  persist(); renderAll(); closeSheet(); navigate('issues'); showToast('Problem gespeichert');
}

function submitEvent(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  state.events.push({
    ...entityBase(uid('event')),
    kind: String(data.get('kind') || 'service'),
    title: String(data.get('title') || '').trim(),
    date: String(data.get('date') || ''),
    provider: String(data.get('provider') || '').trim(),
    details: String(data.get('details') || '').trim(),
    interest_count: 0,
    joined: false
  });
  persist(); renderAll(); closeSheet(); navigate('calendar'); showToast('Termin gespeichert');
}

function submitVote(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  state.votes.unshift({
    ...entityBase(uid('vote')),
    question: String(data.get('question') || '').trim(),
    options: [
      { label: String(data.get('option1') || '').trim(), count: 0 },
      { label: String(data.get('option2') || '').trim(), count: 0 }
    ],
    selected: null,
    binding: false
  });
  persist(); renderAll(); closeSheet(); navigate('votes'); showToast('Abstimmung gestartet');
}

function submitBoard(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  state.board.unshift({
    ...entityBase(uid('board')),
    kind: String(data.get('kind') || 'Hilfe gesucht'),
    title: String(data.get('title') || '').trim(),
    text: String(data.get('text') || '').trim()
  });
  persist(); renderAll(); closeSheet(); navigate('community'); showToast('Beitrag veröffentlicht');
}

function openMoreMenu() {
  const menu = $('#moreMenu');
  const open = !menu.classList.contains('is-open');
  menu.classList.toggle('is-open', open);
  menu.setAttribute('aria-hidden', String(!open));
}
function closeMoreMenu() {
  const menu = $('#moreMenu');
  menu?.classList.remove('is-open');
  menu?.setAttribute('aria-hidden', 'true');
}

function bindNavigation() {
  $$('[data-view-target]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.viewTarget)));
  $('#moreButton').addEventListener('click', event => { event.stopPropagation(); openMoreMenu(); });
  document.addEventListener('click', event => {
    if (!$('#moreMenu')?.contains(event.target) && event.target !== $('#moreButton')) closeMoreMenu();
  });
}

function bindActions() {
  $$('[data-action="open-issue"]').forEach(button => button.addEventListener('click', () => openSheet('issue')));
  $$('[data-action="open-event"]').forEach(button => button.addEventListener('click', () => openSheet('event')));
  $$('[data-action="open-vote"]').forEach(button => button.addEventListener('click', () => openSheet('vote')));
  $$('[data-action="open-board"]').forEach(button => button.addEventListener('click', () => openSheet('board')));
  $('#sheetClose').addEventListener('click', closeSheet);
  $('#sheetBackdrop').addEventListener('click', closeSheet);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeSheet(); closeMoreMenu(); } });
}

function bindInstall() {
  const button = $('#installButton');
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    button.hidden = false;
  });
  button.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    button.hidden = true;
  });
  window.addEventListener('appinstalled', () => { button.hidden = true; showToast('App installiert'); });
}

function initServiceWorker() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
}

function init() {
  persist();
  bindNavigation();
  bindActions();
  bindInstall();
  renderAll();
  initServiceWorker();
}

document.addEventListener('DOMContentLoaded', init);
