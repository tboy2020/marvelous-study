var CACHE = 'studylab-v7';
var ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ if(k !== CACHE) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  var url = e.request.url;
  // Never intercept live services or model downloads.
  if(url.indexOf('api.anthropic.com') >= 0 || url.indexOf('api.groq.com') >= 0 ||
     url.indexOf('unsplash.com') >= 0 || url.indexOf('pexels.com') >= 0 ||
     url.indexOf('cdn.jsdelivr.net') >= 0 || url.indexOf('huggingface.co') >= 0 ||
     url.indexOf('fonts.g') >= 0 || url.indexOf('youtube.com') >= 0 ||
     url.indexOf('youtu.be') >= 0 || url.indexOf('ytimg.com') >= 0) return;

  var isHTML = e.request.mode === 'navigate' || url.slice(-1) === '/' || url.indexOf('index.html') >= 0 || url.slice(-5) === '.html';
  if(isHTML){
    // network-first so the newest app always loads; fall back to cache offline
    e.respondWith(
      fetch(e.request).then(function(resp){
        var copy = resp.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        return resp;
      }).catch(function(){ return caches.match(e.request).then(function(m){ return m || caches.match('./index.html'); }); })
    );
    return;
  }
  // other assets: cache-first with network fallback
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).catch(function(){ return caches.match('./index.html'); });
    })
  );
});
