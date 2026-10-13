import { FOODS } from '../data/foods';
import type { FoodReference } from '../models/types';

/**
 * Food lookup over the bundled reference list.
 * Later this module is the place to add a USDA FoodData Central lookup
 * (via your own backend, because it needs an API key).
 */

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export function getFoodById(id: string): FoodReference | undefined {
  return FOODS.find((f) => f.id === id);
}

function score(food: FoodReference, q: string): number {
  const name = normalise(food.name);
  const aliases = food.aliases.map(normalise);
  if (name === q || aliases.includes(q)) return 100;
  if (name.startsWith(q)) return 80;
  if (aliases.some((a) => a.startsWith(q))) return 70;
  if (name.split(' ').some((w) => w.startsWith(q))) return 60;
  if (name.includes(q)) return 50;
  if (aliases.some((a) => a.includes(q))) return 40;
  const words = q.split(' ');
  if (words.length > 1 && words.every((w) => name.includes(w) || aliases.some((a) => a.includes(w)))) return 30;
  return 0;
}

/** Search by name or alias. An empty query returns nothing. */
export function searchFoods(query: string, limit = 12): FoodReference[] {
  const q = normalise(query);
  if (!q) return [];
  return FOODS.map((f) => ({ f, s: score(f, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.f.name.localeCompare(b.f.name))
    .slice(0, limit)
    .map((x) => x.f);
}

/** Best single match for a name (used to map AI-detected names to the list). */
export function bestMatch(name: string): FoodReference | undefined {
  const q = normalise(name);
  if (!q) return undefined;
  const direct = searchFoods(q, 1)[0];
  if (direct) return direct;
  // Try each word on its own, longest first, e.g. "spicy chicken curry".
  const words = q.split(' ').filter((w) => w.length > 2).sort((a, b) => b.length - a.length);
  for (const w of words) {
    const hit = searchFoods(w, 1)[0];
    if (hit) return hit;
  }
  return undefined;
}

export const QUICK_PICKS = ['idli', 'dosa-plain', 'chapati', 'rice-white', 'dal-toor', 'sambar', 'egg-boiled', 'chicken-curry', 'curd', 'banana'];
