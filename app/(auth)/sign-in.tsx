import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/src/components/Button';
import { Field } from '@/src/components/Field';
import { GroupedList } from '@/src/components/GroupedList';
import { useAuth } from '@/src/context/AuthContext';

export default function SignInScreen() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setMessage(null);
    try {
      if (mode === 'in') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
        setMessage('Account created. If email confirmation is on in Supabase, check your inbox, then sign in.');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not authenticate');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-one-canvas font-sans dark:bg-one-canvas-dark">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-1 px-6 web:items-center">
          <View className="w-full max-w-md flex-1">
            <View className="pt-10">
              <Text className="text-[13px] font-medium text-one-blue-deep dark:text-one-blue-bright">Yodo</Text>
              <Text className="mt-1 text-[34px] font-medium tracking-tight text-one-fg dark:text-one-fg-dark">
                {mode === 'in' ? 'Sign in' : 'Create account'}
              </Text>
              <Text className="mt-1.5 text-[15px] text-one-muted dark:text-one-muted-dark">
                Do the things you usually forget.
              </Text>
            </View>

            <View className="flex-1 justify-end gap-4 pb-8">
              <GroupedList>
                <Field
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
                <Field
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete={mode === 'in' ? 'password' : 'new-password'}
                />
              </GroupedList>
              {message ? <Text className="px-1 text-[14px] text-one-muted dark:text-one-muted-dark">{message}</Text> : null}
              <Button
                label={mode === 'in' ? 'Sign in' : 'Create account'}
                loading={loading}
                disabled={!email.trim() || password.length < 6}
                onPress={() => void submit()}
              />
              <Button
                variant="ghost"
                label={mode === 'in' ? 'Need an account?' : 'Have an account?'}
                onPress={() => {
                  setMode(mode === 'in' ? 'up' : 'in');
                  setMessage(null);
                }}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
