/**
 * Core data types for NutriSnap AI.
 * Every nutrient value in this app is stored PER 100 GRAMS and scaled by
 * the serving weight with deterministic arithmetic (see utils/nutrition.ts).
 */

/** Nutrient amounts. kcal in kilocalories, everything else in grams. */
export interface Nutrients {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  /** null means "not known" (different from 0). */
  fibre: number | null;
}

/**
 * Where a food item's numbers came from. Shown as a badge on every item.
 * - reference:   approximate per-100 g values from the bundled food list
 * - user:        the person typed or changed the nutrition values
 * - ai-estimate: food name and grams suggested by a real AI service
 *                (nutrition still comes from the food list or the user)
 * - demo:        fixed sample data for trying the app; not real analysis
 */
export type DataSource = 'reference' | 'user' | 'ai-estimate' | 'demo';

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export const MEAL_CATEGORIES: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

export const MEAL_CATEGORY_LABELS: Record<MealCategory, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
};

export type FoodGroup =
  | 'staples'
  | 'breakfast'
  | 'dal-and-curry'
  | 'protein'
  | 'vegetables'
  | 'dairy'
  | 'fruit'
  | 'snacks'
  | 'sweets'
  | 'drinks'
  | 'fats-and-extras';

/** One entry in the bundled food reference list. */
export interface FoodReference {
  id: string;
  name: string;
  /** Other names people search for, e.g. "roti" for chapati. */
  aliases: string[];
  group: FoodGroup;
  per100g: Nutrients;
  /** A typical portion in grams, used as the default when added. */
  servingG: number;
  /** Human description of the typical portion, e.g. "1 medium idli". */
  servingLabel: string;
  /** Short note on where the approximate values come from. */
  basis: string;
}

/** One food inside a meal. */
export interface MealItem {
  id: string;
  /** Link to the food list, if the item came from it. */
  foodId: string | null;
  name: string;
  grams: number;
  per100g: Nutrients;
  source: DataSource;
  /** Optional free text, e.g. "AI confidence 62%". */
  note?: string;
}

/** How a meal was created. */
export type MealOrigin = 'manual' | 'demo' | 'ai';

export interface Meal {
  id: string;
  /** Local calendar date as YYYY-MM-DD. */
  date: string;
  category: MealCategory;
  name: string;
  items: MealItem[];
  origin: MealOrigin;
  createdAt: string;
  updatedAt: string;
}

export type Sex = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';

export type Goal = 'fat-loss' | 'maintenance' | 'muscle-gain';

export interface Targets {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
}

export interface Profile {
  name: string;
  age: number | null;
  sex: Sex | null;
  heightCm: number | null;
  weightKg: number | null;
  activity: ActivityLevel;
  goal: Goal;
  targets: Targets;
  /** False until the person saves their own profile or targets. */
  isPersonalised: boolean;
}

/** Everything saved in browser storage. */
export interface AppData {
  version: 1;
  meals: Meal[];
  profile: Profile;
}
