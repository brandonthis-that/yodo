import { Pressable, Text, View } from 'react-native';
import { groupColors } from '@/src/theme';

type Props = {
  value: string;
  onChange: (color: string) => void;
};

export function ColorField({ value, onChange }: Props) {
  return (
    <View className="px-4 py-3">
      <Text className="mb-2.5 text-[13px] text-one-muted dark:text-one-muted-dark">Color</Text>
      <View className="flex-row flex-wrap gap-2.5">
        {groupColors.map((color) => {
          const selected = color.toUpperCase() === value.toUpperCase();
          return (
            <Pressable
              key={color}
              onPress={() => onChange(color)}
              accessibilityRole="button"
              accessibilityLabel={`Color ${color}`}
              accessibilityState={{ selected }}
              className={`h-11 w-11 items-center justify-center rounded-full ${
                selected ? 'border-2 border-one-fg dark:border-one-fg-dark' : ''
              }`}
            >
              <View className="h-8 w-8 rounded-full" style={{ backgroundColor: color }} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
