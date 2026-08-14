import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { TaskForm } from '@/src/components/TaskForm';
import { useAuth } from '@/src/context/AuthContext';
import { useYodoContext } from '@/src/context/YodoContext';
import { createTask } from '@/src/lib/api';

export default function NewTaskScreen() {
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const { session } = useAuth();
  const { reload, tasks } = useYodoContext();
  const grouped = Boolean(groupId);

  return (
    <Screen safe={false}>
      <TaskForm
        grouped={grouped}
        submitLabel="Create task"
        onSubmit={async (input) => {
          if (!session) return;
          await createTask(session.user.id, {
            ...input,
            group_id: groupId ?? null,
            sort_order: tasks.filter((task) => task.group_id === (groupId ?? null)).length,
          });
          await reload();
          router.back();
        }}
      />
    </Screen>
  );
}
