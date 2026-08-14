import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';

export default function AuthLayout() {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-one-canvas dark:bg-one-canvas-dark">
        <ActivityIndicator color="#0381FE" />
      </View>
    );
  }

  if (session) return <Redirect href="/(app)/(tabs)" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
    </Stack>
  );
}
