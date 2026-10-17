const C='satsang-box-v7';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','icon-192.png','icon-512.png','intro/intro.css','intro/intro.js','intro/s1.webp','intro/s2.webp','intro/s3.webp','intro/s4.webp','intro/s5.webp','intro/s6.webp','clay.css','icon-maskable.png','themes/clay/bg.webp','themes/embroidery/bg.webp'])).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))))});
