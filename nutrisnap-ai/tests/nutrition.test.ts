import { describe, expect, it } from 'vitest';
import type { Meal, MealItem, Nutrients } from '../src/models/types';
import {
  countUnknownFibre,
  dayTotals,
  isValidGrams,
  isValidPer100g,
  itemsTotals,
  macroEnergySplit,
  percentOf,
  scaleNutrients,
  sumNutrients,
} from '../src/utils/nutrition';

const rice: Nutrients = { kcal: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fibre: 0.4 };
const curry: Nutrients = { kcal: 153, protein: 14, carbs: 4, fat: 9, fibre: null };

const item = (per100g: Nutrients, grams: number): MealItem => ({
  id: Math.random().toString(),
  foodId: null,
  name: 'x',
  grams,
  per100g,
  source: 'reference',
});

describe('scaleNutrients: per 100 g x grams / 100', () => {
  it('scales each nutrient separately', () => {
    const n = scaleNutrients(rice, 150);
    expect(n.kcal).toBeCloseTo(195, 6);
    expect(n.protein).toBeCloseTo(4.05, 6);
    expect(n.carbs).toBeCloseTo(42.3, 6);
    expect(n.fat).toBeCloseTo(0.45, 6);
    expect(n.fibre).toBeCloseTo(0.6, 6);
  });

  it('returns exactly the per-100 g values for 100 g', () => {
    expect(scaleNutrients(rice, 100)).toEqual(rice);
  });

  it('keeps unknown fibre unknown', () => {
    expect(scaleNutrients(curry, 200).fibre).toBeNull();
  });

  it('treats invalid or negative grams as zero instead of producing NaN', () => {
    expect(scaleNutrients(rice, Number.NaN).kcal).toBe(0);
    expect(scaleNutrients(rice, -50).protein).toBe(0);
  });
});

describe('meal totals', () => {
  it('adds items: 150 g rice + 150 g chicken curry', () => {
    const t = itemsTotals([item(rice, 150), item(curry, 150)]);
    expect(t.kcal).toBeCloseTo(195 + 229.5, 6);
    expect(t.protein).toBeCloseTo(4.05 + 21, 6);
    expect(t.carbs).toBeCloseTo(42.3 + 6, 6);
    expect(t.fat).toBeCloseTo(0.45 + 13.5, 6);
    // fibre: only the known part is added
    expect(t.fibre).toBeCloseTo(0.6, 6);
  });

  it('recalculates when a portion changes', () => {
    const before = itemsTotals([item(rice, 100)]);
    const after = itemsTotals([item(rice, 250)]);
    expect(after.kcal / before.kcal).toBeCloseTo(2.5, 6);
  });

  it('fibre total is null only when every item has unknown fibre', () => {
    expect(itemsTotals([item(curry, 100)]).fibre).toBeNull();
    expect(countUnknownFibre([item(curry, 100), item(rice, 100)])).toBe(1);
  });

  it('empty list sums to zero', () => {
    expect(sumNutrients([])).toEqual({ kcal: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 });
  });

  it('daily totals only include meals on that date', () => {
    const meal = (date: string, grams: number): Meal => ({
      id: date + grams,
      date,
      category: 'lunch',
      name: 'm',
      items: [item(rice, grams)],
      origin: 'manual',
      createdAt: '',
      updatedAt: '',
    });
    const meals = [meal('2026-10-13', 100), meal('2026-10-13', 200), meal('2026-10-12', 500)];
    expect(dayTotals(meals, '2026-10-13').kcal).toBeCloseTo(390, 6);
    expect(dayTotals(meals, '2026-10-11').kcal).toBe(0);
  });
});

describe('helpers', () => {
  it('macro energy split uses 4/4/9 kcal per gram', () => {
    const s = macroEnergySplit({ kcal: 0, protein: 25, carbs: 50, fat: 10, fibre: null });
    // 100 + 200 + 90 = 390
    expect(s.protein).toBeCloseTo(100 / 390, 6);
    expect(s.carbs).toBeCloseTo(200 / 390, 6);
    expect(s.fat).toBeCloseTo(90 / 390, 6);
    expect(macroEnergySplit({ kcal: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 })).toEqual({ protein: 0, carbs: 0, fat: 0 });
  });

  it('percentOf handles zero targets', () => {
    expect(percentOf(50, 100)).toBe(50);
    expect(percentOf(50, 0)).toBe(0);
  });

  it('validates grams and per-100 g values', () => {
    expect(isValidGrams(1)).toBe(true);
    expect(isValidGrams(3000)).toBe(true);
    expect(isValidGrams(0)).toBe(false);
    expect(isValidGrams(3001)).toBe(false);
    expect(isValidGrams(Number.NaN)).toBe(false);
    expect(isValidPer100g(rice)).toBe(true);
    expect(isValidPer100g({ ...rice, protein: 120 })).toBe(false);
    expect(isValidPer100g({ ...rice, kcal: Number.NaN })).toBe(false);
  });
});
