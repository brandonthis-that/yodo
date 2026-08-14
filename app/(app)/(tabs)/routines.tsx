import { Link, router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { AccountButton } from '@/src/components/AccountButton';
import { CoinAmount } from '@/src/components/CoinIcon';
import { EmptyState } from '@/src/components/EmptyState';
import { GroupedList } from '@/src/components/GroupedList';
import { ListRow } from '@/src/components/ListRow';
import { PageHeader } from '@/src/components/PageHeader';
import { Screen } from '@/src/components/Screen';
import { SectionLabel } from '@/src/components/SectionLabel';
import { useYodoContext } from '@/src/context/YodoContext';
import { formatDayList, formatTime } from '@/src/lib/dates';
import { accentFor, inkOn, normalizeGroupColor } from '@/src/theme';

export default function RoutinesScreen() {
  const { loading, groups, tasks } = useYodoContext();
  const standalone = tasks.filter((task) => task.group_id === null);

  return (
    <Screen loading={loading}>
      <PageHeader
        title="Routines"
        subtitle="Groups with a due time, plus one-off tasks."
        trailing={<AccountButton />}
      />

      <View className="mb-6 flex-row gap-2.5">
        <Pressable
          onPress={() => router.push('/group/new')}
          className="flex-1 items-center rounded-[26px] bg-one-blue py-3.5 active:opacity-80"
        >
          <Text className="text-[15px] font-medium text-white">New routine</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/task/new')}
          className="flex-1 items-center rounded-[26px] bg-one-surface py-3.5 active:opacity-80 dark:bg-one-surface-dark"
        >
          <Text className="text-[15px] font-medium text-one-blue-deep dark:text-one-blue-bright">New task</Text>
        </Pressable>
      </View>

      {groups.length === 0 && standalone.length === 0 ? (
        <EmptyState title="No routines yet" body="Start with a Morning routine due at 8:00, then add the things you forget." />
      ) : null}

      {groups.length > 0 ? (
        <View className="mb-6">
          <SectionLabel>My routines</SectionLabel>
          <GroupedList insetClassName="ml-16">
            {groups.map((group, index) => {
              const count = tasks.filter((task) => task.group_id === group.id).length;
              return (
                <Link key={group.id} href={`/group/${group.id}`} asChild>
                  <ListRow
                    title={group.name}
                    subtitle={`${formatDayList(group.days_of_week)} · ${count} ${count === 1 ? 'task' : 'tasks'}`}
                    value={
                      <View className="items-end">
                        <Text className="text-[15px] text-one-muted dark:text-one-muted-dark">
                          {formatTime(group.due_time)}
                        </Text>
                        <CoinAmount value={group.bonus_points} signed size={14} />
                      </View>
                    }
                    leading={<ColorDot color={normalizeGroupColor(group.color, index)} label={group.name} />}
                  />
                </Link>
              );
            })}
          </GroupedList>
        </View>
      ) : null}

      {standalone.length > 0 ? (
        <View>
          <SectionLabel>Standalone</SectionLabel>
          <GroupedList insetClassName="ml-16">
            {standalone.map((task, index) => (
              <Link key={task.id} href={`/task/${task.id}`} asChild>
                <ListRow
                  title={task.title}
                  subtitle={`${task.due_time ? formatTime(task.due_time) : 'No time'} · ${formatDayList(task.days_of_week)}`}
                  value={<CoinAmount value={task.points} signed size={16} />}
                  leading={<ColorDot color={accentFor(index + 3)} label={task.title} />}
                />
              </Link>
            ))}
          </GroupedList>
        </View>
      ) : null}
    </Screen>
  );
}

function ColorDot({ color, label }: { color: string; label: string }) {
  const ink = inkOn(color);
  return (
    <View className="mr-3 h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: color }}>
      <Text className="text-[15px] font-medium" style={{ color: ink.fg }}>
        {label.slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );
}
