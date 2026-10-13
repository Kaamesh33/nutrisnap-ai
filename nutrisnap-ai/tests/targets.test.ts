import { describe, expect, it } from 'vitest';
import { profileProblems, proteinPerKg, restingEnergy, suggestTargets, targetsProblems } from '../src/utils/targets';

describe('Mifflin-St Jeor resting energy', () => {
  it('matches hand calculation', () => {
    // male: 10*70 + 6.25*175 - 5*30 + 5 = 700 + 1093.75 - 150 + 5 = 1648.75
    expect(restingEnergy('male', 70, 175, 30)).toBeCloseTo(1648.75, 6);
    // female: 10*60 + 6.25*160 - 5*30 - 161 = 600 + 1000 - 150 - 161 = 1289
    expect(restingEnergy('female', 60, 160, 30)).toBeCloseTo(1289, 6);
  });
});

describe('suggestTargets', () => {
  const base = { age: 30, sex: 'male' as const, heightCm: 175, weightKg: 70, activity: 'moderate' as const };

  it('maintenance: activity factor, protein by weight, fat 25%, carbs fill the rest', () => {
    const s = suggestTargets({ ...base, goal: 'maintenance' });
    expect(s).not.toBeNull();
    const t = s!.targets;
    // 1648.75 * 1.55 = 2555.6 -> 2560
    expect(t.kcal).toBe(2560);
    expect(t.protein).toBe(Math.round(70 * 1.2));
    expect(t.fat).toBe(Math.round((2560 * 0.25) / 9));
    expect(t.carbs).toBe(Math.round((2560 - t.protein * 4 - t.fat * 9) / 4));
    expect(t.fibre).toBe(Math.round(2.56 * 14));
  });

  it('protein is not one universal number', () => {
    expect(proteinPerKg('muscle-gain', 'light')).toBeGreaterThan(proteinPerKg('maintenance', 'light'));
    const a = suggestTargets({ ...base, weightKg: 55, goal: 'maintenance' })!.targets.protein;
    const b = suggestTargets({ ...base, weightKg: 90, goal: 'maintenance' })!.targets.protein;
    expect(a).not.toBe(b);
  });

  it('fat loss lowers and muscle gain raises calories', () => {
    const m = suggestTargets({ ...base, goal: 'maintenance' })!.targets.kcal;
    expect(suggestTargets({ ...base, goal: 'fat-loss' })!.targets.kcal).toBeLessThan(m);
    expect(suggestTargets({ ...base, goal: 'muscle-gain' })!.targets.kcal).toBeGreaterThan(m);
  });

  it('warns below 1200 kcal', () => {
    const s = suggestTargets({ age: 70, sex: 'female', heightCm: 145, weightKg: 40, activity: 'sedentary', goal: 'fat-loss' });
    expect(s!.targets.kcal).toBeLessThan(1200);
    expect(s!.warnings.length).toBeGreaterThan(0);
  });

  it('returns null and explains missing inputs', () => {
    const p = { age: null, sex: null, heightCm: null, weightKg: null, activity: 'light' as const, goal: 'maintenance' as const };
    expect(suggestTargets(p)).toBeNull();
    expect(profileProblems(p)).toHaveLength(4);
  });

  it('validates edited targets', () => {
    expect(targetsProblems({ kcal: 2000, protein: 80, carbs: 250, fat: 60, fibre: 25 })).toEqual([]);
    expect(targetsProblems({ kcal: Number.NaN, protein: 5, carbs: 250, fat: 60, fibre: 25 })).toHaveLength(2);
  });
});
