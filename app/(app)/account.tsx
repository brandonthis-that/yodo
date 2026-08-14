import { Text, View } from 'react-native';
import { accountInitial } from '@/src/components/AccountButton';
import { CoinIcon } from '@/src/components/CoinIcon';
import { CoinStack } from '@/src/components/CoinStack';
import { FocusBlock } from '@/src/components/FocusBlock';
import { GroupedList } from '@/src/components/GroupedList';
import { ListRow } from '@/src/components/ListRow';
import { Screen } from '@/src/components/Screen';
import { useAuth } from '@/src/context/AuthContext';
import { useYodoContext } from '@/src/context/YodoContext';
import { showError } from '@/src/lib/confirm';

export default function AccountScreen() {
  const { session, signOut } = useAuth();
  const { loading, todayPoints, allTimePoints, streak } = useYodoContext();
  const email = session?.user.email ?? '';
  const initial = accountInitial(email);

  return (
    <Screen loading={loading} safe={false}>
      <View className="mb-7 items-center pt-2">
        <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-one-blue">
          <Text className="text-[28px] font-medium text-white">{initial}</Text>
        </View>
        {email ? (
          <Text className="mt-3 text-[15px] text-one-muted dark:text-one-muted-dark" numberOfLines={1}>
            {email}
          </Text>
        ) : null}
      </View>

      <View className="mb-3 items-center overflow-hidden rounded-[26px] bg-[#F5C518]/18 px-5 py-7 dark:bg-[#F5C518]/12">
        <CoinStack size={76} />
        <Text className="mt-3 text-[52px] font-medium tabular-nums tracking-tight text-one-fg dark:text-one-fg-dark">
          {todayPoints}
        </Text>
        <Text className="mt-0.5 text-[15px] font-medium text-[#C47E0A] dark:text-[#FFD24A]">earned today</Text>
      </View>

      <View className="mb-6 flex-row gap-2.5">
        <FocusBlock className="flex-1 px-5 py-5">
          <Text className="text-[13px] text-one-muted dark:text-one-muted-dark">All time</Text>
          <View className="mt-1 flex-row items-center gap-1.5">
            <CoinIcon size={22} />
            <Text className="text-[24px] font-medium tabular-nums text-one-fg dark:text-one-fg-dark">
              {allTimePoints}
            </Text>
          </View>
        </FocusBlock>
        <FocusBlock className="flex-1 px-5 py-5">
          <Text className="text-[13px] text-one-muted dark:text-one-muted-dark">Streak</Text>
          <Text className="mt-1 text-[24px] font-medium tabular-nums text-one-blue-deep dark:text-one-blue-bright">
            {streak}
          </Text>
          <Text className="mt-0.5 text-[12px] text-one-muted dark:text-one-muted-dark">days on time</Text>
        </FocusBlock>
      </View>

      <Text className="mb-8 px-1 text-[14px] leading-6 text-one-muted dark:text-one-muted-dark">
        Coins come from tasks you check off. Finish every task in a routine before its due time to keep the streak and
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
