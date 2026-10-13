import { describe, expect, it } from 'vitest';
import { FOODS } from '../src/data/foods';
import { bestMatch, getFoodById, QUICK_PICKS, searchFoods } from '../src/services/foodDatabase';
import { isValidPer100g } from '../src/utils/nutrition';

describe('food reference list', () => {
  it('has unique ids', () => {
    const ids = FOODS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every food has valid per-100 g values and a positive serving', () => {
    for (const f of FOODS) {
      expect(isValidPer100g(f.per100g), f.id).toBe(true);
      expect(f.servingG, f.id).toBeGreaterThan(0);
      expect(f.per100g.protein + f.per100g.carbs + f.per100g.fat, f.id).toBeLessThanOrEqual(101);
    }
  });

  it('calories roughly agree with 4/4/9 kcal per gram (catches typos)', () => {
    for (const f of FOODS) {
      const n = f.per100g;
      const total = 4 * n.protein + 4 * n.carbs + 9 * n.fat;
      const net = 4 * n.protein + 4 * (n.carbs - (n.fibre ?? 0)) + 9 * n.fat;
      const dev = Math.min(Math.abs(total - n.kcal), Math.abs(net - n.kcal)) / n.kcal;
      expect(dev, `${f.id}: listed ${n.kcal}, 4/4/9 gives ${total.toFixed(0)} (net ${net.toFixed(0)})`).toBeLessThan(0.15);
    }
  });

  it('covers the required Indian foods', () => {
    for (const q of ['rice', 'idli', 'dosa', 'chapati', 'egg', 'chicken curry', 'dal', 'sambar', 'milk', 'curd', 'biryani', 'banana', 'samosa']) {
      expect(searchFoods(q).length, q).toBeGreaterThan(0);
    }
  });

  it('quick picks all exist', () => {
    for (const id of QUICK_PICKS) expect(getFoodById(id), id).toBeDefined();
  });
});

describe('search', () => {
  it('finds by alias', () => {
    expect(searchFoods('roti')[0].id).toBe('chapati');
    expect(searchFoods('dahi')[0].id).toBe('curd');
    expect(searchFoods('chai')[0].id).toBe('tea-milk');
  });

  it('ranks exact names first and ignores case', () => {
    expect(searchFoods('IDLI')[0].id).toBe('idli');
  });

  it('returns nothing for an empty query', () => {
    expect(searchFoods('   ')).toEqual([]);
  });

  it('bestMatch maps free text from an AI service', () => {
    expect(bestMatch('Chicken Curry')?.id).toBe('chicken-curry');
    expect(bestMatch('spicy sambar')?.id).toBe('sambar');
    expect(bestMatch('zzzz')).toBeUndefined();
  });
});
