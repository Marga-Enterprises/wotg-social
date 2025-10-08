importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// 🔥 Firebase Config (must match your firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyC9V0q1iXkXiNRyTpWT13DBjJZLs9WfCgI",
  authDomain: "wotg-community-app.firebaseapp.com",
  projectId: "wotg-community-app",
  storageBucket: "wotg-community-app.firebasestorage.app",
  messagingSenderId: "437940455925",
  appId: "1:437940455925:web:3074ef50923979d1e238bc",
  measurementId: "G-02S24N1KB6",
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 🔔 Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message received:", payload);

  const { title, body, image } = payload.notification || {};
  const data = payload.data || {};

  // ✅ Use the URL from backend payload (fallback if missing)
  const url = data?.url || "https://community.wotgonline.com/";

  const notificationOptions = {
    body: body || "You have a new message.",
    icon: image || "https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp",
    badge: "https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp",
    data: { ...data, url }, // ✅ store full data for click handling
    requireInteraction: true,  // stays until clicked
    renotify: true,
    tag: "wotg-message",
    vibrate: [200, 100, 200, 100, 200],
    sound: "default",
    actions: [
      { action: "open", title: "Open" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  self.registration.showNotification(title || "WOTG Community", notificationOptions);
});

// 🖱 Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("🖱 Notification clicked:", event.notification);
  event.notification.close();

  // Ignore dismiss action
  if (event.action === "dismiss") return;

  // ✅ Always retrieve URL from notification data
  const url = event.notification?.data?.url || "https://community.wotgonline.com/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // ✅ If WOTG tab exists, focus it & navigate to new URL
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }

      // ✅ Otherwise open new tab
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
