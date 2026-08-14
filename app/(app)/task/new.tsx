import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { TaskForm } from '@/src/components/TaskForm';
import { useAuth } from '@/src/context/AuthContext';
import { useYodoContext } from '@/src/context/YodoContext';
import { createGroup, createTask } from '@/src/lib/api';

export default function NewTaskScreen() {
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const { session } = useAuth();
  const { reload, tasks, groups } = useYodoContext();
  const initialGroupId = typeof groupId === 'string' && groupId.length > 0 ? groupId : null;

  return (
    <Screen safe={false}>
      <TaskForm
        groups={groups}
        initial={initialGroupId ? { group_id: initialGroupId } : undefined}
        submitLabel="Create task"
        onSubmit={async (input, newGroup) => {
          if (!session) return;
          let resolvedGroupId = input.group_id ?? null;
          if (newGroup) {
            const group = await createGroup(session.user.id, {
              ...newGroup,
              sort_order: groups.length,
            });
            resolvedGroupId = group.id;
          }
          await createTask(session.user.id, {
            ...input,
            group_id: resolvedGroupId,
            sort_order: tasks.filter((task) => task.group_id === resolvedGroupId).length,
          });
          await reload();
          router.back();
        }}
      />
    </Screen>
  );
}
