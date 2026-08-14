import type { Group, Task } from '@/src/lib/types';
import { addDays, dueDateOn, formatTime } from '@/src/lib/dates';
import { groupsDueOn, tasksDueOn } from '@/src/lib/points';

export type Reminder = {
  id: string;
  title: string;
  body: string;
  date: Date;
};

export type ReminderPermissionState = 'granted' | 'denied' | 'undetermined';

export const REMINDER_HORIZON_DAYS = 7;

function atTime(dateStr: string, time: string, minutesBefore = 0): Date {
  return new Date(dueDateOn(dateStr, time).getTime() - minutesBefore * 60 * 1000);
}

export function collectReminders(
  groups: Group[],
  tasks: Task[],
  completedIds: Set<string>,
  dateStr: string,
  now: Date,
): Reminder[] {
  const reminders: Reminder[] = [];

  for (const group of groupsDueOn(groups, dateStr)) {
    const groupTasks = tasksDueOn(tasks, dateStr, group.id);
    const remaining = groupTasks.filter((task) => !completedIds.has(task.id));
    if (remaining.length === 0) continue;

    const groupDue = atTime(dateStr, group.due_time);
    if (groupDue.getTime() > now.getTime()) {
      reminders.push({
        id: `group:${group.id}:${dateStr}`,
        title: group.name,
        body:
          remaining.length === 1
            ? `${remaining[0].title} still open · due ${formatTime(group.due_time)}`
            : `${remaining.length} tasks still open · due ${formatTime(group.due_time)}`,
        date: groupDue,
      });
    }

    for (const task of remaining) {
      if (task.reminder_minutes_before == null) continue;
      const when = atTime(dateStr, group.due_time, task.reminder_minutes_before);
      if (when.getTime() <= now.getTime()) continue;
      reminders.push({
        id: `task:${task.id}:${dateStr}:before`,
        title: task.title,
        body: `${group.name} · due ${formatTime(group.due_time)}`,
        date: when,
      });
    }
  }

  for (const task of tasksDueOn(tasks, dateStr, null)) {
    if (completedIds.has(task.id) || !task.due_time) continue;
    const when = atTime(dateStr, task.due_time);
    if (when.getTime() <= now.getTime()) continue;
    reminders.push({
      id: `task:${task.id}:${dateStr}:due`,
      title: task.title,
      body: `Due ${formatTime(task.due_time)}`,
      date: when,
    });
  }

  return reminders;
}

export function collectUpcomingReminders(
  groups: Group[],
  tasks: Task[],
  completedIds: Set<string>,
  dateStr: string,
  now = new Date(),
  days = REMINDER_HORIZON_DAYS,
): Reminder[] {
  const reminders: Reminder[] = [];
  for (let i = 0; i < days; i += 1) {
    const day = addDays(dateStr, i);
    const completed = i === 0 ? completedIds : new Set<string>();
    reminders.push(...collectReminders(groups, tasks, completed, day, now));
  }
  return reminders;
}
