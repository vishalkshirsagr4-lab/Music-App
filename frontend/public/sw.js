const CACHE_NAME = 'music-app-v4'; // Updated cache version
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon.svg',
  '/icons.svg',
  '/icon-source.svg'
];

// Install
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => 
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch - Fixed Response cloning issue
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }
  
  // Skip cross-origin requests
  if (new URL(request.url).origin !== self.location.origin) {
    event.respondWith(fetch(request));
    return;
  }

  // API requests - Network first, safe caching
  if (request.url.includes('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Document requests - SPA fallback
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(handleDocumentRequest(request));
    return;
  }

  // Static assets - Cache first
  event.respondWith(handleStaticRequest(request));
});

// API handler - Fixed cloning bug
async function handleApiRequest(request) {
  try {
    const response = await fetch(request);
    
    // Only cache successful API responses
    if (response.ok && response.status !== 404) {
      const cache = await caches.open(CACHE_NAME);
      const clonedResponse = response.clone();
      await cache.put(request, clonedResponse);
    }
    
    return response;
  } catch (error) {
    console.log('SW: API offline, serving cache:', request.url);
    return caches.match(request) || new Response('Offline', { status: 503 });
  }
}

// Document handler
async function handleDocumentRequest(request) {
  try {
    const response = await fetch(request);
    return response || caches.match('/index.html');
  } catch {
    return caches.match('/index.html') || caches.match('/offline.html');
  }
}

// Static handler
async function handleStaticRequest(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match('/offline.html');
  }
}

