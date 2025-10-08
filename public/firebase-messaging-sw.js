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

// ✅ Initialize Firebase Messaging
const messaging = firebase.messaging();

// 🔔 Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message received:", payload);

  const { title, body, image } = payload.notification || {};
  const data = payload.data || {};

  // ✅ Enhanced visibility + sound + vibration + heads-up hint
  const notificationOptions = {
    body,
    icon: image || "https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp",
    badge: "https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp",
    data,
    requireInteraction: true,               // keeps visible until user interacts
    renotify: true,                         // vibrate/sound again if same tag
    tag: "wotg-message",                    // group similar notifications
    vibrate: [200, 100, 200, 100, 200],
    sound: "default",                       // 🔔 triggers Android sound channel
    actions: [
      { action: "open", title: "Open App" },
      { action: "dismiss", title: "Dismiss" },
    ],
    // ✅ Chrome ignores `priority` inside here — this must come from FCM payload
    // we still keep it for compatibility
    priority: "high",
  };

  // ✅ Show notification
  self.registration.showNotification(title || "WOTG Community", notificationOptions);
});

// 🖱 Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("🖱 Notification clicked:", event.notification);
  event.notification.close();

  // Handle Dismiss button
  if (event.action === "dismiss") return;

  // Open or focus app
  const url = event.notification?.data?.url || "https://community.wotgonline.com/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
