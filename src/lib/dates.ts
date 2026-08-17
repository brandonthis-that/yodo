const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
export const WEEKDAYS_ONLY = [1, 2, 3, 4, 5];

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function todayDate(now = new Date()): string {
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

export function weekdayIndex(now = new Date()): number {
  return now.getDay();
}

export function weekdayLabel(index: number): string {
  return WEEKDAYS[index] ?? String(index);
}

/** Postgres `time` values arrive as `HH:MM:SS` or `HH:MM`. */
export function parseTime(value: string): { hours: number; minutes: number } {
  const [h, m] = value.split(':');
  return { hours: Number(h) || 0, minutes: Number(m) || 0 };
}

/** Parse a typed time such as `9:30`, `0930`, or `9`. */
export function parseTimeInput(raw: string): { hours: number; minutes: number } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const colon = trimmed.match(/^(\d{1,2}):(\d{1,2})$/);
  if (colon) {
    const hours = Number(colon[1]);
    const minutes = Number(colon[2]);
    if (hours > 23 || minutes > 59) return null;
    return { hours, minutes };
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 1 || digits.length === 2) {
    const hours = Number(digits);
    if (hours > 23) return null;
    return { hours, minutes: 0 };
  }
  if (digits.length === 3) {
    const hours = Number(digits[0]);
    const minutes = Number(digits.slice(1));
    if (minutes > 59) return null;
    return { hours, minutes };
  }
  if (digits.length === 4) {
    const hours = Number(digits.slice(0, 2));
    const minutes = Number(digits.slice(2));
    if (hours > 23 || minutes > 59) return null;
    return { hours, minutes };
  }
  return null;
}

export function formatTime(value: string): string {
  const { hours, minutes } = parseTime(value);
  return `${pad2(hours)}:${pad2(minutes)}`;
}

export function toTimeString(hours: number, minutes: number): string {
  return `${pad2(hours)}:${pad2(minutes)}:00`;
}

export function dueDateOn(dateStr: string, time: string): Date {
  const { hours, minutes } = parseTime(time);
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export function isPastDue(dateStr: string, time: string, now = new Date()): boolean {
  return now.getTime() > dueDateOn(dateStr, time).getTime();
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

/** `Thu 14 Aug` — archive and “last forgotten” labels. */
export function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return `${weekdayLabel(date.getDay())} ${day} ${MONTHS[month - 1]}`;
}

export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + days);
  return todayDate(d);
}

export function subtractMinutes(time: string, minutes: number): string {
  const { hours, minutes: mins } = parseTime(time);
  const total = hours * 60 + mins - minutes;
  const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  return toTimeString(Math.floor(wrapped / 60), wrapped % 60);
}

export function formatDayList(days: number[]): string {
  if (days.length === 7) return 'Every day';
  if (days.length === 5 && WEEKDAYS_ONLY.every((d) => days.includes(d))) return 'Weekdays';
  if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
  return [...days].sort((a, b) => a - b).map(weekdayLabel).join(' · ');
}

export function deviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}
