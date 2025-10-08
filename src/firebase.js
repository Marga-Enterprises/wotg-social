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
    measurementId: "G-02S24N1KB6"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 🔥 Request Notification Permission & Get FCM Token
export const requestForToken = async () => {
    try {
        const token = await getToken(messaging, {
            vapidKey: "BKDt6S3thDMAKi4acX80ecjhWpaYZK3IqVpTWOdsxfeiYGCWur3vt_VwlfdyuU1jP5lzpZoNymEW2VBVN6VQJSY",
        });

        if (token) {
            return token;
        } else {
            console.warn("❌ No registration token available.");
        }
    } catch (error) {
        console.error("Error getting FCM token:", error);
    }
};

// 🔔 Listen for Foreground Notifications (SAFE for Android)
onMessage(messaging, async (payload) => {
    console.log("🔔 Foreground Notification:", payload);

    const { title, body, image } = payload.notification || {};
    const options = {
        body: body,
        icon: image || "/favicon.ico",
    };

    // ✅ Use service worker registration instead of new Notification()
    if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title || "WOTG Community", options);
    } else if (Notification.permission === "granted") {
        // fallback for browsers that allow Notification constructor (like desktop Chrome)
        new Notification(title || "WOTG Community", options);
    }
});

// ✅ Register Service Worker for Background Notifications
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/firebase-messaging-sw.js");
}

export default messaging;
