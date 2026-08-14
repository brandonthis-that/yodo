import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  loading?: boolean;
  safe?: boolean;
  overlay?: ReactNode;
};

export function Screen({ children, loading, safe = true, overlay }: Props) {
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-one-canvas dark:bg-one-canvas-dark">
        <ActivityIndicator color="#0381FE" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-one-canvas font-sans dark:bg-one-canvas-dark" edges={safe ? ['top'] : []}>
      <View className="flex-1 web:items-center">
        <View className="relative w-full max-w-lg flex-1">
          <ScrollView
            className="w-full flex-1"
            contentContainerClassName="px-6 pb-28 pt-3"
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
          {overlay}
        </View>
      </View>
    </SafeAreaView>
  );
}
