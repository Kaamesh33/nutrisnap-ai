import type { FoodReference, Meal, MealCategory, MealItem, MealOrigin, Nutrients } from '../models/types';
import { newId } from './id';
import { isValidGrams, isValidPer100g } from './nutrition';

export function itemFromFood(food: FoodReference, grams: number = food.servingG): MealItem {
  return {
    id: newId(),
    foodId: food.id,
    name: food.name,
    grams,
    per100g: { ...food.per100g },
    source: 'reference',
  };
}

export function customItem(name: string, grams: number, per100g: Nutrients): MealItem {
  return { id: newId(), foodId: null, name, grams, per100g: { ...per100g }, source: 'user' };
}

/** A sensible default category based on the time of day. */
export function categoryForTime(now: Date = new Date()): MealCategory {
  const h = now.getHours();
  if (h < 11) return 'breakfast';
  if (h < 16) return 'lunch';
  if (h < 18) return 'snacks';
  return 'dinner';
}

export interface MealDraft {
  id: string | null;
  date: string;
  category: MealCategory;
  name: string;
  items: MealItem[];
  origin: MealOrigin;
}

export function draftFromMeal(meal: Meal): MealDraft {
  return {
    id: meal.id,
    date: meal.date,
    category: meal.category,
    name: meal.name,
    items: meal.items.map((i) => ({ ...i, per100g: { ...i.per100g } })),
    origin: meal.origin,
  };
}

/** Returns human-readable problems; an empty list means the draft can be saved. */
export function draftProblems(d: MealDraft): string[] {
  const problems: string[] = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) problems.push('Choose a date.');
  if (d.items.length === 0) problems.push('Add at least one food.');
  d.items.forEach((item, idx) => {
    const label = item.name.trim() || `Food ${idx + 1}`;
    if (!item.name.trim()) problems.push(`Food ${idx + 1} needs a name.`);
    if (!isValidGrams(item.grams)) problems.push(`${label}: enter a serving between 1 and 3000 g.`);
    if (!isValidPer100g(item.per100g)) problems.push(`${label}: check the nutrition values per 100 g.`);
  });
  return problems;
}

export function defaultMealName(d: MealDraft): string {
  if (d.name.trim()) return d.name.trim();
  const names = d.items.map((i) => i.name.split(/[,(/]/)[0].trim()).filter(Boolean);
  if (names.length === 0) return 'Meal';
  if (names.length <= 2) return names.join(' and ');
  return `${names.slice(0, 2).join(', ')} and ${names.length - 2} more`;
}

export function mealFromDraft(d: MealDraft, existing?: Meal): Meal {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? d.id ?? newId(),
    date: d.date,
    category: d.category,
    name: defaultMealName(d),
    items: d.items.map((i) => ({ ...i, name: i.name.trim(), per100g: { ...i.per100g } })),
    origin: d.origin,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}
