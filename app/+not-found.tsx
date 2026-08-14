import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Missing' }} />
      <View className="flex-1 items-center justify-center bg-one-canvas px-6 dark:bg-one-canvas-dark">
        <Text className="text-[20px] font-medium text-one-fg dark:text-one-fg-dark">This screen does not exist.</Text>
        <Link href="/" className="mt-4">
          <Text className="text-[17px] font-medium text-one-blue-deep dark:text-one-blue-bright">Go home</Text>
        </Link>
      </View>
    </>
  );
}
