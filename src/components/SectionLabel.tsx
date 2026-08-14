import { Text } from 'react-native';

export function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="mb-2 ml-4 text-[13px] text-one-muted dark:text-one-muted-dark">{children}</Text>
  );
}
