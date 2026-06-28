self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Solvix Go Notification';
    const options = {
      body: data.message || '',
      icon: '/logo.png',
      badge: '/logo.png',
      data: {
        url: data.data?.url || '/login',
        ...data.data
      }
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    // Fallback to text payload
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('Solvix Go Update', {
        body: text,
        icon: '/logo.png'
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if open
      for (let client of windowClients) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Or open a new tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
