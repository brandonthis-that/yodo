import { Text, TextInput, View, type TextInputProps } from 'react-native';

type Props = TextInputProps & {
  label: string;
};

export function Field({ label, ...props }: Props) {
  return (
    <View className="px-4 py-3">
      <Text className="mb-1 text-[13px] text-one-muted dark:text-one-muted-dark">{label}</Text>
      <TextInput
        placeholderTextColor="#8C8C8C"
        className="py-0.5 text-[17px] text-one-fg dark:text-one-fg-dark"
        {...props}
      />
    </View>
  );
}
