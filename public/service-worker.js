self.addEventListener('push', (event) => {
    const data = event.data.json();
    console.log('Push received:', data);

    self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/wotg-logo-with-bg.jpeg', // Adjust the path for your app logo 
        data: data.data,
    });
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.notification.data && event.notification.data.url) {
        event.waitUntil(clients.openWindow(event.notification.data.url));
    }
});
