import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';
import { AccountButton } from '@/src/components/AccountButton';
import { CoinAmount } from '@/src/components/CoinIcon';
import { EmptyState } from '@/src/components/EmptyState';
import { GroupDeck, type GroupDeckItem } from '@/src/components/GroupDeck';
import { GroupedList } from '@/src/components/GroupedList';
import { PageHeader } from '@/src/components/PageHeader';
import { Screen } from '@/src/components/Screen';
import { SectionLabel } from '@/src/components/SectionLabel';
import { TaskRow } from '@/src/components/TaskRow';
import { useYodoContext } from '@/src/context/YodoContext';
import { formatTime, isPastDue, weekdayLabel, weekdayIndex } from '@/src/lib/dates';
import { forgetCountByTask, forgetCountLabel, isTaskOverdue } from '@/src/lib/forgets';
import { tasksDueOn } from '@/src/lib/points';
import { showError } from '@/src/lib/confirm';
import { normalizeGroupColor } from '@/src/theme';
import type { Task } from '@/src/lib/types';

export default function TodayScreen() {
  const {
    loading,
    error,
    todayGroups,
    standaloneToday,
    tasks,
    groups,
    dateStr,
    doneToday,
    forgottenToday,
    forgets,
    bonusesToday,
    todayPoints,
    reminderPermission,
    toggle,
    forget,
    enableReminders,
  } = useYodoContext();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const forgetCounts = useMemo(() => forgetCountByTask(forgets), [forgets]);
  const visibleStandalone = standaloneToday.filter((task) => !forgottenToday.has(task.id));
  const empty = todayGroups.length === 0 && visibleStandalone.length === 0 && forgottenToday.size === 0;

  const todayTasks = [
    ...todayGroups.flatMap((group) => tasksDueOn(tasks, dateStr, group.id)),
    ...standaloneToday,
  ].filter((task) => !forgottenToday.has(task.id));
  const dueCount = todayTasks.length;
  const doneCount = todayTasks.filter((task) => doneToday.has(task.id)).length;

  const deckItems: GroupDeckItem[] = useMemo(
    () =>
      todayGroups.map((group, index) => {
        const groupTasks = tasksDueOn(tasks, dateStr, group.id).filter((task) => !forgottenToday.has(task.id));
        const groupDone = groupTasks.filter((task) => doneToday.has(task.id)).length;
        const bonus = bonusesToday.get(group.id);
        return {
          id: group.id,
          name: group.name,
          dueTime: formatTime(group.due_time),
          done: groupDone,
          total: groupTasks.length,
          bonusEarned: Boolean(bonus),
          bonusLabel: bonus
            ? `On-time bonus +${bonus.points}`
            : `+${group.bonus_points} if done by ${formatTime(group.due_time)}`,
          color: normalizeGroupColor(group.color, index),
        };
      }),
    [bonusesToday, dateStr, doneToday, forgottenToday, tasks, todayGroups],
  );

  const addTask = () => {
    router.push('/task/new');
  };

  const onToggle = (task: Task) => {
    void toggle(task).catch((err) => showError(err instanceof Error ? err.message : 'Could not update'));
  };

  const onForget = (task: Task) => {
    void forget(task).catch((err) => showError(err instanceof Error ? err.message : 'Could not update'));
  };

  const rowFor = (task: Task, standalone: boolean) => {
    const checked = doneToday.has(task.id);
    const overdue = !checked && isTaskOverdue(task, groups, dateStr, now);
    const history = forgetCountLabel(forgetCounts.get(task.id) ?? 0);
    const subtitle = history || (standalone && task.due_time ? formatTime(task.due_time) : undefined);
    return (
      <TaskRow
        key={task.id}
        title={task.title}
        points={task.points}
        subtitle={subtitle}
        checked={checked}
        onToggle={() => onToggle(task)}
        onForget={overdue ? () => onForget(task) : undefined}
      />
    );
  };

  return (
    <Screen
      loading={loading}
      overlay={
        <Pressable
          onPress={addTask}
          accessibilityRole="button"
          accessibilityLabel="Add a task"
          className="absolute bottom-5 right-6 h-14 w-14 items-center justify-center rounded-full bg-one-blue active:opacity-80"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.22,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <SymbolView
            name={{ ios: 'plus', android: 'add', web: 'add' }}
            tintColor="#fff"
            size={28}
            fallback={<Text className="text-[28px] leading-none text-white">+</Text>}
          />
        </Pressable>
      }
    >
      <PageHeader
        subtitle={`${weekdayLabel(weekdayIndex())} · ${dateStr}`}
        title="Today"
        trailing={<AccountButton />}
      />

      {error ? <Text className="mb-4 text-[14px] text-one-danger">{error}</Text> : null}

      {reminderPermission !== 'granted' ? (
        <Pressable
          onPress={() => void enableReminders()}
          className="mb-5 rounded-[26px] bg-one-surface px-4 py-3.5 active:opacity-80 dark:bg-one-surface-dark"
        >
          <Text className="text-[17px] font-medium text-one-fg dark:text-one-fg-dark">
            {reminderPermission === 'denied' ? 'Reminders are blocked' : 'Turn on reminders'}
          </Text>
          <Text className="mt-0.5 text-[13px] leading-5 text-one-muted dark:text-one-muted-dark">
            {reminderPermission === 'denied'
              ? 'Allow notifications for Yodo in system settings so due times can alert you.'
              : 'Tap to allow alerts for due routines on this phone.'}
          </Text>
        </Pressable>
      ) : null}

      {todayGroups.length > 0 ? (
        <View className="mb-6">
          <GroupDeck items={deckItems} />
        </View>
      ) : null}

      {todayGroups.length === 0 && !empty ? (
        <View className="mb-6 flex-row gap-2.5">
          <GlanceCard label="Due" value={dueCount} />
          <GlanceCard label="Done" value={doneCount} />
          <GlanceCard label="Coins" value={todayPoints} coins />
        </View>
      ) : null}

      {empty ? (
        <EmptyState title="Nothing due today" body="Tap + to add a task, or start a routine under Routines." />
      ) : null}

      {todayGroups.map((group) => {
        const allDue = tasksDueOn(tasks, dateStr, group.id);
        const groupTasks = allDue.filter((task) => !forgottenToday.has(task.id));
        const remaining = groupTasks.filter((task) => !doneToday.has(task.id)).length;
        const pastDue = isPastDue(dateStr, group.due_time, now);
        if (groupTasks.length === 0 && allDue.length > 0) return null;
        return (
          <View key={group.id} className="mb-6">
            {todayGroups.length > 1 ? (
              <SectionLabel>{`${group.name} · ${formatTime(group.due_time)}`}</SectionLabel>
            ) : null}
            {pastDue && remaining > 0 ? (
              <Text className="mb-2 px-4 text-[13px] text-one-muted dark:text-one-muted-dark">
                {`${group.name} is past · ${remaining} still open`}
              </Text>
            ) : null}
            {groupTasks.length === 0 ? (
              <Text className="px-4 text-[14px] text-one-muted dark:text-one-muted-dark">
                No tasks in this routine yet.
              </Text>
            ) : (
              <GroupedList insetClassName="ml-14">
                {groupTasks.map((task) => rowFor(task, false))}
              </GroupedList>
            )}
          </View>
        );
      })}

      {visibleStandalone.length > 0 ? (
        <View className="mb-6">
          <SectionLabel>Also today</SectionLabel>
          <GroupedList insetClassName="ml-14">
            {visibleStandalone.map((task) => rowFor(task, true))}
          </GroupedList>
        </View>
      ) : null}

      {forgottenToday.size > 0 ? (
        <Pressable
          onPress={() => router.push('/forgotten')}
          accessibilityRole="button"
          accessibilityLabel="Open forgotten tasks"
          className="mb-4 items-center py-2 active:opacity-70"
        >
          <Text className="text-[13px] text-one-muted dark:text-one-muted-dark">
            {forgottenToday.size === 1 ? '1 forgotten' : `${forgottenToday.size} forgotten`}
          </Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

function GlanceCard({ label, value, coins }: { label: string; value: number; coins?: boolean }) {
  return (
    <View className="flex-1 items-center rounded-[26px] bg-one-surface px-2 py-3.5 dark:bg-one-surface-dark">
      {coins ? (
        <CoinAmount
          value={value}
          size={18}
          textClassName="text-[22px] font-medium tabular-nums text-[#C47E0A] dark:text-[#FFD24A]"
        />
      ) : (
        <Text className="text-[22px] font-medium tabular-nums text-one-fg dark:text-one-fg-dark">{value}</Text>
      )}
      <Text className="mt-0.5 text-[12px] text-one-muted dark:text-one-muted-dark">{label}</Text>
    </View>
  );
}
