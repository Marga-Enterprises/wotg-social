import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// 🔥 Firebase Config (Load from .env or static)
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

// 🔔 Foreground Notifications (when tab is active)
// 🔔 Foreground Notifications (when tab is active)
onMessage(messaging, async (payload) => {
  console.log("🔔 Foreground message received:", payload);

  const { title, body, image } = payload.notification || {};
  const data = payload.data || {};
  const url = data?.url || "https://community.wotgonline.com/";

  const options = {
    body,
    icon: image || "https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp",
    badge: "https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp",
    data: { ...data, url },
    vibrate: [200, 100, 200],
    sound: "default",
    requireInteraction: true, // keeps visible until tapped
    tag: "wotg-message",
  };

  // ✅ Use Service Worker (Android-safe, consistent UX)
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    const notification = await registration.showNotification(
      title || "WOTG Community",
      options
    );

    // ✅ Handle click for foreground notifications
    registration.addEventListener("notificationclick", (event) => {
      event.notification.close();
      const targetUrl = event.notification?.data?.url || url;
      // ❌ clients is not available here — use window.open instead
      window.open(targetUrl, "_blank");
    });
  } else if (Notification.permission === "granted") {
    // ✅ Desktop fallback (if SW is not yet active)
    const notification = new Notification(title || "WOTG Community", options);
    notification.onclick = () => window.open(url, "_blank");
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
