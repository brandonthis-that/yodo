import { forwardRef, type ReactNode } from 'react';
import { Pressable, Text, View, type PressableProps } from 'react-native';

type Props = Omit<PressableProps, 'children'> & {
  title: string;
  subtitle?: string;
  value?: string;
  leading?: ReactNode;
  showChevron?: boolean;
  destructive?: boolean;
  center?: boolean;
};

export const ListRow = forwardRef<View, Props>(function ListRow(
  { title, subtitle, value, onPress, leading, showChevron = true, destructive, center, className, ...rest },
  ref,
) {
  return (
    <Pressable
      ref={ref}
      {...rest}
      onPress={onPress}
      className={`flex-row items-center px-4 py-[14px] active:bg-black/5 dark:active:bg-white/10 ${
        center ? 'justify-center' : ''
      } ${className ?? ''}`}
    >
      {leading}
      <View className={center ? '' : 'min-w-0 flex-1'}>
        <Text
          className={`text-[17px] ${
            destructive
              ? 'text-one-danger dark:text-one-danger-dark'
              : 'text-one-fg dark:text-one-fg-dark'
          }`}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 text-[13px] text-one-muted dark:text-one-muted-dark" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text className="ml-2 text-[15px] text-one-muted dark:text-one-muted-dark">{value}</Text>
      ) : null}
      {showChevron && !destructive ? (
        <Text className="ml-1 text-[22px] leading-6 text-one-muted/40 dark:text-one-muted-dark/40">›</Text>
      ) : null}
    </Pressable>
  );
});
