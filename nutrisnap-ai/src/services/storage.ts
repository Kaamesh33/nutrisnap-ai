import { DEFAULT_PROFILE } from '../models/defaults';
import type { AppData, Meal, MealItem, Profile } from '../models/types';
import { MEAL_CATEGORIES } from '../models/types';
import { isDateKey } from '../utils/dates';

/**
 * LOCAL BROWSER STORAGE
 * Data is saved in this browser's localStorage under STORAGE_KEY.
 * It stays on this device and this browser only. It does not sync to other
 * devices, and clearing browser data deletes it. Use Export to back up.
 */

export const STORAGE_KEY = 'nutrisnap-ai:data:v1';

export function emptyData(): AppData {
  return { version: 1, meals: [], profile: structuredCloneSafe(DEFAULT_PROFILE) };
}

function structuredCloneSafe<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

function validItem(v: unknown): v is MealItem {
  if (!isObj(v) || !isObj(v.per100g)) return false;
  const n = v.per100g;
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    isNum(v.grams) &&
    isNum(n.kcal) &&
    isNum(n.protein) &&
    isNum(n.carbs) &&
    isNum(n.fat) &&
    (n.fibre === null || isNum(n.fibre)) &&
    ['reference', 'user', 'ai-estimate', 'demo'].includes(v.source as string)
  );
}

function validMeal(v: unknown): v is Meal {
  return (
    isObj(v) &&
    typeof v.id === 'string' &&
    typeof v.date === 'string' &&
    isDateKey(v.date) &&
    MEAL_CATEGORIES.includes(v.category as Meal['category']) &&
    typeof v.name === 'string' &&
    Array.isArray(v.items) &&
    v.items.every(validItem)
  );
}

function cleanProfile(v: unknown): Profile {
  const base = structuredCloneSafe(DEFAULT_PROFILE);
  if (!isObj(v)) return base;
  const merged = { ...base, ...v, targets: { ...base.targets, ...(isObj(v.targets) ? v.targets : {}) } } as Profile;
  for (const k of ['kcal', 'protein', 'carbs', 'fat', 'fibre'] as const) {
    if (!isNum(merged.targets[k])) merged.targets[k] = base.targets[k];
  }
  return merged;
}

/**
 * Turns unknown JSON into safe AppData. Invalid meals are dropped and
 * counted so the app can tell the person.
 */
export function parseAppData(raw: unknown): { data: AppData; dropped: number } {
  if (!isObj(raw)) return { data: emptyData(), dropped: 0 };
  const mealsIn = Array.isArray(raw.meals) ? raw.meals : [];
  const meals = mealsIn.filter(validMeal).map((m) => ({
    ...m,
    origin: m.origin ?? 'manual',
    createdAt: m.createdAt ?? new Date().toISOString(),
    updatedAt: m.updatedAt ?? new Date().toISOString(),
    items: m.items.map((i) => ({ ...i, foodId: i.foodId ?? null })),
  }));
  return { data: { version: 1, meals, profile: cleanProfile(raw.profile) }, dropped: mealsIn.length - meals.length };
}

export type LoadResult = { data: AppData; status: 'ok' | 'empty' | 'recovered' | 'unavailable'; dropped: number };

export function loadData(storage: Storage | undefined = safeLocalStorage()): LoadResult {
  if (!storage) return { data: emptyData(), status: 'unavailable', dropped: 0 };
  let text: string | null;
  try {
    text = storage.getItem(STORAGE_KEY);
  } catch {
    return { data: emptyData(), status: 'unavailable', dropped: 0 };
  }
  if (!text) return { data: emptyData(), status: 'empty', dropped: 0 };
  try {
    const { data, dropped } = parseAppData(JSON.parse(text));
    return { data, status: dropped > 0 ? 'recovered' : 'ok', dropped };
  } catch {
    // Keep a copy of the unreadable data instead of silently losing it.
    try {
      storage.setItem(`${STORAGE_KEY}:corrupt-backup`, text);
    } catch {
      /* ignore */
    }
    return { data: emptyData(), status: 'recovered', dropped: 0 };
  }
}

/** Returns an error message, or null when saved. */
export function saveData(data: AppData, storage: Storage | undefined = safeLocalStorage()): string | null {
  if (!storage) return 'This browser is blocking storage, so changes will be lost when you close the page.';
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return null;
  } catch (e) {
    const quota = e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22);
    return quota
      ? 'Browser storage is full. Export a backup, then delete old meals or demo data.'
      : 'Could not save to browser storage. Private browsing can block saving.';
  }
}

export function safeLocalStorage(): Storage | undefined {
  try {
    return typeof window !== 'undefined' ? window.localStorage : undefined;
  } catch {
    return undefined;
  }
}

export function exportJson(data: AppData): string {
  return JSON.stringify({ ...data, exportedAt: new Date().toISOString(), app: 'NutriSnap AI' }, null, 2);
}
