import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { CoinIcon } from '@/src/components/CoinIcon';
import { useAuth } from '@/src/context/AuthContext';
import { useYodoContext } from '@/src/context/YodoContext';

export function accountInitial(email: string | undefined): string {
  const letter = email?.trim().charAt(0);
  return letter ? letter.toUpperCase() : '?';
}

export function AccountButton() {
  const { session } = useAuth();
  const { todayPoints } = useYodoContext();
  const initial = accountInitial(session?.user.email);
  const label = todayPoints > 99 ? '99+' : String(todayPoints);

  return (
    <Pressable
      onPress={() => router.push('/account')}
      accessibilityRole="button"
      accessibilityLabel={`Account, ${todayPoints} coins today`}
      hitSlop={8}
      className="h-12 w-12"
    >
      <View className="h-11 w-11 items-center justify-center rounded-full bg-one-blue">
        <Text className="text-[17px] font-medium text-white">{initial}</Text>
      </View>
      <View
        className="absolute -bottom-1 -right-2 min-w-[22px] flex-row items-center justify-center gap-0.5 rounded-full bg-[#F5C518] px-1 py-0.5"
        style={{
          shadowColor: '#C47E0A',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.35,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <CoinIcon size={11} />
        <Text className="text-[11px] font-medium tabular-nums text-[#6B3F00]">{label}</Text>
      </View>
    </Pressable>
  );
}
