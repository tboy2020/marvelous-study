var CACHE = 'studylab-v1';
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
  // Never intercept live services or model downloads — let them hit the network directly.
  if(url.indexOf('api.anthropic.com') >= 0 || url.indexOf('api.groq.com') >= 0 ||
     url.indexOf('unsplash.com') >= 0 || url.indexOf('cdn.jsdelivr.net') >= 0 ||
     url.indexOf('huggingface.co') >= 0 || url.indexOf('fonts.g') >= 0 ||
     url.indexOf('youtube.com') >= 0 || url.indexOf('youtu.be') >= 0 || url.indexOf('ytimg.com') >= 0) return;
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).catch(function(){ return caches.match('./index.html'); });
    })
  );
});
