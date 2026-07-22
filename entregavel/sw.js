const CACHE = 'doce-liberdade-v5-bonus-destaque';
const APP_FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './recipes.js',
  './bonuses.js',
  './manifest.webmanifest',
  './assets/icon.svg',
  '../images/cat_sobremesas.jpg',
  '../images/cat_panificacao.jpg',
  '../images/2.jpg',
  '../images/3.jpg',
  '../images/7.jpg',
  '../images/5.jpg',
  '../images/6.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
