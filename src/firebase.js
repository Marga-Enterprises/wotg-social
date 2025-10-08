import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// 🔥 Firebase Config (Load from .env)
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
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 🔥 Request Notification Permission & Get FCM Token
export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("❌ Notification permission not granted.");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey:
        "BKDt6S3thDMAKi4acX80ecjhWpaYZK3IqVpTWOdsxfeiYGCWur3vt_VwlfdyuU1jP5lzpZoNymEW2VBVN6VQJSY",
    });

    if (token) {
      console.log("🔥 FCM Token:", token);
      return token;
    } else {
      console.warn("⚠️ No registration token available.");
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
  }
};

// 🔔 Foreground Notifications (Android-safe, uses service worker)
onMessage(messaging, async (payload) => {
  console.log("🔔 Foreground message:", payload);

  const { title, body, image } = payload.notification || {};
  const options = {
    body,
    icon: image || "https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp",
    badge: "https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp",
    vibrate: [200, 100, 200],
    sound: "default",           // 🔥 important for audible alert
    requireInteraction: true,   // 🔥 stays visible until tapped
    tag: "wotg-message",
  };

  // ✅ Use SW to ensure consistent Android behavior
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title || "WOTG Community", options);
  } else if (Notification.permission === "granted") {
    // Fallback for desktop browsers
    new Notification(title || "WOTG Community", options);
  }
});

// ✅ Register Service Worker for Background Notifications
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then(() => console.log("✅ Service Worker registered for FCM"))
    .catch((err) => console.error("❌ Service Worker registration failed:", err));
}

export default messaging;
