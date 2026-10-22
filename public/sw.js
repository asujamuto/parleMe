// Minimalny service worker: pozwala otworzyć aplikację bez sieci (spec 001, SC-006).
const CACHE_VERSION = 'v2';
const CACHE_NAME = `parleme-${CACHE_VERSION}`;
const PRECACHE_PAGES = ['/', '/import', '/flashcards'];

self.addEventListener('install', (event) => {
  event.waitUntil(precache().finally(() => self.skipWaiting()));
});

// Strony i ich zasoby z /_next/static trafiają do cache od razu, a nie dopiero przy drugiej wizycie.
async function precache() {
  const cache = await caches.open(CACHE_NAME);
  const assets = new Set();
  await Promise.all(
    PRECACHE_PAGES.map(async (page) => {
      try {
        const response = await fetch(page);
        if (!response.ok) return;
        await cache.put(page, response.clone());
        const html = await response.text();
        for (const match of html.matchAll(/\/_next\/static\/[^"'\s)\\]+/g)) assets.add(match[0]);
      } catch {
        // Brak sieci przy instalacji — strona trafi do cache przy pierwszej wizycie.
      }
    }),
  );
  await Promise.all([...assets].map((asset) => cache.add(asset).catch(() => {})));
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
  } else if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}
