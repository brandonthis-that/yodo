import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/src/components/Button';
import { CoinIcon } from '@/src/components/CoinIcon';
import { ColorField } from '@/src/components/ColorField';
import { DayPicker } from '@/src/components/DayPicker';
import { Field } from '@/src/components/Field';
import { GroupedList } from '@/src/components/GroupedList';
import { ListRow } from '@/src/components/ListRow';
import { TimeField } from '@/src/components/TimeField';
import { ALL_DAYS, WEEKDAYS_ONLY, formatTime, toTimeString } from '@/src/lib/dates';
import type { Group, GroupInsert, TaskInsert } from '@/src/lib/types';
import { nextGroupColor } from '@/src/theme';

type RoutineChoice = 'new' | 'none' | string;

type Props = {
  groups: Group[];
  initial?: Partial<TaskInsert>;
  submitLabel: string;
  onSubmit: (input: TaskInsert, newGroup?: GroupInsert) => Promise<void>;
  onDelete?: () => Promise<void>;
};

function defaultRoutine(initial?: Partial<TaskInsert>): RoutineChoice {
  if (initial?.group_id) return initial.group_id;
  return 'none';
}

function routineSummary(routine: RoutineChoice, groups: Group[], routineName: string): string {
  if (routine === 'none') return 'Optional. Group this with a shared due time';
  if (routine === 'new') return routineName.trim() || 'New routine';
  return groups.find((group) => group.id === routine)?.name ?? 'Routine';
}

export function TaskForm({ groups, initial, submitLabel, onSubmit, onDelete }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [points, setPoints] = useState(String(initial?.points ?? 1));
  const [reminder, setReminder] = useState(
    initial?.reminder_minutes_before != null ? String(initial.reminder_minutes_before) : '',
  );
  const [dueTime, setDueTime] = useState(initial?.due_time ?? toTimeString(9, 0));
  const [days, setDays] = useState<number[]>(initial?.days_of_week ?? ALL_DAYS);
  const [routine, setRoutine] = useState<RoutineChoice>(() => defaultRoutine(initial));
  const [routineOpen, setRoutineOpen] = useState(() => Boolean(initial?.group_id));
  const [routineName, setRoutineName] = useState('');
  const [routineDueTime, setRoutineDueTime] = useState(toTimeString(8, 0));
  const [routineDays, setRoutineDays] = useState<number[]>(WEEKDAYS_ONLY);
  const [routineColor, setRoutineColor] = useState(nextGroupColor(groups.map((group) => group.color)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const creatingRoutine = routine === 'new';
  const grouped = routine !== 'none';

  return (
    <View className="gap-4">
      <GroupedList>
        <Field label="Task" value={title} onChangeText={setTitle} placeholder="Make the bed" autoFocus />
        <Field
          label="Points"
          value={points}
          onChangeText={setPoints}
          keyboardType="number-pad"
          prefix={<CoinIcon size={18} />}
        />
        {grouped ? null : (
          <>
            <TimeField label="Due at" value={dueTime} onChange={setDueTime} />
            <DayPicker value={days} onChange={setDays} />
          </>
        )}
      </GroupedList>

      <GroupedList>
        <ListRow
          title="Add to a routine"
          subtitle={routineSummary(routine, groups, routineName)}
          showChevron={false}
          value={
            <Text className="text-[18px] leading-5 text-one-muted/50 dark:text-one-muted-dark/50">
              {routineOpen ? '⌃' : '›'}
            </Text>
          }
          accessibilityRole="button"
          accessibilityState={{ expanded: routineOpen }}
          accessibilityHint={routineOpen ? 'Collapse routine options' : 'Show routine options'}
          onPress={() => setRoutineOpen((open) => !open)}
        />
        {routineOpen ? (
          <>
            <ListRow
              title="New routine"
              subtitle="This task starts a group with a shared due time"
              showChevron={false}
              leading={<Radio selected={creatingRoutine} />}
              accessibilityRole="radio"
              accessibilityState={{ selected: creatingRoutine }}
              onPress={() => setRoutine('new')}
            />
            {groups.map((group) => (
              <ListRow
                key={group.id}
                title={group.name}
                subtitle={`Due ${formatTime(group.due_time)}`}
                showChevron={false}
                leading={<Radio selected={routine === group.id} />}
                accessibilityRole="radio"
                accessibilityState={{ selected: routine === group.id }}
                onPress={() => setRoutine(group.id)}
              />
            ))}
            <ListRow
              title="No, standalone"
              subtitle="This task has its own due time"
              showChevron={false}
              leading={<Radio selected={routine === 'none'} />}
              accessibilityRole="radio"
              accessibilityState={{ selected: routine === 'none' }}
              onPress={() => setRoutine('none')}
            />
          </>
        ) : null}
      </GroupedList>

      {creatingRoutine ? (
        <GroupedList>
          <Field
            label="Routine name"
            value={routineName}
            onChangeText={setRoutineName}
            placeholder="Morning"
          />
          <TimeField label="Due by" value={routineDueTime} onChange={setRoutineDueTime} />
          <DayPicker value={routineDays} onChange={setRoutineDays} />
          <ColorField value={routineColor} onChange={setRoutineColor} />
        </GroupedList>
      ) : null}

      {grouped ? (
        <GroupedList>
          <Field
            label="Remind me (minutes before due)"
            value={reminder}
            onChangeText={setReminder}
            keyboardType="number-pad"
            placeholder="Optional, e.g. 15"
          />
        </GroupedList>
      ) : null}

      {error ? <Text className="px-4 text-[14px] text-one-danger">{error}</Text> : null}
      <Button
        label={submitLabel}
        loading={saving}
        disabled={!title.trim() || (creatingRoutine && !routineName.trim())}
        onPress={async () => {
          setSaving(true);
          setError(null);
          try {
            const reminderValue = reminder.trim() === '' ? null : Math.max(0, Number(reminder) || 0);
            await onSubmit(
              {
                title: title.trim(),
                points: Math.max(0, Number(points) || 0),
                group_id: creatingRoutine || routine === 'none' ? null : routine,
                reminder_minutes_before: grouped ? reminderValue : null,
                due_time: grouped ? null : dueTime,
                days_of_week: grouped ? ALL_DAYS : days,
              },
              creatingRoutine
                ? {
                    name: routineName.trim(),
                    due_time: routineDueTime,
                    days_of_week: routineDays,
                    bonus_points: 5,
                    color: routineColor,
                  }
                : undefined,
            );
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

function Radio({ selected }: { selected: boolean }) {
  return (
    <View
      className={`mr-3 h-6 w-6 rounded-full ${
        selected
          ? 'border-[7px] border-one-blue'
          : 'border-[1.5px] border-[#C8C8C8] dark:border-[#6A6A6A]'
      }`}
    />
  );
}
