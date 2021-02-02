const CACHE_NAME = "assets-v1";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const VERSION = "2";
const URLS_TO_CACHE = [
  "assets/images/ocs-logo.png",
  "assets/Icon-Red_Hat-Hardware-Storage-A-Red-RGB.png",
];

self.addEventListener("install", (ev) => {
  (ev as ExtendableEvent).waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener("fetch", (ev) => {
  (ev as FetchEvent).respondWith(
    caches
      .match((ev as FetchEvent).request)
      .then((res) => (res ? res : fetch((ev as FetchEvent).request)))
  );
});

self.addEventListener("message", (ev: MessageEvent) => {
  if (ev.data?.action === "skipWaiting") {
    self.skipWaiting();
  }
});
