import { Link, router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { CoinAmount } from '@/src/components/CoinIcon';
import { GroupForm } from '@/src/components/GroupForm';
import { GroupedList } from '@/src/components/GroupedList';
import { ListRow } from '@/src/components/ListRow';
import { Screen } from '@/src/components/Screen';
import { useYodoContext } from '@/src/context/YodoContext';
import { deleteGroup, updateGroup } from '@/src/lib/api';
import { confirm } from '@/src/lib/confirm';

export default function GroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { groups, tasks, reload } = useYodoContext();
  const group = groups.find((item) => item.id === id);
  const groupTasks = tasks.filter((task) => task.group_id === id).sort((a, b) => a.sort_order - b.sort_order);

  if (!group) {
    return (
      <Screen safe={false}>
        <Text className="text-[17px] text-one-muted dark:text-one-muted-dark">This routine is gone.</Text>
      </Screen>
    );
  }

  return (
    <Screen safe={false}>
      <GroupForm
        initial={group}
        submitLabel="Save routine"
        onSubmit={async (input) => {
          await updateGroup(group.id, input);
          await reload();
          router.back();
        }}
        onDelete={async () => {
          const ok = await confirm('Delete routine?', 'Tasks in this routine will be deleted too.');
          if (!ok) return;
          await deleteGroup(group.id);
          await reload();
          router.replace('/(app)/(tabs)/routines');
        }}
      />

      <View className="mt-8">
        <View className="mb-2 ml-4 mr-1 flex-row items-center justify-between">
          <Text className="text-[13px] text-one-muted dark:text-one-muted-dark">Tasks</Text>
          <Link href={{ pathname: '/task/new', params: { groupId: group.id } }}>
            <Text className="text-[15px] font-medium text-one-blue-deep dark:text-one-blue-bright">Add</Text>
          </Link>
        </View>
        {groupTasks.length === 0 ? (
          <Text className="px-4 text-[14px] text-one-muted dark:text-one-muted-dark">
            Add the steps in this routine.
          </Text>
        ) : (
          <GroupedList>
            {groupTasks.map((task) => (
              <Link key={task.id} href={`/task/${task.id}`} asChild>
                <ListRow
                  title={task.title}
                  value={
                    <View className="flex-row items-center gap-2">
                      <CoinAmount value={task.points} signed size={16} />
                      {task.reminder_minutes_before != null ? (
                        <Text className="text-[15px] text-one-muted dark:text-one-muted-dark">
                          · {task.reminder_minutes_before}m
                        </Text>
                      ) : null}
                    </View>
                  }
                />
              </Link>
            ))}
          </GroupedList>
        )}
      </View>
    </Screen>
  );
}
