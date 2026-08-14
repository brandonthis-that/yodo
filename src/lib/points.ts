import type { Completion, Group, GroupBonus, Task } from '@/src/lib/types';
import { addDays, dueDateOn, todayDate } from '@/src/lib/dates';

export function isDueOn(daysOfWeek: number[], dateStr: string): boolean {
  const [year, month, day] = dateStr.split('-').map(Number);
  const weekday = new Date(year, month - 1, day).getDay();
  return daysOfWeek.includes(weekday);
}

export function groupsDueOn(groups: Group[], dateStr: string): Group[] {
  return groups
    .filter((group) => !group.archived && isDueOn(group.days_of_week, dateStr))
    .sort((a, b) => a.sort_order - b.sort_order || a.due_time.localeCompare(b.due_time));
}

export function tasksDueOn(tasks: Task[], dateStr: string, groupId: string | null): Task[] {
  return tasks
    .filter((task) => {
      if (!task.active) return false;
      if (groupId === null) return task.group_id === null && isDueOn(task.days_of_week, dateStr);
      return task.group_id === groupId;
    })
    .sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title));
}

export function completionMap(completions: Completion[], dateStr: string): Map<string, Completion> {
  const map = new Map<string, Completion>();
  for (const completion of completions) {
    if (completion.completed_on === dateStr) map.set(completion.task_id, completion);
  }
  return map;
}

export function bonusMap(bonuses: GroupBonus[], dateStr: string): Map<string, GroupBonus> {
  const map = new Map<string, GroupBonus>();
  for (const bonus of bonuses) {
    if (bonus.earned_on === dateStr) map.set(bonus.group_id, bonus);
  }
  return map;
}

export function taskPointsOn(
  tasks: Task[],
  completions: Completion[],
  dateStr: string,
): number {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  let total = 0;
  for (const completion of completions) {
    if (completion.completed_on !== dateStr) continue;
    total += byId.get(completion.task_id)?.points ?? 0;
  }
  return total;
}

export function bonusPointsOn(bonuses: GroupBonus[], dateStr: string): number {
  return bonuses.filter((bonus) => bonus.earned_on === dateStr).reduce((sum, bonus) => sum + bonus.points, 0);
}

export function totalPoints(tasks: Task[], completions: Completion[], bonuses: GroupBonus[]): number {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const fromTasks = completions.reduce((sum, completion) => sum + (byId.get(completion.task_id)?.points ?? 0), 0);
  const fromBonuses = bonuses.reduce((sum, bonus) => sum + bonus.points, 0);
  return fromTasks + fromBonuses;
}

export function groupCompleteOnTime(
  group: Group,
  tasks: Task[],
  completions: Completion[],
  dateStr: string,
): boolean {
  const groupTasks = tasksDueOn(tasks, dateStr, group.id);
  if (groupTasks.length === 0) return false;
  const done = completionMap(completions, dateStr);
  const due = dueDateOn(dateStr, group.due_time);
  return groupTasks.every((task) => {
    const completion = done.get(task.id);
    return completion ? new Date(completion.completed_at).getTime() <= due.getTime() : false;
  });
}

/**
 * Consecutive days, walking backward from today, where every due group
 * earned its on-time bonus. Days with no due groups are skipped.
 * If today is not finished yet, the streak still counts through yesterday.
 */
export function computeStreak(
  groups: Group[],
  bonuses: GroupBonus[],
  now = new Date(),
): number {
  const today = todayDate(now);
  const bonusDates = bonusMapByDate(bonuses);
  const start = todayFullyCleared(groups, bonuses, today, now) ? today : addDays(today, -1);

  let streak = 0;
  let cursor = start;
  for (let i = 0; i < 400; i += 1) {
    const due = groupsDueOn(groups, cursor);
    if (due.length === 0) {
      cursor = addDays(cursor, -1);
      continue;
    }
    const earned = bonusDates.get(cursor) ?? new Set<string>();
    const allEarned = due.every((group) => earned.has(group.id));
    if (!allEarned) break;
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function bonusMapByDate(bonuses: GroupBonus[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const bonus of bonuses) {
    const set = map.get(bonus.earned_on) ?? new Set<string>();
    set.add(bonus.group_id);
    map.set(bonus.earned_on, set);
  }
  return map;
}

function todayFullyCleared(groups: Group[], bonuses: GroupBonus[], today: string, now: Date): boolean {
  const due = groupsDueOn(groups, today);
  if (due.length === 0) return true;
  const earned = bonusMap(bonuses, today);
  return due.every((group) => earned.has(group.id));
}
