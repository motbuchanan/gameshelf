// Service worker for the rpg repo (flat, all files at the root). Network-first so updates land;
// precache so the game works offline after the first load.
const VERSION = '0.6.0';
const CACHE = 'rpg-v' + VERSION;
const FILES = [
  './',
  'index.html',
  'manifest.json',
  'game.css',
  'config.js',
  'rng.js',
  'rules.js',
  'dice.js',
  'ui.js',
  'glossary.js',
  'sprites.js',
  'art.js',
  'party.js',
  'save.js',
  'ch0.js',
  'creator.js',
  'icons.js',
  'grid.js',
  'items.js',
  'combat.js',
  'board.js',
  'story.js',
  'ch1.js',
  'book.js',
  'monsters.js',
  'ch2.js',
  'three.module.min.js',
  'cannon-es.js',
  'icon-192.png',
  'icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('rpg-v') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(c => c.postMessage({ type: 'version', version: VERSION }));
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(req, { cache: 'no-cache' });
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    } catch (err) {
      const hit = await caches.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === 'navigate') return caches.match('index.html');
      throw err;
    }
  })());
});
