import { Alert, Platform } from 'react-native';

export async function confirm(title: string, message: string, confirmLabel = 'Delete'): Promise<boolean> {
  if (Platform.OS === 'web') {
    return window.confirm(`${title}\n\n${message}`);
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export function showError(message: string): void {
  if (Platform.OS === 'web') {
    window.alert(message);
    return;
  }
  Alert.alert('Something went wrong', message);
}
