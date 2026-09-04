/* Service worker for the CS146S guide. Generated into public/sw.js by scripts/build-sw.mjs. */
const VERSION = "__VERSION__";
const PAGE_CACHE = `cs146s-pages-${VERSION}`;
const ASSET_CACHE = `cs146s-assets-${VERSION}`;
const RSC_CACHE = `cs146s-rsc-${VERSION}`;
const KEEP = new Set([PAGE_CACHE, ASSET_CACHE, RSC_CACHE]);

const PRECACHE_PAGES = [
  "/",
  "/weeks",
  "/week/1",
  "/week/2",
  "/week/3",
  "/week/4",
  "/week/5",
  "/week/6",
  "/week/7",
  "/week/8",
  "/week/9",
  "/week/10",
  "/capstone",
  "/bookshelf",
  "/half-time",
  "/more",
  "/offline",
];
const PRECACHE_ASSETS = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const pages = await caches.open(PAGE_CACHE);
      const assets = await caches.open(ASSET_CACHE);
      // Add one by one so a single failure does not abort the whole install.
      await Promise.all(PRECACHE_PAGES.map((url) => pages.add(url).catch(() => undefined)));
      await Promise.all(PRECACHE_ASSETS.map((url) => assets.add(url).catch(() => undefined)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n.startsWith("cs146s-") && !KEEP.has(n)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

async function networkFirst(request, cacheName, matchOptions) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request, matchOptions);
    if (cached) return cached;
    throw new Error("offline");
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return cached || (await refresh) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(request, PAGE_CACHE, { ignoreSearch: true }).catch(async () => {
        const pages = await caches.open(PAGE_CACHE);
        return (await pages.match("/offline")) || Response.error();
      }),
    );
    return;
  }

  if (url.searchParams.has("_rsc")) {
    // React Server Component payloads for client-side navigation.
    event.respondWith(networkFirst(request, RSC_CACHE, { ignoreSearch: true }).catch(() => Response.error()));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
});
