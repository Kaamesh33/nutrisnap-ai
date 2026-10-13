import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { buildDemoMeals } from '../data/demoDiary';
import type { AppData, Meal, Profile } from '../models/types';
import { exportJson, loadData, parseAppData, saveData, emptyData } from '../services/storage';
import { todayKey } from '../utils/dates';

/**
 * App-wide state: meals and profile, saved to browser storage after every change.
 * Components read and change data through useAppStore().
 */

export type ToastKind = 'success' | 'error' | 'info';
export interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

interface StoreValue {
  meals: Meal[];
  profile: Profile;
  today: string;
  storageError: string | null;
  loadNotice: string | null;
  toast: Toast | null;
  showToast: (message: string, kind?: ToastKind) => void;
  dismissToast: () => void;
  dismissLoadNotice: () => void;
  getMeal: (id: string) => Meal | undefined;
  addMeal: (meal: Meal) => void;
  updateMeal: (meal: Meal) => void;
  deleteMeal: (id: string) => void;
  saveProfile: (profile: Profile) => void;
  loadDemo: () => number;
  removeDemo: () => number;
  hasDemo: boolean;
  exportData: () => string;
  importData: (text: string) => { ok: boolean; message: string; profile?: Profile };
  resetAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const sortMeals = (meals: Meal[]) => {
  const order = { breakfast: 0, lunch: 1, snacks: 2, dinner: 3 } as const;
  return [...meals].sort((a, b) => (a.date === b.date ? order[a.category] - order[b.category] || a.createdAt.localeCompare(b.createdAt) : a.date.localeCompare(b.date)));
};

export function AppStoreProvider({ children, storage }: { children: ReactNode; storage?: Storage }) {
  const initial = useRef(loadData(storage ?? undefinedIfMissing()));
  const [data, setData] = useState<AppData>(initial.current.data);
  const [storageError, setStorageError] = useState<string | null>(
    initial.current.status === 'unavailable' ? 'This browser is blocking storage, so changes will be lost when you close the page.' : null,
  );
  const [loadNotice, setLoadNotice] = useState<string | null>(
    initial.current.status === 'recovered'
      ? initial.current.dropped > 0
        ? `${initial.current.dropped} saved meal(s) could not be read and were skipped.`
        : 'Saved data could not be read, so the app started fresh. A backup copy was kept in browser storage.'
      : null,
  );
  const [toast, setToast] = useState<Toast | null>(null);
  const [today, setToday] = useState(todayKey());
  const firstRender = useRef(true);

  // Save after every change (skips the very first render, which is just the load).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setStorageError(saveData(data, storage ?? undefinedIfMissing()));
  }, [data, storage]);

  // Keep "today" correct if the app stays open past midnight.
  useEffect(() => {
    const t = setInterval(() => setToday(todayKey()), 60_000);
    return () => clearInterval(t);
  }, []);

  const showToast = useCallback((message: string, kind: ToastKind = 'success') => {
    setToast({ id: Date.now(), message, kind });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const value = useMemo<StoreValue>(() => {
    const setMeals = (fn: (m: Meal[]) => Meal[]) => setData((d) => ({ ...d, meals: sortMeals(fn(d.meals)) }));
    return {
      meals: data.meals,
      profile: data.profile,
      today,
      storageError,
      loadNotice,
      toast,
      showToast,
      dismissToast: () => setToast(null),
      dismissLoadNotice: () => setLoadNotice(null),
      getMeal: (id) => data.meals.find((m) => m.id === id),
      addMeal: (meal) => setMeals((m) => [...m, meal]),
      updateMeal: (meal) => setMeals((m) => m.map((x) => (x.id === meal.id ? meal : x))),
      deleteMeal: (id) => setMeals((m) => m.filter((x) => x.id !== id)),
      saveProfile: (profile) => setData((d) => ({ ...d, profile })),
      hasDemo: data.meals.some((m) => m.origin === 'demo'),
      loadDemo: () => {
        const demo = buildDemoMeals(today);
        setMeals((m) => [...m.filter((x) => x.origin !== 'demo'), ...demo]);
        return demo.length;
      },
      removeDemo: () => {
        const count = data.meals.filter((m) => m.origin === 'demo').length;
        setMeals((m) => m.filter((x) => x.origin !== 'demo'));
        return count;
      },
      exportData: () => exportJson(data),
      importData: (text) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch {
          return { ok: false, message: 'That file is not valid JSON. Choose a file exported from NutriSnap AI.' };
        }
        const { data: next, dropped } = parseAppData(parsed);
        if (next.meals.length === 0 && !(parsed && typeof parsed === 'object' && 'profile' in parsed)) {
          return { ok: false, message: 'No NutriSnap AI data was found in that file.' };
        }
        setData({ ...next, meals: sortMeals(next.meals) });
        return {
          ok: true,
          profile: next.profile,
          message: `Imported ${next.meals.length} meal${next.meals.length === 1 ? '' : 's'}${dropped ? `; ${dropped} unreadable meal(s) skipped` : ''}.`,
        };
      },
      resetAll: () => setData(emptyData()),
    };
  }, [data, today, storageError, loadNotice, toast, showToast]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function undefinedIfMissing(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function useAppStore(): StoreValue {
  const v = useContext(StoreContext);
  if (!v) throw new Error('useAppStore must be used inside <AppStoreProvider>');
  return v;
}
