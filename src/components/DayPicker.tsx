import { Pressable, Text, View } from 'react-native';
import { ALL_DAYS, weekdayLabel } from '@/src/lib/dates';

type Props = {
  value: number[];
  onChange: (days: number[]) => void;
};

export function DayPicker({ value, onChange }: Props) {
  return (
    <View className="px-4 py-3">
      <Text className="mb-2.5 text-[13px] text-one-muted dark:text-one-muted-dark">Days</Text>
      <View className="flex-row justify-between">
        {ALL_DAYS.map((day) => {
          const selected = value.includes(day);
          return (
            <Pressable
              key={day}
              onPress={() => {
                if (selected) {
                  if (value.length === 1) return;
                  onChange(value.filter((item) => item !== day));
                } else {
                  onChange([...value, day].sort((a, b) => a - b));
                }
              }}
              className={`h-9 w-9 items-center justify-center rounded-full ${
                selected ? 'bg-one-blue' : 'bg-one-canvas dark:bg-one-canvas-dark'
              }`}
            >
              <Text
                className={`text-[13px] font-medium ${
                  selected ? 'text-white' : 'text-one-muted dark:text-one-muted-dark'
                }`}
              >
                {weekdayLabel(day).slice(0, 1)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
