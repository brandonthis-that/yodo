import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { TaskForm } from '@/src/components/TaskForm';
import { useAuth } from '@/src/context/AuthContext';
import { useYodoContext } from '@/src/context/YodoContext';
import { createGroup, deleteTask, updateTask } from '@/src/lib/api';
import { confirm } from '@/src/lib/confirm';

export default function TaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { groups, tasks, reload } = useYodoContext();
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return (
      <Screen safe={false}>
        <Text className="text-[17px] text-one-muted dark:text-one-muted-dark">This task is gone.</Text>
      </Screen>
    );
  }

  return (
    <Screen safe={false}>
      <TaskForm
        groups={groups}
        initial={task}
        submitLabel="Save task"
        onSubmit={async (input, newGroup) => {
          let resolvedGroupId = input.group_id ?? null;
          if (newGroup && session) {
            const group = await createGroup(session.user.id, {
              ...newGroup,
              sort_order: groups.length,
            });
            resolvedGroupId = group.id;
          }
          await updateTask(task.id, { ...input, group_id: resolvedGroupId });
          await reload();
          router.back();
        }}
        onDelete={async () => {
          const ok = await confirm('Delete task?', 'Completions for this task will be removed.');
          if (!ok) return;
          await deleteTask(task.id);
          await reload();
          router.back();
        }}
      />
    </Screen>
  );
}
