import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

// Precache the build assets injected by vite-plugin-pwa at build time.
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Activate updated service workers immediately so reminder logic stays current.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// Focus (or open) the app when a reminder notification is clicked.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
        return undefined;
      })
  );
});
