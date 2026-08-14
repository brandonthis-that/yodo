import { router } from 'expo-router';
import { Screen } from '@/src/components/Screen';
import { GroupForm } from '@/src/components/GroupForm';
import { useAuth } from '@/src/context/AuthContext';
import { useYodoContext } from '@/src/context/YodoContext';
import { createGroup } from '@/src/lib/api';

export default function NewGroupScreen() {
  const { session } = useAuth();
  const { reload, groups } = useYodoContext();

  return (
    <Screen safe={false}>
      <GroupForm
        submitLabel="Create routine"
        onSubmit={async (input) => {
          if (!session) return;
          const group = await createGroup(session.user.id, {
            ...input,
            sort_order: groups.length,
          });
          await reload();
          router.replace(`/group/${group.id}`);
        }}
      />
    </Screen>
  );
}
