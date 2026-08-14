import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { SetupScreen } from '@/src/components/SetupScreen';

export default function Index() {
  const { configured, loading, session } = useAuth();

  if (!configured) return <SetupScreen />;
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-one-canvas dark:bg-one-canvas-dark">
        <ActivityIndicator color="#0381FE" />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/sign-in" />;
  return <Redirect href="/(app)/(tabs)" />;
}
