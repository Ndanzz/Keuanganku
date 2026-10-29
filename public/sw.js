const CACHE_NAME = 'keuanganku-v1';

// Daftar aset statis yang boleh di-cache (ikon, gambar, dll)
const STATIC_ASSETS = [
  '/manifest.json',
  // Tambahkan path ikon statis jika diperlukan, misal: '/icon-192.png'
];

// Saat Service Worker dipasang
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Saat Service Worker diaktifkan
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Strategi Fetch: Network-First untuk HTML/Navigasi, Cache-First untuk lainnya
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Jika permintaan untuk navigasi halaman (HTML), gunakan strategi Network-First
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Untuk aset selain HTML (gambar, css, dll), gunakan Cache-First / Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request);
    })
  );
});