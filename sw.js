// Service Worker - Mapa Natal PWA
const CACHE_VERSION = 'mapanatal-v6';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/i18n/en.json',
    '/i18n/es.json',
    '/i18n/pt.json',
    '/styles/print.css',
    '/manifest.webmanifest',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/about/index.html'
];

// Install: pre-cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_VERSION)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch: cache-first for static assets, network-first for navigation
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Solo interceptar requests al propio origen. Cross-origin (Nominatim,
    // API, fonts, CDN) va directo a la red: cachearlos con ignoreSearch
    // servía resultados de una ciudad para búsquedas de otra.
    if (url.origin !== self.location.origin) return;

    // Don't intercept non-GET requests
    if (event.request.method !== 'GET') return;

    // Navigation requests: network-first, cache fallback
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request) || caches.match('/'))
        );
        return;
    }

    // Static assets: cache-first con match EXACTO (respeta ?v= para que
    // una nueva versión de app.js/styles.css no sea pisada por la vieja).
    // ignoreSearch solo como último recurso cuando no hay red (offline).
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => caches.match(event.request, { ignoreSearch: true }));
        })
    );
});
