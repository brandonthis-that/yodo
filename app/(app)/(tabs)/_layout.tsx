import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { oneColors } from '@/src/theme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = oneColors(colorScheme);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.blueDeep,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          fontFamily: Platform.select({ web: 'Roboto, sans-serif', default: undefined }),
        },
        tabBarStyle: {
          backgroundColor: colors.canvas,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: 'Routines',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'list.bullet', android: 'list', web: 'list' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="score"
        options={{
          title: 'Score',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'star', android: 'star', web: 'star' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
