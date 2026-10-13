import type { ActivityLevel, Goal, Profile, Sex, Targets } from '../models/types';

/**
 * TARGET ESTIMATES (not medical advice)
 * Energy: Mifflin-St Jeor resting energy x activity factor, adjusted for goal.
 * Protein: grams per kg body weight, chosen by goal and activity.
 * Fat: 25% of energy. Carbohydrate: the remaining energy. Fibre: 14 g per 1000 kcal.
 * Every result is a starting point the person can edit.
 */

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  'very-active': 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Mostly sitting, little exercise',
  light: 'Light exercise 1 to 3 days a week',
  moderate: 'Moderate exercise 3 to 5 days a week',
  active: 'Hard exercise 6 to 7 days a week',
  'very-active': 'Physical job plus hard training',
};

export const GOAL_LABELS: Record<Goal, string> = {
  'fat-loss': 'Fat loss',
  maintenance: 'Maintenance',
  'muscle-gain': 'Muscle gain',
};

const GOAL_ENERGY_FACTOR: Record<Goal, number> = {
  'fat-loss': 0.8,
  maintenance: 1,
  'muscle-gain': 1.1,
};

export function proteinPerKg(goal: Goal, activity: ActivityLevel): number {
  if (goal === 'muscle-gain') return 1.8;
  if (goal === 'fat-loss') return 1.6;
  return activity === 'moderate' || activity === 'active' || activity === 'very-active' ? 1.2 : 1.0;
}

export function restingEnergy(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export interface TargetSuggestion {
  targets: Targets;
  restingKcal: number;
  maintenanceKcal: number;
  proteinGPerKg: number;
  warnings: string[];
}

export type ProfileInputs = Pick<Profile, 'age' | 'sex' | 'heightCm' | 'weightKg' | 'activity' | 'goal'>;

/** Returns a list of what is missing or out of range; empty means ready. */
export function profileProblems(p: ProfileInputs): string[] {
  const problems: string[] = [];
  if (p.age === null || !(p.age >= 18 && p.age <= 100)) problems.push('Enter an age between 18 and 100.');
  if (p.sex === null) problems.push('Choose the sex used in the energy formula.');
  if (p.heightCm === null || !(p.heightCm >= 120 && p.heightCm <= 230)) problems.push('Enter a height between 120 and 230 cm.');
  if (p.weightKg === null || !(p.weightKg >= 30 && p.weightKg <= 250)) problems.push('Enter a weight between 30 and 250 kg.');
  return problems;
}

const roundTo = (v: number, step: number) => Math.round(v / step) * step;

export function suggestTargets(p: ProfileInputs): TargetSuggestion | null {
  if (profileProblems(p).length > 0) return null;
  const age = p.age as number;
  const sex = p.sex as Sex;
  const heightCm = p.heightCm as number;
  const weightKg = p.weightKg as number;

  const resting = restingEnergy(sex, weightKg, heightCm, age);
  const maintenance = resting * ACTIVITY_FACTORS[p.activity];
  const kcal = roundTo(maintenance * GOAL_ENERGY_FACTOR[p.goal], 10);

  const gPerKg = proteinPerKg(p.goal, p.activity);
  const protein = Math.round(weightKg * gPerKg);
  const fat = Math.round((kcal * 0.25) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  const fibre = Math.round((kcal / 1000) * 14);

  const warnings: string[] = [];
  if (kcal < 1200) {
    warnings.push('This estimate is below 1,200 kcal a day. Please talk to a doctor or registered dietitian before eating this little.');
  }
  if (weightKg / (heightCm / 100) ** 2 >= 30) {
    warnings.push('Protein is based on total body weight, which can overstate needs at higher body weights. A dietitian can personalise this.');
  }

  return {
    targets: { kcal, protein, carbs, fat, fibre },
    restingKcal: Math.round(resting),
    maintenanceKcal: Math.round(maintenance),
    proteinGPerKg: gPerKg,
    warnings,
  };
}

export function targetsProblems(t: Targets): string[] {
  const problems: string[] = [];
  const check = (v: number, min: number, max: number, label: string) => {
    if (!Number.isFinite(v) || v < min || v > max) problems.push(`${label} must be between ${min} and ${max}.`);
  };
  check(t.kcal, 800, 6000, 'Calories');
  check(t.protein, 10, 400, 'Protein');
  check(t.carbs, 0, 900, 'Carbohydrates');
  check(t.fat, 10, 300, 'Fat');
  check(t.fibre, 0, 100, 'Fibre');
  return problems;
}
