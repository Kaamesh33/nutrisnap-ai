import { describe, expect, it } from 'vitest';
import { getFoodById } from '../src/services/foodDatabase';
import { categoryForTime, defaultMealName, draftProblems, itemFromFood, mealFromDraft, type MealDraft } from '../src/utils/meals';

const idli = getFoodById('idli')!;
const draft = (over: Partial<MealDraft> = {}): MealDraft => ({
  id: null,
  date: '2026-10-13',
  category: 'breakfast',
  name: '',
  items: [itemFromFood(idli, 120)],
  origin: 'manual',
  ...over,
});

describe('meal drafts', () => {
  it('items from the food list are marked as reference data', () => {
    const it1 = itemFromFood(idli);
    expect(it1.source).toBe('reference');
    expect(it1.grams).toBe(idli.servingG);
    // copy, not shared object
    it1.per100g.kcal = 1;
    expect(idli.per100g.kcal).not.toBe(1);
  });

  it('requires at least one valid food', () => {
    expect(draftProblems(draft())).toEqual([]);
    expect(draftProblems(draft({ items: [] }))).toContain('Add at least one food.');
    const bad = draft();
    bad.items[0].grams = 0;
    expect(draftProblems(bad).join(' ')).toMatch(/1 and 3000/);
  });

  it('names an unnamed meal after its foods', () => {
    expect(defaultMealName(draft())).toBe('Idli');
    expect(defaultMealName(draft({ name: '  Sunday breakfast ' }))).toBe('Sunday breakfast');
  });

  it('keeps id and createdAt when editing', () => {
    const first = mealFromDraft(draft());
    const edited = mealFromDraft({ ...draft(), id: first.id }, first);
    expect(edited.id).toBe(first.id);
    expect(edited.createdAt).toBe(first.createdAt);
  });

  it('suggests a category by time of day', () => {
    expect(categoryForTime(new Date(2026, 9, 13, 8))).toBe('breakfast');
    expect(categoryForTime(new Date(2026, 9, 13, 13))).toBe('lunch');
    expect(categoryForTime(new Date(2026, 9, 13, 17))).toBe('snacks');
    expect(categoryForTime(new Date(2026, 9, 13, 20))).toBe('dinner');
  });
});
