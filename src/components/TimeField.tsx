import { createElement, useEffect, useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { formatTime, parseTime, parseTimeInput, toTimeString } from '@/src/lib/dates';
import { oneColors } from '@/src/theme';

type Props = {
  label: string;
  value: string;
  onChange: (time: string) => void;
};

function step(value: string, minutesDelta: number): string {
  const { hours, minutes } = parseTime(value);
  const total = (((hours * 60 + minutes + minutesDelta) % (24 * 60)) + 24 * 60) % (24 * 60);
  return toTimeString(Math.floor(total / 60), total % 60);
}

function formatTyping(raw: string): string {
  if (raw.includes(':')) {
    const [hours = '', minutes = ''] = raw.split(':');
    return `${hours.replace(/\D/g, '').slice(0, 2)}:${minutes.replace(/\D/g, '').slice(0, 2)}`;
  }
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function commitIfValid(raw: string, onChange: (time: string) => void): boolean {
  const parsed = parseTimeInput(raw);
  if (!parsed) return false;
  onChange(toTimeString(parsed.hours, parsed.minutes));
  return true;
}

function shouldLiveCommit(raw: string): boolean {
  const trimmed = raw.trim();
  if (/^\d{1,2}:\d{2}$/.test(trimmed)) return true;
  return trimmed.replace(/\D/g, '').length >= 3 && parseTimeInput(trimmed) != null;
}

function TimeValue({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (time: string) => void;
}) {
  const scheme = useColorScheme();
  const colors = oneColors(scheme);
  const display = formatTime(value);
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(display);

  useEffect(() => {
    if (!focused) setDraft(formatTime(value));
  }, [value, focused]);

  if (Platform.OS === 'web') {
    return createElement('input', {
      type: 'time',
      value: display,
      step: 60,
      'aria-label': label,
      onChange: (event: { currentTarget: { value: string } }) => {
        const next = event.currentTarget.value;
        if (!next) return;
        const parsed = parseTime(next);
        onChange(toTimeString(parsed.hours, parsed.minutes));
      },
      style: {
        marginLeft: 12,
        marginRight: 12,
        minWidth: 108,
        padding: 0,
        fontSize: 20,
        fontWeight: '500',
        fontVariantNumeric: 'tabular-nums',
        textAlign: 'center',
        color: colors.blueDeep,
        backgroundColor: 'transparent',
        border: 'none',
        outline: 'none',
        colorScheme: scheme === 'dark' ? 'dark' : 'light',
      },
    });
  }

  return (
    <TextInput
      value={draft}
      onChangeText={(text) => {
        const next = formatTyping(text);
        setDraft(next);
        if (shouldLiveCommit(next)) commitIfValid(next, onChange);
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        if (!commitIfValid(draft, onChange)) setDraft(formatTime(value));
      }}
      keyboardType="number-pad"
      inputMode="numeric"
      maxLength={5}
      selectTextOnFocus
      accessibilityLabel={label}
      placeholder="09:00"
      placeholderTextColor="#8C8C8C"
      className="mx-3 min-w-[72px] py-0 text-center text-[20px] font-medium tabular-nums text-one-blue-deep dark:text-one-blue-bright"
    />
  );
}

export function TimeField({ label, value, onChange }: Props) {
  return (
    <View className="flex-row items-center px-4 py-3">
      <Text className="flex-1 text-[17px] text-one-fg dark:text-one-fg-dark">{label}</Text>
      <Pressable
        onPress={() => onChange(step(value, -15))}
        accessibilityLabel="15 minutes earlier"
        className="h-8 w-8 items-center justify-center rounded-full bg-one-canvas dark:bg-one-canvas-dark"
      >
        <Text className="text-[18px] leading-5 text-one-blue-deep dark:text-one-blue-bright">−</Text>
      </Pressable>
      <TimeValue label={label} value={value} onChange={onChange} />
      <Pressable
        onPress={() => onChange(step(value, 15))}
        accessibilityLabel="15 minutes later"
        className="h-8 w-8 items-center justify-center rounded-full bg-one-canvas dark:bg-one-canvas-dark"
      >
        <Text className="text-[18px] leading-5 text-one-blue-deep dark:text-one-blue-bright">+</Text>
      </Pressable>
    </View>
  );
}
