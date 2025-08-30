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

// Fetch: sirve primero de cache pero actualiza si hay internet
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      const fetchPromise = fetch(e.request).then(networkResponse => {
        // Sobrescribe en cache solo si hay respuesta válida
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse); // Si no hay internet, usa cache
      return cachedResponse || fetchPromise;
    })
  );
});