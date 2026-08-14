import '../global.css';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider } from '@/src/context/AuthContext';
import { configureNotificationHandler } from '@/src/lib/notifications';
import { one } from '@/src/theme';

export { ErrorBoundary } from 'expo-router';

configureNotificationHandler();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    void navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? YodoDark : YodoLight}>
        <Head>
          <title>Yodo</title>
          <meta name="description" content="Personal reminders with routines and points" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content={colorScheme === 'dark' ? one.dark.canvas : one.light.canvas} />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-title" content="Yodo" />
        </Head>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}

const YodoDark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: one.dark.blueDeep,
    background: one.dark.canvas,
    card: one.dark.canvas,
    text: one.dark.fg,
    border: one.dark.divider,
  },
};

const YodoLight = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: one.light.blueDeep,
    background: one.light.canvas,
    card: one.light.canvas,
    text: one.light.fg,
    border: one.light.divider,
  },
};
