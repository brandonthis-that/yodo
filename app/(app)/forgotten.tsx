import { router } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { EmptyState } from '@/src/components/EmptyState';
import { GroupedList } from '@/src/components/GroupedList';
import { ListRow } from '@/src/components/ListRow';
import { Screen } from '@/src/components/Screen';
import { useYodoContext } from '@/src/context/YodoContext';
import { showError } from '@/src/lib/confirm';
import { formatShortDate } from '@/src/lib/dates';
import { forgetCountLabel, groupForgets } from '@/src/lib/forgets';

export default function ForgottenScreen() {
  const { loading, tasks, forgets, dateStr, unforget } = useYodoContext();
  const grouped = groupForgets(forgets, tasks, dateStr);

  return (
    <Screen loading={loading} safe={false}>
      <Text className="mb-5 px-1 text-[14px] leading-6 text-one-muted dark:text-one-muted-dark">
        Grouped by task. Put back restores something forgotten today.
      </Text>

      {grouped.length === 0 ? (
        <EmptyState
          title="Nothing marked forgotten yet"
          body="After something is past due, you can mark it forgotten so it stays off Today and shows up here."
        />
      ) : (
        <GroupedList>
          {grouped.map((item) => (
            <ListRow
              key={item.task.id}
              title={item.task.title}
              subtitle={`${forgetCountLabel(item.count)} · last ${formatShortDate(item.lastOn)}`}
              value={item.forgottenToday ? undefined : item.count}
              trailingAction={
                item.forgottenToday ? (
                  <Pressable
                    onPress={() => {
                      void unforget(item.task).catch((err) =>
                        showError(err instanceof Error ? err.message : 'Could not update'),
                      );
                    }}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Put ${item.task.title} back on Today`}
                    className="active:opacity-70"
                  >
                    <Text className="text-[15px] text-one-blue-deep dark:text-one-blue-bright">Put back</Text>
                  </Pressable>
                ) : null
              }
              onPress={() => router.push(`/task/${item.task.id}`)}
            />
          ))}
        </GroupedList>
      )}
    </Screen>
  );
}
