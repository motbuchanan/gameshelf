const CACHE='stick-v0-5';
const CORE=['./','./index.html','./manifest.json','./icon.png','./count-one.wav','./count-two.wav','./count-three.wav','./count-four.wav','./count-and.wav'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{ if(e.request.method!=='GET')return; e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{ if(res.ok&&new URL(e.request.url).origin===location.origin){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); } return res; }))); });
