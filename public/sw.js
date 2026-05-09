// public/sw.js
// Service Worker لتحسين الأداء والـ offline support
// =====================================================

const CACHE_NAME = "masarak-v1";
const RUNTIME_CACHE = "masarak-runtime-v1";

// الموارد الأساسية للـ cache
const PRECACHE_URLS = [
  "/",
  "/offline",
];

// Install: cache الموارد الأساسية
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // إذا فشل، تابع رغم ذلك
      });
    })
  );
  self.skipWaiting();
});

// Activate: حذف الـ caches القديمة
self.addEventListener("activate", (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => !currentCaches.includes(cacheName))
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: استراتيجية cache-first للـ assets، network-first للـ pages
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // فقط GET requests
  if (request.method !== "GET") return;

  // تجاهل API requests و auth
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;

  // تجاهل من نطاقات أخرى
  if (url.origin !== location.origin) return;

  // Static assets: cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff|woff2)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Pages: network-first مع fallback للـ cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // إذا offline ولا يوجد cache، ارجع صفحة offline
          return caches.match("/offline");
        });
      })
  );
});
