const { offlineFallback, warmStrategyCache } = require("workbox-recipes");
const { CacheFirst, StaleWhileRevalidate } = require("workbox-strategies");
const { registerRoute, Route } = require("workbox-routing");
const { CacheableResponsePlugin } = require("workbox-cacheable-response");
const { ExpirationPlugin } = require("workbox-expiration");
const { precacheAndRoute } = require("workbox-precaching/precacheAndRoute");

try {
  precacheAndRoute(self.__WB_MANIFEST);
} catch (error) {
  console.error("Error precaching assets:", error);
}

const pageCache = new CacheFirst({
  cacheName: "page-cache",
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60,
    }),
  ],
});

const imageRoute = new Route(
  ({ request }) => {
    return request.destination === "image";
  },
  new StaleWhileRevalidate({
    cacheName: "images",
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 30,
        maxEntries: 60,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

warmStrategyCache({
  urls: ["/index.html", "/"],
  strategy: pageCache,
});

offlineFallback({
  pageFallback: "/index.html",
});

registerRoute(({ request }) => request.mode === "navigate", pageCache);
registerRoute(imageRoute);
//TODO: Implement asset caching
// registerRoute(({ request }) => request.destination === 'image', new CacheFirst(
//   {
//     cacheName: 'image-cache',
//     plugins: [
//       new CacheableResponsePlugin({
//         statuses: [0, 200],
//       }),
//       new ExpirationPlugin({
//         maxEntries: 50,
//         maxAgeSeconds: 30 * 24 * 60 * 60,
//       }),
//     ],
//   },
// ));
