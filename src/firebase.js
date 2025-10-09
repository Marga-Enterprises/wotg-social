import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// 🔥 Firebase Config
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

// 🔔 Ask for permission and get FCM token
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
      console.warn("⚠️ No registration token available. Check permission or VAPID key.");
      return null;
    }
  } catch (error) {
    console.error("🚫 Error getting FCM token:", error);
    return null;
  }
};

// 🔥 Listen for messages when app is open / foreground
onMessage(messaging, async (payload) => {
  console.log("🔔 Foreground message received:", payload);

  const { title, body, image } = payload.notification || {};
  const data = payload.data || {};
  const url = data.url || "https://community.wotgonline.com/";

  const options = {
    body: body || "",
    icon: image || "https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp",
    badge: "https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp",
    data: { ...data, url },
    vibrate: [200, 100, 200],
    sound: "default",
    requireInteraction: true, // stays visible until tapped
    tag: "wotg-message",
  };

  try {
    // ✅ Use Service Worker if available (Android-friendly)
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title || "WOTG Community", options);
    } else if (Notification.permission === "granted") {
      // ✅ Desktop fallback (in case SW not ready)
      const notification = new Notification(title || "WOTG Community", options);
      notification.onclick = () => window.open(url, "_blank");
    }
  } catch (err) {
    console.error("⚠️ Error showing notification:", err);
  }
});

// ✅ Register the service worker (for background notifications)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("✅ FCM Service Worker registered:", registration.scope);
    })
    .catch((err) => {
      console.error("❌ Service Worker registration failed:", err);
    });
}

// ✅ Automatically re-request token if permission is lost or refreshed
navigator.permissions?.query({ name: "notifications" }).then((status) => {
  status.onchange = () => {
    if (Notification.permission === "granted") {
      requestForToken();
    }
  };
});

export default messaging;
