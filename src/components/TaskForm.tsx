import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/src/components/Button';
import { DayPicker } from '@/src/components/DayPicker';
import { Field } from '@/src/components/Field';
import { GroupedList } from '@/src/components/GroupedList';
import { ListRow } from '@/src/components/ListRow';
import { TimeField } from '@/src/components/TimeField';
import { ALL_DAYS, toTimeString } from '@/src/lib/dates';
import type { TaskInsert } from '@/src/lib/types';

type Props = {
  grouped: boolean;
  initial?: Partial<TaskInsert>;
  submitLabel: string;
  onSubmit: (input: TaskInsert) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function TaskForm({ grouped, initial, submitLabel, onSubmit, onDelete }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [points, setPoints] = useState(String(initial?.points ?? 1));
  const [reminder, setReminder] = useState(
    initial?.reminder_minutes_before != null ? String(initial.reminder_minutes_before) : '',
  );
  const [dueTime, setDueTime] = useState(initial?.due_time ?? toTimeString(9, 0));
  const [days, setDays] = useState<number[]>(initial?.days_of_week ?? ALL_DAYS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <View className="gap-4">
      <GroupedList>
        <Field label="Task" value={title} onChangeText={setTitle} placeholder="Make the bed" autoFocus />
        <Field label="Points" value={points} onChangeText={setPoints} keyboardType="number-pad" />
        {grouped ? (
          <Field
            label="Remind me (minutes before due)"
            value={reminder}
            onChangeText={setReminder}
            keyboardType="number-pad"
            placeholder="Optional, e.g. 15"
          />
        ) : (
          <>
            <TimeField label="Due at" value={dueTime} onChange={setDueTime} />
            <DayPicker value={days} onChange={setDays} />
          </>
        )}
      </GroupedList>
      {error ? <Text className="px-4 text-[14px] text-one-danger">{error}</Text> : null}
      <Button
        label={submitLabel}
        loading={saving}
        disabled={!title.trim()}
        onPress={async () => {
          setSaving(true);
          setError(null);
          try {
            const reminderValue = reminder.trim() === '' ? null : Math.max(0, Number(reminder) || 0);
            await onSubmit({
              title: title.trim(),
              points: Math.max(0, Number(points) || 0),
              reminder_minutes_before: grouped ? reminderValue : null,
              due_time: grouped ? null : dueTime,
              days_of_week: grouped ? ALL_DAYS : days,
            });
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save');
          } finally {
            setSaving(false);
          }
        }}
      />
      {onDelete ? (
        <GroupedList>
          <ListRow
            title="Delete task"
            destructive
            center
            showChevron={false}
            onPress={async () => {
              setSaving(true);
              try {
                await onDelete();
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Could not delete');
                setSaving(false);
              }
            }}
          />
        </GroupedList>
      ) : null}
    </View>
  );
}
