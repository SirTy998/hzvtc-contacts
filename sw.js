/* 通讯录 PWA Service Worker —— 离线缓存 app shell */
const CACHE = "hzvtc-contacts-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./seed-data.js",
  "./xlsx.full.min.js",
  "./manifest.webmanifest"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 不缓存跨域（如地图等）

  // 页面导航：网络优先，失败回退缓存（保证联网时拿到最新页，断网仍可用）
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const cp = res.clone();
          caches.open(CACHE).then((c) => c.put("./index.html", cp));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // 静态资源：网络优先 + 缓存回退（保证每次都拿到服务器最新文件，断网仍可离线使用）
  e.respondWith(
    fetch(req)
      .then((res) => {
        const cp = res.clone();
        caches.open(CACHE).then((c) => c.put(req, cp));
        return res;
      })
      .catch(() => caches.match(req).then((c) => c || caches.match("./index.html")))
  );
});
