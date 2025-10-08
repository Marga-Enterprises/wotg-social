importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyC9V0q1iXkXiNRyTpWT13DBjJZLs9WfCgI",
  authDomain: "wotg-community-app.firebaseapp.com",
  projectId: "wotg-community-app",
  storageBucket: "wotg-community-app.firebasestorage.app",
  messagingSenderId: "437940455925",
  appId: "1:437940455925:web:3074ef50923979d1e238bc",
  measurementId: "G-02S24N1KB6",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message:", payload);

  const { title, body, image } = payload.notification || {};
  const data = payload.data || {};
  const url = data?.url || "https://community.wotgonline.com/";

  const notificationOptions = {
    body: body || "You have a new message.",
    icon: image || "https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp",
    badge: "https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp",
    data: { ...data, url },
    requireInteraction: true,
    silent: false,                 // 🔊 ensure alert
    renotify: true,
    tag: "wotg-message",
    vibrate: [200, 100, 200, 100, 200],
    sound: "default",
    timestamp: Date.now(),
    actions: [
      { action: "open", title: "Open" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  // ⏱ slight delay improves Android heads-up reliability
  setTimeout(() => {
    self.registration.showNotification(title || "WOTG Community", notificationOptions);
  }, 50);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const url = event.notification?.data?.url || "https://community.wotgonline.com/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
