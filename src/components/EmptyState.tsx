import { Text, View } from 'react-native';

type Props = {
  title: string;
  body: string;
};

export function EmptyState({ title, body }: Props) {
  return (
    <View className="items-center px-6 py-16">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-one-surface dark:bg-one-surface-dark">
        <Text className="text-[28px] text-one-blue">✓</Text>
      </View>
      <Text className="text-center text-[17px] font-medium text-one-fg dark:text-one-fg-dark">{title}</Text>
      <Text className="mt-1.5 text-center text-[14px] leading-5 text-one-muted dark:text-one-muted-dark">
        {body}
      </Text>
    </View>
  );
}
