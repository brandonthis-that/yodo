import { Pressable, Text, View } from 'react-native';
import { EmptyState } from '@/src/components/EmptyState';
import { GroupedList } from '@/src/components/GroupedList';
import { PageHeader } from '@/src/components/PageHeader';
import { Screen } from '@/src/components/Screen';
import { SectionLabel } from '@/src/components/SectionLabel';
import { TaskRow } from '@/src/components/TaskRow';
import { useYodoContext } from '@/src/context/YodoContext';
import { formatTime, weekdayLabel, weekdayIndex } from '@/src/lib/dates';
import { tasksDueOn } from '@/src/lib/points';
import { showError } from '@/src/lib/confirm';

export default function TodayScreen() {
  const {
    loading,
    error,
    todayGroups,
    standaloneToday,
    tasks,
    dateStr,
    doneToday,
    bonusesToday,
    todayPoints,
    reminderPermission,
    toggle,
    enableReminders,
  } = useYodoContext();

  const empty = todayGroups.length === 0 && standaloneToday.length === 0;
  const todayTasks = [
    ...todayGroups.flatMap((group) => tasksDueOn(tasks, dateStr, group.id)),
    ...standaloneToday,
  ];
  const dueCount = todayTasks.length;
  const doneCount = todayTasks.filter((task) => doneToday.has(task.id)).length;

  return (
    <Screen loading={loading}>
      <PageHeader
        subtitle={`${weekdayLabel(weekdayIndex())} · ${dateStr}`}
        title="Today"
        trailing={
          <View className="mb-1 rounded-full bg-one-blue/10 px-3 py-1">
            <Text className="text-[17px] font-medium tabular-nums text-one-blue-deep dark:text-one-blue-bright">
              {todayPoints}
            </Text>
          </View>
        }
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

      {!empty ? (
        <View className="mb-6 flex-row gap-2.5">
          <GlanceCard label="Due" value={dueCount} />
          <GlanceCard label="Done" value={doneCount} />
          <GlanceCard label="Points" value={todayPoints} />
        </View>
      ) : null}

      {empty ? (
        <EmptyState title="Nothing due today" body="Add a morning routine under Routines to get started." />
      ) : null}

      {todayGroups.map((group) => {
        const groupTasks = tasksDueOn(tasks, dateStr, group.id);
        const groupDone = groupTasks.filter((task) => doneToday.has(task.id)).length;
        const bonus = bonusesToday.get(group.id);

        return (
          <View key={group.id} className="mb-6">
            <View className="mb-2 flex-row items-baseline justify-between px-4">
              <Text className="text-[13px] text-one-muted dark:text-one-muted-dark">{group.name}</Text>
              <Text className="text-[13px] text-one-muted dark:text-one-muted-dark">
                {formatTime(group.due_time)} · {groupDone}/{groupTasks.length}
              </Text>
            </View>
            {groupTasks.length === 0 ? (
              <Text className="px-4 text-[14px] text-one-muted dark:text-one-muted-dark">
                No tasks in this routine yet.
              </Text>
            ) : (
              <GroupedList insetClassName="ml-14">
                {groupTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    title={task.title}
                    points={task.points}
                    checked={doneToday.has(task.id)}
                    onToggle={() => {
                      void toggle(task).catch((err) =>
                        showError(err instanceof Error ? err.message : 'Could not update'),
                      );
                    }}
                  />
                ))}
              </GroupedList>
            )}
            {groupTasks.length > 0 ? (
              bonus ? (
                <Text className="mt-2 px-4 text-[13px] text-one-success">On-time bonus +{bonus.points}</Text>
              ) : (
                <Text className="mt-2 px-4 text-[13px] text-one-muted dark:text-one-muted-dark">
                  +{group.bonus_points} if everything is done by {formatTime(group.due_time)}
                </Text>
              )
            ) : null}
          </View>
        );
      })}

      {standaloneToday.length > 0 ? (
        <View className="mb-6">
          <SectionLabel>Also today</SectionLabel>
          <GroupedList insetClassName="ml-14">
            {standaloneToday.map((task) => (
              <TaskRow
                key={task.id}
                title={task.title}
                points={task.points}
                subtitle={task.due_time ? formatTime(task.due_time) : undefined}
                checked={doneToday.has(task.id)}
                onToggle={() => {
                  void toggle(task).catch((err) => showError(err instanceof Error ? err.message : 'Could not update'));
                }}
              />
            ))}
          </GroupedList>
        </View>
      ) : null}

    </Screen>
  );
}

function GlanceCard({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 items-center rounded-[26px] bg-one-surface px-2 py-3.5 dark:bg-one-surface-dark">
      <Text className="text-[22px] font-medium tabular-nums text-one-fg dark:text-one-fg-dark">{value}</Text>
      <Text className="mt-0.5 text-[12px] text-one-muted dark:text-one-muted-dark">{label}</Text>
    </View>
  );
}
