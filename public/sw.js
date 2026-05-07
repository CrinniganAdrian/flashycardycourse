const CACHE_NAME = "flashycardycourse-v2";
const OFFLINE_URL = "/offline";
const APP_SHELL = ["/", OFFLINE_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const isNavigation = event.request.mode === "navigate";

  if (isNavigation) {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cachedOffline = await caches.match(OFFLINE_URL);
        return cachedOffline || Response.error();
      }),
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response.ok) return response;
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(
        () =>
          caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return Response.error();
          }),
      ),
  );
});
