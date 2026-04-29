const CACHE_NAME = 'music-app-v3'; // Bump for Vercel
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon.svg'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => 
      Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch - Enhanced SPA support
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  // API - Network First
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).then((resp) => {
        if (resp.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, resp.clone()));
        return resp;
      }).catch(() => caches.match(request) || Response.error())
    );
    return;
  }

  // SPA Routes - index.html fallback (FIX 404 REFRESH)
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static - Cache First
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((resp) => {
        if (resp.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, resp.clone()));
        return resp;
      });
    }).catch(() => caches.match('/offline.html'))
  );
});
