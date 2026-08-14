import { Children, type ReactNode } from 'react';
import { View } from 'react-native';
import { FocusBlock } from '@/src/components/FocusBlock';

type Props = {
  children: ReactNode;
  className?: string;
  insetClassName?: string;
};

export function GroupedList({ children, className, insetClassName = 'ml-4' }: Props) {
  const items = Children.toArray(children).filter(Boolean);

  return (
    <FocusBlock className={className}>
      {items.map((child, index) => (
        <View key={index}>
          {index > 0 ? (
            <View className={`h-px bg-one-divider dark:bg-one-divider-dark ${insetClassName}`} />
          ) : null}
          {child}
        </View>
      ))}
    </FocusBlock>
  );
}
