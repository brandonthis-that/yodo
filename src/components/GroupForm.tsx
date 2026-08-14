import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/src/components/Button';
import { DayPicker } from '@/src/components/DayPicker';
import { Field } from '@/src/components/Field';
import { GroupedList } from '@/src/components/GroupedList';
import { ListRow } from '@/src/components/ListRow';
import { TimeField } from '@/src/components/TimeField';
import { WEEKDAYS_ONLY, toTimeString } from '@/src/lib/dates';
import type { GroupInsert } from '@/src/lib/types';

type Props = {
  initial?: Partial<GroupInsert>;
  submitLabel: string;
  onSubmit: (input: GroupInsert) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function GroupForm({ initial, submitLabel, onSubmit, onDelete }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [dueTime, setDueTime] = useState(initial?.due_time ?? toTimeString(8, 0));
  const [days, setDays] = useState<number[]>(initial?.days_of_week ?? WEEKDAYS_ONLY);
  const [bonus, setBonus] = useState(String(initial?.bonus_points ?? 5));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <View className="gap-4">
      <GroupedList>
        <Field label="Name" value={name} onChangeText={setName} placeholder="Morning" autoFocus />
        <TimeField label="Due by" value={dueTime} onChange={setDueTime} />
        <DayPicker value={days} onChange={setDays} />
        <Field label="On-time bonus" value={bonus} onChangeText={setBonus} keyboardType="number-pad" />
      </GroupedList>
      {error ? <Text className="px-4 text-[14px] text-one-danger">{error}</Text> : null}
      <Button
        label={submitLabel}
        loading={saving}
        disabled={!name.trim()}
        onPress={async () => {
          setSaving(true);
          setError(null);
          try {
            await onSubmit({
              name: name.trim(),
              due_time: dueTime,
              days_of_week: days,
              bonus_points: Math.max(0, Number(bonus) || 0),
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
            title="Delete routine"
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
