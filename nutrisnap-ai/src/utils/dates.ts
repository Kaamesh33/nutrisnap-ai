/**
 * Dates are stored as LOCAL calendar days in the form YYYY-MM-DD.
 * We never use toISOString() for this because it converts to UTC, which
 * would put an 11 pm meal in India on the previous or next day.
 */

const pad = (n: number) => String(n).padStart(2, '0');

export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayKey(now: Date = new Date()): string {
  return toDateKey(now);
}

export function isDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = parseDateKey(value);
  return toDateKey(d) === value;
}

/** Midday avoids daylight-saving edge cases when adding days. */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function addDays(key: string, days: number): string {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

/** The `count` days ending on `endKey`, oldest first. */
export function lastNDays(endKey: string, count: number): string[] {
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) out.push(addDays(endKey, -i));
  return out;
}

/** Monday of the week containing `key`. */
export function startOfWeek(key: string): string {
  const d = parseDateKey(key);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(key, diff);
}

export function formatDayLong(key: string): string {
  return parseDateKey(key).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatDayShort(key: string): string {
  return parseDateKey(key).toLocaleDateString(undefined, { weekday: 'short' });
}

export function formatDayMonth(key: string): string {
  return parseDateKey(key).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function relativeDayName(key: string, today: string = todayKey()): string {
  if (key === today) return 'Today';
  if (key === addDays(today, -1)) return 'Yesterday';
  if (key === addDays(today, 1)) return 'Tomorrow';
  return formatDayLong(key);
}
