import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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

// 🔥 Request permission + token
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

    console.log("🔥 FCM Token:", token);
    return token;
  } catch (err) {
    console.error("Error getting FCM token:", err);
  }
};

// 🔔 Foreground notifications
onMessage(messaging, async (payload) => {
  console.log("🔔 Foreground message:", payload);

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
    requireInteraction: true,
    silent: false,                 // 🔊 Force sound/vibration
    renotify: true,                // 🔁 repeat vibration if same tag
    timestamp: Date.now(),         // 🕒 helps Chrome treat as new
    tag: "wotg-message",
  };

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title || "WOTG Community", options);
  } else {
    new Notification(title || "WOTG Community", options).onclick = () =>
      window.open(url, "_blank");
  }
});

// ✅ Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then(() => console.log("✅ Service Worker registered for FCM"))
    .catch((err) => console.error("❌ SW registration failed:", err));
}

export default messaging;
