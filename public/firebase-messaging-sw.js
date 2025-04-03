importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// 🔥 Firebase Config (Must match your `firebase.js`)
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

// 🔔 Handle Background Notifications
messaging.onBackgroundMessage((payload) => {
    console.log("📩 Received background notification:", payload);

    const { title, body, image } = payload.notification;

    self.registration.showNotification(title, {
        body: body,
        icon: image || "/wotgLogo.webp",
        badge: "/wotgLogo.webp",
    });
});
