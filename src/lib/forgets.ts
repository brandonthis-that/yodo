import type { Forget, Group, Task } from '@/src/lib/types';
import { isPastDue } from '@/src/lib/dates';

export function forgetMap(forgets: Forget[], dateStr: string): Map<string, Forget> {
  const map = new Map<string, Forget>();
  for (const forget of forgets) {
    if (forget.forgotten_on === dateStr) map.set(forget.task_id, forget);
  }
  return map;
}

export function forgetCountByTask(forgets: Forget[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const forget of forgets) {
    map.set(forget.task_id, (map.get(forget.task_id) ?? 0) + 1);
  }
  return map;
}

export function dueTimeFor(task: Task, groups: Group[]): string | null {
  if (task.group_id) {
    return groups.find((group) => group.id === task.group_id)?.due_time ?? null;
  }
  return task.due_time;
}

export function isTaskOverdue(task: Task, groups: Group[], dateStr: string, now = new Date()): boolean {
  const time = dueTimeFor(task, groups);
  if (!time) return false;
  return isPastDue(dateStr, time, now);
}

export function forgetCountLabel(count: number): string {
  if (count <= 0) return '';
  if (count === 1) return 'Forgotten once';
  return `Forgotten ${count} times`;
}

export type ForgetGroup = {
  task: Task;
  count: number;
  lastOn: string;
  forgottenToday: boolean;
};

export function groupForgets(forgets: Forget[], tasks: Task[], today: string): ForgetGroup[] {
  const byTask = new Map<string, Forget[]>();
  for (const forget of forgets) {
    const list = byTask.get(forget.task_id) ?? [];
    list.push(forget);
    byTask.set(forget.task_id, list);
  }

  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const grouped: ForgetGroup[] = [];

  for (const [taskId, list] of byTask) {
    const task = taskById.get(taskId);
    if (!task) continue;
    const lastOn = list.reduce(
      (latest, forget) => (forget.forgotten_on > latest ? forget.forgotten_on : latest),
      list[0].forgotten_on,
    );
    grouped.push({
      task,
      count: list.length,
      lastOn,
      forgottenToday: list.some((forget) => forget.forgotten_on === today),
    });
  }

  return grouped.sort((a, b) => b.lastOn.localeCompare(a.lastOn) || b.count - a.count || a.task.title.localeCompare(b.task.title));
}
