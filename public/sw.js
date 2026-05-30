self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// Push notification al
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'rutin.online', body: 'Rutinlerini tamamladın mı?' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'rutin-reminder',
      renotify: true,
      actions: [{ action: 'open', title: 'Uygulamayı Aç' }]
    })
  );
});

// Bildirimi tıklayınca uygulamayı aç
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
});

// Günlük hatırlatıcı - her gün akşam 20:00
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_REMINDERS') {
    const reminders = e.data.reminders || [];
    reminders.forEach(r => {
      if (!r.time || r.time === 'Gün boyu') return;
      const [h, m] = r.time.split(':').map(Number);
      const now = new Date();
      const target = new Date();
      target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const delay = target - now;
      setTimeout(() => {
        self.registration.showNotification('rutin.online 🔔', {
          body: r.emoji + ' ' + r.title + ' — zamanı geldi!',
          icon: '/icon-192.png',
          tag: 'rutin-' + r.id,
        });
      }, delay);
    });
  }
});
