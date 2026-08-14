import { Text, View } from 'react-native';
import { FocusBlock } from '@/src/components/FocusBlock';
import { GroupedList } from '@/src/components/GroupedList';
import { ListRow } from '@/src/components/ListRow';
import { PageHeader } from '@/src/components/PageHeader';
import { Screen } from '@/src/components/Screen';
import { useAuth } from '@/src/context/AuthContext';
import { useYodoContext } from '@/src/context/YodoContext';
import { showError } from '@/src/lib/confirm';

export default function ScoreScreen() {
  const { signOut } = useAuth();
  const { loading, todayPoints, allTimePoints, streak } = useYodoContext();

  return (
    <Screen loading={loading}>
      <PageHeader title="Score" />

      <FocusBlock className="mb-3 px-5 py-5">
        <Text className="text-[13px] text-one-muted dark:text-one-muted-dark">Today</Text>
        <Text className="mt-1 text-[44px] font-medium tabular-nums tracking-tight text-one-fg dark:text-one-fg-dark">
          {todayPoints}
        </Text>
        <Text className="text-[13px] text-one-muted dark:text-one-muted-dark">points</Text>
      </FocusBlock>

      <View className="mb-6 flex-row gap-2.5">
        <FocusBlock className="flex-1 px-5 py-5">
          <Text className="text-[13px] text-one-muted dark:text-one-muted-dark">All time</Text>
          <Text className="mt-1 text-[28px] font-medium tabular-nums text-one-fg dark:text-one-fg-dark">
            {allTimePoints}
          </Text>
        </FocusBlock>
        <FocusBlock className="flex-1 px-5 py-5">
          <Text className="text-[13px] text-one-muted dark:text-one-muted-dark">Streak</Text>
          <Text className="mt-1 text-[28px] font-medium tabular-nums text-one-blue-deep dark:text-one-blue-bright">
            {streak}
          </Text>
          <Text className="mt-0.5 text-[12px] text-one-muted dark:text-one-muted-dark">days on time</Text>
        </FocusBlock>
      </View>

      <Text className="mb-8 px-1 text-[14px] leading-6 text-one-muted dark:text-one-muted-dark">
        Points come from tasks you check off. Finish every task in a routine before its due time to keep the streak and
        collect the bonus.
      </Text>

      <GroupedList>
        <ListRow
          title="Sign out"
          destructive
          center
          showChevron={false}
          onPress={() => {
            void signOut().catch((err) => showError(err instanceof Error ? err.message : 'Could not sign out'));
          }}
        />
      </GroupedList>
    </Screen>
  );
}
