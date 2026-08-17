import type { Forget, Group, GroupBonus, GroupInsert, Profile, Task, TaskInsert, Completion } from '@/src/lib/types';
import { supabase } from '@/src/lib/supabase';
import { groupCompleteOnTime } from '@/src/lib/points';

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function upsertProfileTimezone(userId: string, timezone: string): Promise<void> {
  const { error } = await supabase.from('profiles').upsert({ id: userId, timezone });
  if (error) throw error;
}

export async function fetchGroups(userId: string): Promise<Group[]> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('user_id', userId)
    .eq('archived', false)
    .order('sort_order')
    .order('due_time');
  if (error) throw error;
  return (data ?? []) as Group[];
}

export async function fetchTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('sort_order');
  if (error) throw error;
  return (data ?? []) as Task[];
}

export async function fetchCompletions(userId: string): Promise<Completion[]> {
  const { data, error } = await supabase.from('completions').select('*').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []) as Completion[];
}

export async function fetchBonuses(userId: string): Promise<GroupBonus[]> {
  const { data, error } = await supabase.from('group_bonuses').select('*').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []) as GroupBonus[];
}

export async function fetchForgets(userId: string): Promise<Forget[]> {
  const { data, error } = await supabase.from('forgets').select('*').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []) as Forget[];
}

export async function markForgotten(userId: string, taskId: string, dateStr: string): Promise<void> {
  const { error } = await supabase.from('forgets').upsert(
    { user_id: userId, task_id: taskId, forgotten_on: dateStr },
    { onConflict: 'task_id,forgotten_on' },
  );
  if (error) throw error;
}

export async function unmarkForgotten(taskId: string, dateStr: string): Promise<void> {
  const { error } = await supabase.from('forgets').delete().eq('task_id', taskId).eq('forgotten_on', dateStr);
  if (error) throw error;
}

export async function createGroup(userId: string, input: GroupInsert): Promise<Group> {
  const { data, error } = await supabase
    .from('groups')
    .insert({ ...input, user_id: userId })
    .select('*')
    .single();
  if (error) throw error;
  return data as Group;
}

export async function updateGroup(id: string, input: Partial<GroupInsert> & { archived?: boolean }): Promise<void> {
  const { error } = await supabase.from('groups').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteGroup(id: string): Promise<void> {
  const { error } = await supabase.from('groups').delete().eq('id', id);
  if (error) throw error;
}

export async function createTask(userId: string, input: TaskInsert): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...input, user_id: userId })
    .select('*')
    .single();
  if (error) throw error;
  return data as Task;
}

export async function updateTask(id: string, input: Partial<TaskInsert> & { active?: boolean }): Promise<void> {
  const { error } = await supabase.from('tasks').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleTaskCompletion(params: {
  userId: string;
  task: Task;
  dateStr: string;
  completed: boolean;
  groups: Group[];
  tasks: Task[];
  completions: Completion[];
}): Promise<void> {
  const { userId, task, dateStr, completed, groups, tasks, completions } = params;

  if (completed) {
    const { error } = await supabase.from('completions').delete().eq('task_id', task.id).eq('completed_on', dateStr);
    if (error) throw error;
    if (task.group_id) {
      const { error: bonusError } = await supabase
        .from('group_bonuses')
        .delete()
        .eq('group_id', task.group_id)
        .eq('earned_on', dateStr);
      if (bonusError) throw bonusError;
    }
    return;
  }

  const { error } = await supabase.from('completions').insert({
    user_id: userId,
    task_id: task.id,
    completed_on: dateStr,
  });
  if (error) throw error;

  const { error: forgetError } = await supabase
    .from('forgets')
    .delete()
    .eq('task_id', task.id)
    .eq('forgotten_on', dateStr);
  if (forgetError) throw forgetError;

  if (!task.group_id) return;

  const group = groups.find((item) => item.id === task.group_id);
  if (!group) return;

  const nextCompletions: Completion[] = [
    ...completions.filter((item) => !(item.task_id === task.id && item.completed_on === dateStr)),
    {
      id: 'pending',
      user_id: userId,
      task_id: task.id,
      completed_on: dateStr,
      completed_at: new Date().toISOString(),
    },
  ];

  if (!groupCompleteOnTime(group, tasks, nextCompletions, dateStr)) return;

  const { error: bonusError } = await supabase.from('group_bonuses').upsert(
    {
      user_id: userId,
      group_id: group.id,
      earned_on: dateStr,
      points: group.bonus_points,
    },
    { onConflict: 'group_id,earned_on' },
  );
  if (bonusError) throw bonusError;
}
