import { Pressable, Text, View } from 'react-native';

type Props = {
  checked: boolean;
  title: string;
  points: number;
  subtitle?: string;
  onToggle: () => void;
};

export function TaskRow({ checked, title, points, subtitle, onToggle }: Props) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center gap-3.5 px-4 py-[14px] active:bg-black/5 dark:active:bg-white/8"
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
        {subtitle ? <Text className="mt-0.5 text-[13px] text-one-muted dark:text-one-muted-dark">{subtitle}</Text> : null}
      </View>
      <Text className="text-[15px] tabular-nums text-one-muted dark:text-one-muted-dark">+{points}</Text>
    </Pressable>
  );
}
