import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
};

export function PageHeader({ title, subtitle, trailing }: Props) {
  return (
    <View className="mb-6 flex-row items-start justify-between gap-3">
      <View className="min-w-0 flex-1">
        {subtitle ? (
          <Text className="mb-1 text-[13px] text-one-muted dark:text-one-muted-dark">{subtitle}</Text>
        ) : null}
        <Text className="text-[34px] font-medium tracking-tight text-one-fg dark:text-one-fg-dark">{title}</Text>
      </View>
      {trailing ? <View className="mt-0.5 pr-1">{trailing}</View> : null}
    </View>
  );
}
