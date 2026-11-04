// જૂની લિંક બંધ: જૂનો ઑફલાઇન હબ ભૂંસી, નવી લિંક પર મોકલે.
self.addEventListener("install",function(){self.skipWaiting()});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(k){return Promise.all(k.map(function(n){return caches.delete(n)}))})
    .then(function(){return self.registration.unregister()})
    .then(function(){return self.clients.matchAll({type:"window"})})
    .then(function(cs){cs.forEach(function(c){try{c.navigate("https://kutch-satsang.github.io/box/")}catch(x){}})}));
});
self.addEventListener("fetch",function(e){
  if(e.request.mode==="navigate")e.respondWith(Response.redirect("https://kutch-satsang.github.io/box/",302));
});
