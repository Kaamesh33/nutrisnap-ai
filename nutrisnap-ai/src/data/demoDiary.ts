import type { Meal, MealCategory, MealItem } from '../models/types';
import { addDays } from '../utils/dates';
import { newId } from '../utils/id';
import { getFoodById } from '../services/foodDatabase';

/**
 * Sample diary for trying the app: 7 days of typical meals.
 * Every meal has origin "demo" and every item has source "demo",
 * so demo data is labelled in the UI and can be removed in one step.
 */

type Plan = Array<[MealCategory, string, Array<[string, number]>]>;

const DAY_PLANS: Plan[] = [
  [
    ['breakfast', 'Idli and sambar', [['idli', 120], ['sambar', 150], ['coconut-chutney', 30]]],
    ['lunch', 'Rice, dal and sabzi', [['rice-white', 180], ['dal-toor', 150], ['cabbage-poriyal', 100], ['curd', 100]]],
    ['snacks', 'Tea and peanuts', [['tea-milk', 120], ['peanuts', 30]]],
    ['dinner', 'Chapati and chicken curry', [['chapati', 120], ['chicken-curry', 150]]],
  ],
  [
    ['breakfast', 'Poha and tea', [['poha', 180], ['tea-milk', 120]]],
    ['lunch', 'Rajma rice', [['rice-white', 180], ['rajma', 180], ['salad', 100]]],
    ['snacks', 'Banana', [['banana', 110]]],
    ['dinner', 'Roti with paneer', [['chapati', 80], ['palak-paneer', 150]]],
  ],
  [
    ['breakfast', 'Masala dosa', [['dosa-masala', 180], ['sambar', 100], ['coffee-milk', 120]]],
    ['lunch', 'Chicken biryani', [['chicken-biryani', 300], ['curd', 80]]],
    ['dinner', 'Curd rice', [['curd-rice', 220], ['egg-boiled', 50]]],
  ],
  [
    ['breakfast', 'Eggs and toast', [['egg-omelette', 140], ['bread-brown', 56], ['milk-toned', 200]]],
    ['lunch', 'Rice, sambar and fish fry', [['rice-white', 180], ['sambar', 150], ['fish-fry', 100]]],
    ['snacks', 'Samosa and tea', [['samosa', 60], ['tea-milk', 120]]],
    ['dinner', 'Khichdi', [['khichdi', 300], ['buttermilk', 200]]],
  ],
  [
    ['breakfast', 'Upma', [['upma', 200], ['coffee-milk', 120]]],
    ['lunch', 'Chole and rice', [['rice-white', 150], ['chana-masala', 180]]],
    ['snacks', 'Guava', [['guava', 100]]],
    ['dinner', 'Chapati, dal and bhindi', [['chapati', 120], ['dal-moong', 150], ['bhindi-fry', 100]]],
  ],
  [
    ['breakfast', 'Oats with milk', [['oats-dry', 50], ['milk-toned', 250], ['banana', 100]]],
    ['lunch', 'Rice and mutton curry', [['rice-white', 200], ['mutton-curry', 150]]],
    ['dinner', 'Dosa and chutney', [['dosa-plain', 160], ['coconut-chutney', 40], ['sambar', 100]]],
  ],
  [
    ['breakfast', 'Pongal', [['pongal', 220], ['coconut-chutney', 30]]],
    ['lunch', 'Veg biryani and raita', [['veg-biryani', 280], ['curd', 100]]],
    ['snacks', 'Sprouts', [['sprouts-moong', 120]]],
  ],
];

export function buildDemoMeals(today: string): Meal[] {
  const meals: Meal[] = [];
  const now = new Date().toISOString();
  DAY_PLANS.forEach((plan, idx) => {
    const date = addDays(today, -(DAY_PLANS.length - 1 - idx));
    for (const [category, name, foods] of plan) {
      const items: MealItem[] = foods.map(([id, grams]) => {
        const f = getFoodById(id);
        if (!f) throw new Error(`Demo food ${id} missing from food list`);
        return { id: newId(), foodId: f.id, name: f.name, grams, per100g: { ...f.per100g }, source: 'demo' };
      });
      meals.push({ id: newId(), date, category, name, items, origin: 'demo', createdAt: now, updatedAt: now });
    }
  });
  return meals;
}
