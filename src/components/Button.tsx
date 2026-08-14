import { ActivityIndicator, Pressable, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
};

export function Button({ label, onPress, disabled, loading, variant = 'primary' }: Props) {
  const styles =
    variant === 'primary'
      ? 'bg-one-blue'
      : variant === 'danger'
        ? 'bg-one-danger'
        : 'bg-transparent';
  const text =
    variant === 'primary'
      ? 'text-white'
      : variant === 'danger'
        ? 'text-white'
        : 'text-[17px] font-medium text-one-blue-deep dark:text-one-blue-bright';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`items-center justify-center rounded-[26px] px-4 py-[14px] active:opacity-80 ${styles} ${
        disabled ? 'opacity-40' : ''
      }`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? '#0381FE' : '#fff'} />
      ) : (
        <Text className={`text-[17px] font-medium ${text}`}>{label}</Text>
      )}
    </Pressable>
  );
}
