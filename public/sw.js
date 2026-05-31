const CACHE = 'rutin-v1';

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// Scheduled alarm storage
let alarms = [];

function showNotif(title, body, tag) {
  return self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: tag || 'rutin',
    renotify: true,
    requireInteraction: false,
    actions: [{ action: 'open', title: 'Uygulamayı Aç' }]
  });
}

// Alarm engine
function processAlarms() {
  const now = Date.now();
  const hour = new Date(now).getHours();
  const pending = [];
  alarms.forEach(alarm => {
    if (alarm.fireAt <= now) {
      // 22:00 - 08:00 arası bildirim gönderme
      if (hour >= 22 || hour < 8) {
        // Sessiz saat — bir sonraki sabah 08:00'e ertele
        const nextMorning = new Date(now);
        nextMorning.setHours(8, 0, 0, 0);
        if (nextMorning.getTime() <= now) nextMorning.setDate(nextMorning.getDate() + 1);
        pending.push({ ...alarm, fireAt: nextMorning.getTime() });
      } else {
        showNotif('rutin.online 🔔', alarm.body, alarm.tag);
        if (alarm.repeatMs) {
          pending.push({ ...alarm, fireAt: now + alarm.repeatMs });
        }
      }
    } else {
      pending.push(alarm);
    }
  });
  alarms = pending;
}

// Check every minute
setInterval(processAlarms, 60 * 1000);

self.addEventListener('message', e => {
  if (!e.data) return;
  
  if (e.data.type === 'SET_ALARMS') {
    alarms = e.data.alarms || [];
  }
  
  if (e.data.type === 'CLEAR_ROUTINE_ALARMS') {
    alarms = alarms.filter(a => a.routineId !== e.data.routineId);
  }
  
  if (e.data.type === 'CLEAR_ALL_ALARMS') {
    alarms = [];
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type:'window' }).then(cs => {
    if (cs.length > 0) { cs[0].focus(); cs[0].navigate('/'); }
    else clients.openWindow('/');
  }));
});
