import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
};

export function PageHeader({ title, subtitle, trailing }: Props) {
  return (
    <View className="mb-6">
      {subtitle ? (
        <Text className="mb-1 text-[13px] text-one-muted dark:text-one-muted-dark">{subtitle}</Text>
      ) : null}
      <View className="flex-row items-end justify-between gap-3">
        <Text className="flex-1 text-[34px] font-medium tracking-tight text-one-fg dark:text-one-fg-dark">
          {title}
        </Text>
        {trailing}
      </View>
    </View>
  );
}
