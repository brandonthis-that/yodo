import { Pressable, Text, View } from 'react-native';
import { pad2, parseTime, toTimeString } from '@/src/lib/dates';

type Props = {
  label: string;
  value: string;
  onChange: (time: string) => void;
};

function step(value: string, minutesDelta: number): string {
  const { hours, minutes } = parseTime(value);
  const total = (((hours * 60 + minutes + minutesDelta) % (24 * 60)) + 24 * 60) % (24 * 60);
  return toTimeString(Math.floor(total / 60), total % 60);
}

export function TimeField({ label, value, onChange }: Props) {
  const { hours, minutes } = parseTime(value);

  return (
    <View className="flex-row items-center px-4 py-3">
      <Text className="flex-1 text-[17px] text-one-fg dark:text-one-fg-dark">{label}</Text>
      <Pressable
        onPress={() => onChange(step(value, -15))}
        className="h-8 w-8 items-center justify-center rounded-full bg-one-canvas dark:bg-one-canvas-dark"
      >
        <Text className="text-[18px] leading-5 text-one-blue-deep dark:text-one-blue-bright">−</Text>
      </Pressable>
      <Text className="mx-3 min-w-[64px] text-center text-[20px] font-medium tabular-nums text-one-blue-deep dark:text-one-blue-bright">
        {pad2(hours)}:{pad2(minutes)}
      </Text>
      <Pressable
        onPress={() => onChange(step(value, 15))}
        className="h-8 w-8 items-center justify-center rounded-full bg-one-canvas dark:bg-one-canvas-dark"
      >
        <Text className="text-[18px] leading-5 text-one-blue-deep dark:text-one-blue-bright">+</Text>
      </Pressable>
    </View>
  );
}
