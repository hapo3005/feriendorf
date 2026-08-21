const CACHE = 'feriendorf-intern-v14';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './v02.css',
  './waldhaus-palette.css',
  './banner-v9.css',
  './app.js',
  './issue-media-demo.js',
  './issue-media-core.js',
  './documents.js',
  './calendar-workspace.js',
  './votes-workspace.js',
  './community-workspace.js',
  './manifest.webmanifest',
  './icon.svg',
  './assets/banner-v10-01.svg',
  './assets/banner-v10-02.svg',
  './assets/banner-v10-03.svg',
  './assets/banner-v10-04.svg',
  './assets/banner-v10-05.svg',
  './assets/banner-v10-06.svg',
  './assets/banner-v10-07.svg',
  './assets/banner-v10-08.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(match => match || caches.match('./index.html')))
  );
});