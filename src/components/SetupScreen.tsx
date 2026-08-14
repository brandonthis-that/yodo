import { Linking, Pressable, Text, View } from 'react-native';

export function SetupScreen() {
  return (
    <View className="flex-1 bg-one-canvas px-8 dark:bg-one-canvas-dark">
      <View className="flex-1 justify-end pb-12">
        <View className="w-full max-w-md gap-3 self-center">
          <Text className="text-[13px] font-medium text-one-blue-deep dark:text-one-blue-bright">Yodo</Text>
          <Text className="text-[34px] font-medium tracking-tight text-one-fg dark:text-one-fg-dark">
            Needs Supabase
          </Text>
          <Text className="mt-1 text-[15px] leading-6 text-one-muted dark:text-one-muted-dark">
            Copy .env.example to .env, paste your project URL and anon key, then restart the app. Full steps are in the
            README.
          </Text>
          <Pressable onPress={() => void Linking.openURL('https://supabase.com')} className="mt-4">
            <Text className="text-[17px] font-medium text-one-blue-deep dark:text-one-blue-bright">
              Create a free project
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
