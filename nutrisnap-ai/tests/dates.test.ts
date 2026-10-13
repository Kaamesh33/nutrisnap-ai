import { describe, expect, it } from 'vitest';
import { addDays, isDateKey, lastNDays, startOfWeek, toDateKey } from '../src/utils/dates';

describe('dates (local calendar days)', () => {
  it('formats local dates without UTC shifting', () => {
    expect(toDateKey(new Date(2026, 9, 13, 23, 30))).toBe('2026-10-13');
    expect(toDateKey(new Date(2026, 0, 1, 0, 5))).toBe('2026-01-01');
  });

  it('adds days across months and years', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('lists the last N days oldest first', () => {
    expect(lastNDays('2026-10-13', 3)).toEqual(['2026-10-11', '2026-10-12', '2026-10-13']);
  });

  it('finds Monday of the week', () => {
    expect(startOfWeek('2026-10-13')).toBe('2026-10-12'); // Tuesday -> Monday
    expect(startOfWeek('2026-10-18')).toBe('2026-10-12'); // Sunday -> previous Monday
    expect(startOfWeek('2026-10-12')).toBe('2026-10-12');
  });

  it('validates date keys', () => {
    expect(isDateKey('2026-10-13')).toBe(true);
    expect(isDateKey('2026-02-30')).toBe(false);
    expect(isDateKey('13-10-2026')).toBe(false);
  });
});
