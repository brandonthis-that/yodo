import type { ReactNode } from 'react';
import { View } from 'react-native';

type Props = {
  children: ReactNode;
  className?: string;
};

export function FocusBlock({ children, className = '' }: Props) {
  return (
    <View className={`overflow-hidden rounded-[26px] bg-one-surface dark:bg-one-surface-dark ${className}`}>
      {children}
    </View>
  );
}
