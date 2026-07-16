// Handlers de web push — anexado ao service worker gerado pelo
// vite-plugin-pwa via workbox.importScripts (vite.config.ts).

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};

  event.waitUntil(
    self.registration.showNotification(data.title ?? "Livrea", {
      body: data.body ?? "",
      icon: "/pwa-192x192.png",
      badge: "/pwa-64x64.png",
      data: { url: data.url ?? "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";

  // foca uma aba já aberta do app se existir; senão abre uma nova
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      }),
  );
});
