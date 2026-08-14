import { Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Group, Task } from '@/src/lib/types';
import {
  collectUpcomingReminders,
  type ReminderPermissionState,
} from '@/src/lib/reminders';

const CHANNEL_ID = 'yodo-due';

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Reminders',
    description: 'Due times for routines and tasks',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 180, 80, 180],
    lightColor: '#d97706',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    enableVibrate: true,
    enableLights: true,
    showBadge: true,
    audioAttributes: {
      usage: Notifications.AndroidAudioUsage.ALARM,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      flags: {
        enforceAudibility: true,
        requestHardwareAudioVideoSynchronization: false,
      },
    },
  });
}

export async function getReminderPermissionState(): Promise<ReminderPermissionState> {
  await ensureAndroidChannel();
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return 'granted';
  if (existing.status === 'denied' && !existing.canAskAgain) return 'denied';
  return 'undetermined';
}

export async function requestReminderPermission(): Promise<boolean> {
  await ensureAndroidChannel();
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

export async function openReminderSettings(): Promise<void> {
  await Linking.openSettings();
}

export async function notifyNow(title: string, body: string): Promise<void> {
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: { channelId: CHANNEL_ID },
  });
}

export async function syncReminders(params: {
  groups: Group[];
  tasks: Task[];
  completedIds: Set<string>;
  dateStr: string;
}): Promise<void> {
  const state = await getReminderPermissionState();
  if (state !== 'granted') return;

  await ensureAndroidChannel();
  const reminders = collectUpcomingReminders(
    params.groups,
    params.tasks,
    params.completedIds,
    params.dateStr,
  );

  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const reminder of reminders) {
    await Notifications.scheduleNotificationAsync({
      identifier: reminder.id,
      content: {
        title: reminder.title,
        body: reminder.body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminder.date.getTime(),
        channelId: CHANNEL_ID,
      },
    });
  }
}

export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}
