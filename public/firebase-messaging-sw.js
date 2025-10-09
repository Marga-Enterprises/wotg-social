// -------------------------------------------------------------
// 🔥 Firebase Cloud Messaging Service Worker
// Works on Android Chrome + Desktop + Background states
// -------------------------------------------------------------

importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

// ⚙️ Firebase Config (MUST match firebase.js)
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

// -------------------------------------------------------------
// 🔔 Handle Background Notifications (Android + Desktop)
// -------------------------------------------------------------
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message received:", payload);

  const { title, body, image } = payload.notification || {};
  const data = payload.data || {};
  const url = data?.url || "https://community.wotgonline.com/";

  const notificationOptions = {
    body: body || "You have a new notification.",
    icon: image || "https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp",
    badge: "https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp",
    data: { ...data, url },
    tag: "wotg-message", // prevents stacking duplicates
    renotify: true,
    requireInteraction: true, // keeps visible until interacted
    vibrate: [200, 100, 200, 100, 200],
    actions: [
      { action: "open", title: "Open" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  // ✅ Show the actual notification
  self.registration.showNotification(title || "WOTG Community", notificationOptions);
});

// -------------------------------------------------------------
// 🖱 Handle Notification Click (Tap or Action Buttons)
// -------------------------------------------------------------
self.addEventListener("notificationclick", (event) => {
  console.log("🖱 Notification clicked:", event.notification);
  event.notification.close();

  // 🧩 Ignore dismiss action
  if (event.action === "dismiss") return;

  const targetUrl = event.notification?.data?.url || "https://community.wotgonline.com/";

  // ✅ Ensure tab focus or open new tab
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        // If a WOTG tab already exists → focus + navigate it
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// -------------------------------------------------------------
// 💡 Android Peeking Behavior Notes
// -------------------------------------------------------------
// ✅ Chrome on Android automatically shows “peeking” heads-up
//    for high-priority notifications with vibration or sound.
// ✅ ensure your FCM payload includes:
//     "notification": { "title": "...", "body": "...", "icon": "..." },
//     "android": { "priority": "high", "notification": { "sound": "default" } }
// ✅ Vibration pattern + requireInteraction help trigger peeking
// ✅ HTTPS is mandatory for web push (not localhost)
// -------------------------------------------------------------
