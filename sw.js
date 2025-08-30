const CACHE_NAME = 'pozos-cache';
const FILES_TO_CACHE = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalar SW y cache inicial
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Activar SW
self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

// Fetch: cache-first, pero actualizar si hay internet y versión nueva
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      return fetch(e.request).then(networkResponse => {
        // Solo cachear si la respuesta es válida y diferente a la cacheada
        if(networkResponse && networkResponse.status === 200){
          caches.open(CACHE_NAME).then(cache => {
            cache.match(e.request).then(existing => {
              if(!existing || networkResponse.clone().url !== existing.url){
                cache.put(e.request, networkResponse.clone());
              }
            });
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse); // Si no hay internet, sirve cache
    })
  );
});