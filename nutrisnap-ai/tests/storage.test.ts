import { describe, expect, it } from 'vitest';
import { buildDemoMeals } from '../src/data/demoDiary';
import { emptyData, loadData, parseAppData, saveData, STORAGE_KEY } from '../src/services/storage';

function memoryStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => Array.from(m.keys())[i] ?? null,
    removeItem: (k) => void m.delete(k),
    setItem: (k, v) => void m.set(k, String(v)),
  };
}

describe('storage', () => {
  it('starts empty', () => {
    const r = loadData(memoryStorage());
    expect(r.status).toBe('empty');
    expect(r.data.meals).toEqual([]);
    expect(r.data.profile.isPersonalised).toBe(false);
  });

  it('round-trips meals and profile', () => {
    const s = memoryStorage();
    const data = emptyData();
    data.meals = buildDemoMeals('2026-10-13');
    data.profile.targets.protein = 110;
    expect(saveData(data, s)).toBeNull();
    const r = loadData(s);
    expect(r.status).toBe('ok');
    expect(r.data.meals).toHaveLength(data.meals.length);
    expect(r.data.profile.targets.protein).toBe(110);
  });

  it('keeps a backup and starts fresh when stored JSON is broken', () => {
    const s = memoryStorage();
    s.setItem(STORAGE_KEY, '{not json');
    const r = loadData(s);
    expect(r.status).toBe('recovered');
    expect(s.getItem(`${STORAGE_KEY}:corrupt-backup`)).toBe('{not json');
  });

  it('drops invalid meals but keeps valid ones', () => {
    const good = buildDemoMeals('2026-10-13')[0];
    const { data, dropped } = parseAppData({ meals: [good, { id: 1 }, { ...good, date: 'yesterday' }] });
    expect(data.meals).toHaveLength(1);
    expect(dropped).toBe(2);
  });

  it('reports a friendly message when storage is full', () => {
    const s = memoryStorage();
    s.setItem = () => {
      throw new DOMException('full', 'QuotaExceededError');
    };
    expect(saveData(emptyData(), s)).toMatch(/full/i);
  });

  it('demo meals are always labelled as demo', () => {
    const demo = buildDemoMeals('2026-10-13');
    expect(demo.length).toBeGreaterThan(10);
    expect(demo.every((m) => m.origin === 'demo' && m.items.every((i) => i.source === 'demo'))).toBe(true);
    expect(new Set(demo.map((m) => m.date)).size).toBe(7);
  });
});
