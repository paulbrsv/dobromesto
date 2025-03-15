const CACHE_NAME = 'lepotamo-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/terms.html',
  '/favicon.ico',
  '/places.json',
  '/assets/libs/leaflet.js',
  '/assets/libs/leaflet.css',
  '/assets/libs/leaflet.markercluster.js',
  '/assets/libs/MarkerCluster.css',
  '/assets/libs/MarkerCluster.Default.css',
  '/assets/libs/images/layers.png',
  '/assets/libs/images/layers-2x.png',
  '/assets/libs/images/marker-icon.png',
  // Изображения из places.json
  '/images/biciklana.jpg',
  '/images/lebol.jpg',
  '/images/sweetgreen.jpg',
  '/images/vegevegan.jpg',
  '/images/organicfactory.jpg',
  '/images/ananda.jpg',
  '/images/bulevar.jpg',
  '/images/gabby.jpg',
  '/images/crniovan.jpg',
  '/images/freshfood.jpg',
  '/images/secernema.jpg',
  '/images/izlet.png',
  '/images/toster.jpg',
  '/images/freeshka.jpg',
  '/images/block32.jpg',
  '/images/fax.jpg',
  '/images/zenit.webp',
  '/images/cofferide.jpg',
  '/images/urbano.jpg',
  '/images/pendzer.png',
  '/images/kafetea.png',
  '/images/bruno.png',
  '/images/teplica.jpg',
  '/images/martin1.jpg',
  '/images/kofilin.png',
  '/images/coffeebara.png',
  '/images/tischler.png',
  '/images/mlin.jpg',
  '/images/carolia.png',
  '/images/seherezada.png',
  '/images/rozbrat.jpg',
  '/images/fika.png',
  '/images/green1.png',
  '/images/leklok.jpg',
  '/images/raf.png',
  '/images/petrus.png',
  '/images/tiho.png',
  '/images/drago.png',
  '/images/maybe.png',
  '/images/kafeteria.jpeg',
  '/images/alby.png',
  '/images/soc.png',
  '/images/radionica.png',
  '/images/ladorce.png',
  '/images/mandarin.png',
  '/images/nomad.png',
  '/images/hedonist.png',
  '/images/sealtea.png',
  '/images/green2.png',
  // Иконки
  '/images/reset.svg',
  '/images/close.svg',
  '/images/list.svg',
  '/images/instagram.svg',
  '/images/google.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return Promise.all(
          urlsToCache.map((url) => {
            return fetch(url)
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`Request failed for ${url}: ${response.status}`);
                }
                return cache.put(url, response);
              })
              .catch((error) => {
                console.error(`Failed to cache ${url}:`, error);
              });
          })
        );
      })
      .catch((error) => {
        console.error('Cache open failed:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/index.html');
        });
    })
  );
});
