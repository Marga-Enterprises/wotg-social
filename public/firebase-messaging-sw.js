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
  measurementId: "G-02S24N1KB6"
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);

// ✅ Initialize Firebase Messaging
const messaging = firebase.messaging();

// 🔔 Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message received:", payload);

  const { title, body, image } = payload.notification || {};
  const data = payload.data || {}; // ⬅️ include data from backend

  const notificationOptions = {
    body: body,
    icon: image || "/wotg-icon.ico",
    badge: "/wotg-icon.ico",
    data: data, // ⬅️ keep payload data here
  };

  self.registration.showNotification(title || "WOTG Community", notificationOptions);
});

// 🖱 Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("🖱 Notification clicked:", event.notification);
  event.notification.close();

  // Get the URL from FCM data payload or fallback
  const url = event.notification?.data?.url || "https://community.wotgonline.com/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If tab with same origin exists → focus it
      for (const client of clientList) {
        if (client.url.includes("community.wotgonline.com") && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise, open a new tab
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
