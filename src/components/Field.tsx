import type { ReactNode } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

type Props = TextInputProps & {
  label: string;
  prefix?: ReactNode;
};

export function Field({ label, prefix, ...props }: Props) {
  return (
    <View className="px-4 py-3">
      <Text className="mb-1 text-[13px] text-one-muted dark:text-one-muted-dark">{label}</Text>
      <View className="flex-row items-center gap-1.5">
        {prefix}
        <TextInput
          placeholderTextColor="#8C8C8C"
          className="min-w-0 flex-1 py-0.5 text-[17px] text-one-fg dark:text-one-fg-dark"
          {...props}
        />
      </View>
    </View>
  );
}
