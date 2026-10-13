import type { Profile, Targets } from './types';

/**
 * Placeholder targets used only until the person sets up their profile.
 * They are NOT a recommendation for anyone; the dashboard shows a banner
 * asking the person to personalise them.
 */
export const PLACEHOLDER_TARGETS: Targets = {
  kcal: 2000,
  protein: 75,
  carbs: 250,
  fat: 65,
  fibre: 25,
};

export const DEFAULT_PROFILE: Profile = {
  name: '',
  age: null,
  sex: null,
  heightCm: null,
  weightKg: null,
  activity: 'light',
  goal: 'maintenance',
  targets: { ...PLACEHOLDER_TARGETS },
  isPersonalised: false,
};
