import { Pressable, Text, View } from 'react-native';
import { CoinAmount } from '@/src/components/CoinIcon';

type Props = {
  checked: boolean;
  title: string;
  points: number;
  subtitle?: string;
  onToggle: () => void;
  onForget?: () => void;
};

export function TaskRow({ checked, title, points, subtitle, onToggle, onForget }: Props) {
  return (
    <View className="flex-row items-center gap-3.5 px-4 py-[14px]">
      <Pressable
        onPress={onToggle}
        className="min-w-0 flex-1 flex-row items-center gap-3.5 active:opacity-70"
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
      >
        <View
          className={`h-6 w-6 items-center justify-center rounded-full ${
            checked ? 'bg-one-blue-bright' : 'border-[1.5px] border-[#C8C8C8] dark:border-[#6A6A6A]'
          }`}
        >
          {checked ? <Text className="text-[11px] font-bold leading-none text-white">✓</Text> : null}
        </View>
        <View className="min-w-0 flex-1">
          <Text
            className={`text-[17px] ${
              checked ? 'text-one-muted line-through dark:text-one-muted-dark' : 'text-one-fg dark:text-one-fg-dark'
            }`}
            numberOfLines={2}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-0.5 text-[13px] text-one-muted dark:text-one-muted-dark" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </Pressable>
      {onForget ? (
        <Pressable
          onPress={onForget}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Forgot this: ${title}`}
          className="active:opacity-70"
        >
          <Text className="text-[13px] text-one-muted dark:text-one-muted-dark">Forgot this</Text>
        </Pressable>
      ) : null}
      <View className={checked ? 'opacity-45' : undefined}>
        <CoinAmount value={points} signed size={16} />
      </View>
    </View>
  );
}
