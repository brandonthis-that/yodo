const TAG_PREFIX = 'yodo-reminder:';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    }),
  );
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.type !== 'YodoSyncReminders') return;
  event.waitUntil(syncTriggeredNotifications(data.reminders || []));
});

async function existingReminderNotifications() {
  try {
    return await self.registration.getNotifications({ includeTriggered: true });
  } catch {
    return self.registration.getNotifications();
  }
}

async function syncTriggeredNotifications(reminders) {
  const existing = await existingReminderNotifications();
  for (const notification of existing) {
    if ((notification.tag || '').startsWith(TAG_PREFIX)) notification.close();
  }

  const TimestampTrigger = self.TimestampTrigger;
  if (typeof TimestampTrigger !== 'function') return;

  for (const reminder of reminders) {
    try {
      await self.registration.showNotification(reminder.title, {
        body: reminder.body,
        tag: TAG_PREFIX + reminder.id,
        icon: '/favicon.png',
        badge: '/favicon.png',
        showTrigger: new TimestampTrigger(reminder.at),
      });
    } catch {
      break;
    }
  }
}
