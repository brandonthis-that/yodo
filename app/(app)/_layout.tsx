import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/src/context/AuthContext';
import { YodoProvider } from '@/src/context/YodoContext';
import { oneColors } from '@/src/theme';

export default function AppLayout() {
  const { loading, session } = useAuth();
  const colors = oneColors(useColorScheme());

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-one-canvas dark:bg-one-canvas-dark">
        <ActivityIndicator color="#0381FE" />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/sign-in" />;

  return (
    <YodoProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.canvas },
          headerTintColor: colors.blueDeep,
          headerTitleStyle: { fontWeight: '500', color: colors.fg, fontSize: 18 },
          headerShadowVisible: false,
          headerBackTitle: 'Back',
          contentStyle: { backgroundColor: colors.canvas },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="group/new" options={{ title: 'New routine' }} />
        <Stack.Screen name="group/[id]" options={{ title: 'Routine' }} />
        <Stack.Screen name="task/new" options={{ title: 'New task' }} />
        <Stack.Screen name="task/[id]" options={{ title: 'Task' }} />
      </Stack>
    </YodoProvider>
  );
}
