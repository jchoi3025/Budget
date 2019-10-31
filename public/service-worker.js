const FILES_TO_CACHE = ['index.html', 'db.js', 'index.js'];

const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';


self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Your files were pre-cached successfully!');
      return cache.addAll(FILES_TO_CACHE);
    }),
  );

  self.skipWaiting();
});


self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) => Promise.all(
      keyList.map((key) => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('Removing old cache data', key);
          return caches.delete(key);
        }
      }),
    )),
  );

  self.clients.claim();
});


self.addEventListener('fetch', (evt) => {
  if (evt.request.url.includes('/api/')) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => fetch(evt.request)
        .then((response) => {
         
          if (response.status === 200) {
            cache.put(evt.request.url, response.clone());
          }

          return response;
        })
        .catch((err) =>
   
          cache.match(evt.request))),
    );

    return;
  }

  if (evt.request.cache === 'only-if-cached' && evt.request.mode !== 'same-origin') {
    return;
  }

  evt.respondWith(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.match(evt.request).then((response) => response || fetch(evt.request))),
  );
});