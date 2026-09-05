// ── TradeLog Service Worker ────────────────────────────────────────────────────
// Strategy: Cache-First for assets, Network-First for navigation.
// CACHE_NAME includes a build timestamp — Vite replaces __SW_VERSION__ at build,
// falling back to a date string for dev mode.

const CACHE_NAME  = "tradelog-v2";   // bump this on each deploy to bust old caches
const OFFLINE_PAGE = "/offline.html";

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/offline.html",
];

// ── INSTALL ───────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ── ACTIVATE ──────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)   // delete ALL old caches
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// ── FETCH ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET")            return;
  if (url.hostname === "api.anthropic.com") return; // never cache API calls
  if (url.protocol === "chrome-extension:") return;
  if (url.hostname.includes("fonts.g"))    return; // let Google Fonts handle caching

  // Navigation (HTML pages) — Network First, fallback to cache / offline page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request)
            .then((cached) => cached || caches.match("/index.html") || caches.match(OFFLINE_PAGE))
        )
    );
    return;
  }

  // Static assets — Cache First, network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === "error") return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      }).catch(() => new Response("", { status: 408 }));
    })
  );
});

// ── BACKGROUND SYNC (future) ──────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-trades") {
    console.log("[SW] Background sync triggered");
  }
});

// ── PUSH NOTIFICATIONS (future) ───────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || "TradeLog", {
    body:  data.body  || "",
    icon:  "/icons/icon-192.png",
    badge: "/icons/icon-96.png",
  });
});
