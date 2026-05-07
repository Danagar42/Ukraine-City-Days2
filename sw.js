const CACHE_NAME = 'city-calendar-v2';
const ASSETS = [
  './Міста.html',
  './cities.json',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Для cities.json завжди використовуємо Network First
  if (e.request.url.includes('cities.json')) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Для решти ресурсів - Cache First
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
