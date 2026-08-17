import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { supabase } from '@/src/lib/supabase';
import { deviceTimezone, todayDate } from '@/src/lib/dates';
import {
  fetchBonuses,
  fetchCompletions,
  fetchForgets,
  fetchGroups,
  fetchProfile,
  fetchTasks,
  markForgotten,
  toggleTaskCompletion,
  unmarkForgotten,
  upsertProfileTimezone,
} from '@/src/lib/api';
import {
  bonusMap,
  bonusPointsOn,
  completionMap,
  computeStreak,
  groupsDueOn,
  taskPointsOn,
  tasksDueOn,
  totalPoints,
} from '@/src/lib/points';
import {
  getReminderPermissionState,
  notifyNow,
  openReminderSettings,
  requestReminderPermission,
  syncReminders,
} from '@/src/lib/notifications';
import { forgetMap } from '@/src/lib/forgets';
import type { ReminderPermissionState } from '@/src/lib/reminders';
import type { Completion, Forget, Group, GroupBonus, Task } from '@/src/lib/types';

export function useYodo(userId: string | undefined) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [forgets, setForgets] = useState<Forget[]>([]);
  const [bonuses, setBonuses] = useState<GroupBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminderPermission, setReminderPermission] = useState<ReminderPermissionState>('undetermined');
  const [resumeTick, setResumeTick] = useState(0);
  const dateStr = todayDate();

  const reload = useCallback(async () => {
    if (!userId) return;
    setError(null);
    const [nextGroups, nextTasks, nextCompletions, nextBonuses, nextForgets] = await Promise.all([
      fetchGroups(userId),
      fetchTasks(userId),
      fetchCompletions(userId),
      fetchBonuses(userId),
      fetchForgets(userId),
    ]);
    setGroups(nextGroups);
    setTasks(nextTasks);
    setCompletions(nextCompletions);
    setBonuses(nextBonuses);
    setForgets(nextForgets);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const profile = await fetchProfile(userId);
        const timezone = deviceTimezone();
        if (!profile || profile.timezone !== timezone) {
          await upsertProfileTimezone(userId, timezone);
        }
        await reload();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reload, userId]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`yodo-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, () => {
        void reload();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        void reload();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'completions' }, () => {
        void reload();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_bonuses' }, () => {
        void reload();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forgets' }, () => {
        void reload();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [reload, userId]);

  const doneToday = useMemo(() => completionMap(completions, dateStr), [completions, dateStr]);
  const forgottenToday = useMemo(() => forgetMap(forgets, dateStr), [dateStr, forgets]);
  const bonusesToday = useMemo(() => bonusMap(bonuses, dateStr), [bonuses, dateStr]);
  const todayGroups = useMemo(() => groupsDueOn(groups, dateStr), [groups, dateStr]);
  const standaloneToday = useMemo(() => tasksDueOn(tasks, dateStr, null), [tasks, dateStr]);
  const clearedToday = useMemo(
    () => new Set([...doneToday.keys(), ...forgottenToday.keys()]),
    [doneToday, forgottenToday],
  );

  const pushReminders = useCallback(async () => {
    try {
      await syncReminders({
        groups,
        tasks,
        completedIds: clearedToday,
        dateStr,
      });
    } catch {
      // Scheduling must never break the checklist.
    }
  }, [clearedToday, dateStr, groups, tasks]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') setResumeTick((tick) => tick + 1);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!userId || loading) return;

    let cancelled = false;
    void (async () => {
      try {
        let state = await getReminderPermissionState();
        if (Platform.OS !== 'web' && state === 'undetermined') {
          await requestReminderPermission();
          state = await getReminderPermissionState();
        }
        if (cancelled) return;
        setReminderPermission(state);
        if (state === 'granted') await pushReminders();
      } catch {
        if (!cancelled) setReminderPermission('undetermined');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loading, pushReminders, resumeTick, userId]);

  const enableReminders = useCallback(async () => {
    const current = await getReminderPermissionState();
    if (current === 'denied') {
      await openReminderSettings();
      return;
    }
    const granted = await requestReminderPermission();
    const next = await getReminderPermissionState();
    setReminderPermission(next);
    if (!granted) return;
    try {
      await notifyNow('Reminders on', 'Yodo will ping you when something is due.');
      await pushReminders();
    } catch {
      // Permission is enough; a failed test ping is not.
    }
  }, [pushReminders]);

  const toggle = useCallback(
    async (task: Task) => {
      if (!userId) return;
      const completed = doneToday.has(task.id);
      setCompletions((current) => {
        if (completed) {
          return current.filter((item) => !(item.task_id === task.id && item.completed_on === dateStr));
        }
        return [
          ...current,
          {
            id: `local-${task.id}`,
            user_id: userId,
            task_id: task.id,
            completed_on: dateStr,
            completed_at: new Date().toISOString(),
          },
        ];
      });
      if (!completed) {
        setForgets((current) =>
          current.filter((item) => !(item.task_id === task.id && item.forgotten_on === dateStr)),
        );
      }
      if (completed && task.group_id) {
        setBonuses((current) =>
          current.filter((item) => !(item.group_id === task.group_id && item.earned_on === dateStr)),
        );
      }
      try {
        await toggleTaskCompletion({
          userId,
          task,
          dateStr,
          completed,
          groups,
          tasks,
          completions,
        });
        await reload();
      } catch (err) {
        await reload();
        throw err;
      }
    },
    [completions, dateStr, doneToday, groups, reload, tasks, userId],
  );

  const forget = useCallback(
    async (task: Task) => {
      if (!userId || doneToday.has(task.id) || forgottenToday.has(task.id)) return;
      setForgets((current) => [
        ...current,
        {
          id: `local-${task.id}`,
          user_id: userId,
          task_id: task.id,
          forgotten_on: dateStr,
          forgotten_at: new Date().toISOString(),
        },
      ]);
      try {
        await markForgotten(userId, task.id, dateStr);
        await reload();
      } catch (err) {
        await reload();
        throw err;
      }
    },
    [dateStr, doneToday, forgottenToday, reload, userId],
  );

  const unforget = useCallback(
    async (task: Task) => {
      if (!userId || !forgottenToday.has(task.id)) return;
      setForgets((current) =>
        current.filter((item) => !(item.task_id === task.id && item.forgotten_on === dateStr)),
      );
      try {
        await unmarkForgotten(task.id, dateStr);
        await reload();
      } catch (err) {
        await reload();
        throw err;
      }
    },
    [dateStr, forgottenToday, reload, userId],
  );

  const todayPoints = taskPointsOn(tasks, completions, dateStr) + bonusPointsOn(bonuses, dateStr);
  const allTimePoints = totalPoints(tasks, completions, bonuses);
  const streak = computeStreak(groups, bonuses);

  return {
    loading,
    error,
    dateStr,
    groups,
    tasks,
    completions,
    forgets,
    bonuses,
    todayGroups,
    standaloneToday,
    doneToday,
    forgottenToday,
    bonusesToday,
    todayPoints,
    allTimePoints,
    streak,
    reminderPermission,
    reload,
    toggle,
    forget,
    unforget,
    enableReminders,
  };
}
