/* T1 Carousel Builder service worker — offline app shell + runtime font cache. */
const VERSION = 'v1';
const SHELL = 't1-shell-' + VERSION;
const RUNTIME = 't1-runtime-' + VERSION;
const ASSETS = [
  './', 'index.html', 'styles.css', 'app.js', 'schematics.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== SHELL && k !== RUNTIME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // App shell + same-origin: cache-first, fall back to network and cache it.
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(SHELL).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('index.html')))
    );
    return;
  }
  // Google Fonts (and other cross-origin): stale-while-revalidate in the runtime cache.
  e.respondWith(
    caches.open(RUNTIME).then(cache => cache.match(req).then(hit => {
      const net = fetch(req).then(res => { cache.put(req, res.clone()).catch(() => {}); return res; }).catch(() => hit);
      return hit || net;
    }))
  );
});
