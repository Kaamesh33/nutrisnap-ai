import type { Meal, MealItem, Nutrients } from '../models/types';

/**
 * DETERMINISTIC NUTRITION ARITHMETIC
 * Nutrient amount = nutrient amount per 100 g x serving size in grams / 100
 * Each nutrient is calculated separately and items are summed for totals.
 * No AI or guessing happens here.
 */

export const ZERO: Nutrients = { kcal: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 };

/** Scales per-100 g values to a serving of `grams`. Unknown fibre stays unknown. */
export function scaleNutrients(per100g: Nutrients, grams: number): Nutrients {
  const g = Number.isFinite(grams) && grams > 0 ? grams : 0;
  const factor = g / 100;
  return {
    kcal: per100g.kcal * factor,
    protein: per100g.protein * factor,
    carbs: per100g.carbs * factor,
    fat: per100g.fat * factor,
    fibre: per100g.fibre === null ? null : per100g.fibre * factor,
  };
}

export function itemNutrients(item: MealItem): Nutrients {
  return scaleNutrients(item.per100g, item.grams);
}

/**
 * Adds several nutrient amounts together.
 * Fibre: unknown values are skipped; the total is null only if every value is unknown.
 */
export function sumNutrients(list: Nutrients[]): Nutrients {
  let fibreKnown = false;
  const total = list.reduce<Nutrients>(
    (acc, n) => {
      if (n.fibre !== null) fibreKnown = true;
      return {
        kcal: acc.kcal + n.kcal,
        protein: acc.protein + n.protein,
        carbs: acc.carbs + n.carbs,
        fat: acc.fat + n.fat,
        fibre: (acc.fibre ?? 0) + (n.fibre ?? 0),
      };
    },
    { ...ZERO },
  );
  return { ...total, fibre: list.length === 0 ? 0 : fibreKnown ? total.fibre : null };
}

export function itemsTotals(items: MealItem[]): Nutrients {
  return sumNutrients(items.map(itemNutrients));
}

export function mealTotals(meal: Meal): Nutrients {
  return itemsTotals(meal.items);
}

/** Number of items whose fibre is unknown (so the fibre total is partial). */
export function countUnknownFibre(items: MealItem[]): number {
  return items.filter((i) => i.per100g.fibre === null).length;
}

export function mealsForDate(meals: Meal[], date: string): Meal[] {
  return meals.filter((m) => m.date === date);
}

export function dayTotals(meals: Meal[], date: string): Nutrients {
  return sumNutrients(mealsForDate(meals, date).map(mealTotals));
}

/** Share of energy from protein, carbs and fat (4/4/9 kcal per gram), as fractions. */
export function macroEnergySplit(n: Nutrients): { protein: number; carbs: number; fat: number } {
  const p = n.protein * 4;
  const c = n.carbs * 4;
  const f = n.fat * 9;
  const sum = p + c + f;
  if (sum <= 0) return { protein: 0, carbs: 0, fat: 0 };
  return { protein: p / sum, carbs: c / sum, fat: f / sum };
}

/** Percentage of a target reached (0 when the target is missing or zero). */
export function percentOf(value: number, target: number): number {
  if (!Number.isFinite(target) || target <= 0) return 0;
  return (value / target) * 100;
}

export const GRAMS_MIN = 1;
export const GRAMS_MAX = 3000;

export function isValidGrams(grams: number): boolean {
  return Number.isFinite(grams) && grams >= GRAMS_MIN && grams <= GRAMS_MAX;
}

export function isValidPer100g(n: Nutrients): boolean {
  const ok = (v: number, max: number) => Number.isFinite(v) && v >= 0 && v <= max;
  return (
    ok(n.kcal, 950) &&
    ok(n.protein, 100) &&
    ok(n.carbs, 100) &&
    ok(n.fat, 100) &&
    (n.fibre === null || ok(n.fibre, 100))
  );
}
