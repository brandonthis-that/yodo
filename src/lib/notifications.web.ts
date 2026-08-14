import type { Group, Task } from '@/src/lib/types';
import { collectUpcomingReminders, type ReminderPermissionState } from '@/src/lib/reminders';

const SHOWN_KEY = 'yodo-shown-reminders';
const CATCH_UP_MS = 15 * 60 * 1000;
const TAG_PREFIX = 'yodo-reminder:';

type Scheduled = {
  id: string;
  title: string;
  body: string;
  at: number;
};

let timers: ReturnType<typeof setTimeout>[] = [];
let pending: Scheduled[] = [];
let watching = false;

function notificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

function loadShown(): Set<string> {
  try {
    const raw = window.localStorage.getItem(SHOWN_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveShown(shown: Set<string>): void {
  try {
    const recent = [...shown].slice(-200);
    window.localStorage.setItem(SHOWN_KEY, JSON.stringify(recent));
  } catch {
    // Ignore quota / private mode.
  }
}

async function registration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    const existing = await navigator.serviceWorker.getRegistration();
    if (!existing) {
      await navigator.serviceWorker.register('/sw.js');
    }
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
    ]);
  } catch {
    return null;
  }
}

async function show(title: string, body: string, tag: string): Promise<void> {
  const reg = await registration();
  if (reg?.showNotification) {
    await reg.showNotification(title, {
      body,
      tag,
      icon: '/favicon.png',
      badge: '/favicon.png',
      silent: false,
    });
    return;
  }
  if (notificationSupported()) {
    new Notification(title, { body, icon: '/favicon.png', tag });
  }
}

async function present(item: Scheduled): Promise<void> {
  const shown = loadShown();
  if (shown.has(item.id)) return;
  shown.add(item.id);
  saveShown(shown);
  await show(item.title, item.body, TAG_PREFIX + item.id);
}

function clearTimers(): void {
  for (const timer of timers) clearTimeout(timer);
  timers = [];
}

function armTimers(items: Scheduled[]): void {
  clearTimers();
  const now = Date.now();
  for (const item of items) {
    const delay = item.at - now;
    if (delay <= 0 || delay > 2_147_483_647) continue;
    timers.push(setTimeout(() => void present(item), delay));
  }
}

function catchUp(): void {
  const now = Date.now();
  for (const item of pending) {
    if (item.at <= now && now - item.at < CATCH_UP_MS) {
      void present(item);
    }
  }
}

function watchForeground(): void {
  if (watching || typeof document === 'undefined') return;
  watching = true;
  window.setInterval(catchUp, 20_000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') catchUp();
  });
  window.addEventListener('focus', catchUp);
}

export async function getReminderPermissionState(): Promise<ReminderPermissionState> {
  if (!notificationSupported()) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return 'undetermined';
}

export async function requestReminderPermission(): Promise<boolean> {
  if (!notificationSupported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export async function openReminderSettings(): Promise<void> {
  window.alert(
    'Notifications are blocked for this site. In Chrome, tap the lock icon next to the address, allow Notifications, then try again.',
  );
}

export async function notifyNow(title: string, body: string): Promise<void> {
  const state = await getReminderPermissionState();
  if (state !== 'granted') return;
  await show(title, body, 'yodo-now');
}

export async function syncReminders(params: {
  groups: Group[];
  tasks: Task[];
  completedIds: Set<string>;
  dateStr: string;
}): Promise<void> {
  const state = await getReminderPermissionState();
  if (state !== 'granted') return;

  pending = collectUpcomingReminders(
    params.groups,
    params.tasks,
    params.completedIds,
    params.dateStr,
  ).map((reminder) => ({
    id: reminder.id,
    title: reminder.title,
    body: reminder.body,
    at: reminder.date.getTime(),
  }));

  armTimers(pending);
  catchUp();
  watchForeground();

  const reg = await registration();
  reg?.active?.postMessage({ type: 'YodoSyncReminders', reminders: pending });
}

export function configureNotificationHandler(): void {}
