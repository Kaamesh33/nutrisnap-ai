import { describe, expect, it } from 'vitest';
import { DEFAULT_PROFILE } from '../src/models/defaults';
import type { Meal } from '../src/models/types';
import { answerQuestion, detectIntent } from '../src/services/coach';
import { getFoodById } from '../src/services/foodDatabase';
import { itemFromFood } from '../src/utils/meals';

const today = '2026-10-13';
const profile = { ...DEFAULT_PROFILE, targets: { kcal: 2000, protein: 100, carbs: 250, fat: 60, fibre: 28 } };
const meal: Meal = {
  id: 'm1',
  date: today,
  category: 'lunch',
  name: 'Chicken',
  items: [itemFromFood(getFoodById('chicken-breast')!, 100)], // 31 g protein, 165 kcal
  origin: 'manual',
  createdAt: '',
  updatedAt: '',
};

describe('rule-based coach', () => {
  it('recognises the example questions', () => {
    expect(detectIntent('How much protein have I eaten today?')).toBe('protein');
    expect(detectIntent('How many calories remain?')).toBe('calories-remaining');
    expect(detectIntent('What can I eat to reach my protein target?')).toBe('suggest-protein');
    expect(detectIntent('Summarise my weekly nutrition.')).toBe('weekly-summary');
    expect(detectIntent('Did I eat white rice?')).not.toBe('suggest-protein');
  });

  it('answers protein from saved data', () => {
    const a = answerQuestion('How much protein have I eaten today?', { meals: [meal], profile, today });
    expect(a.paragraphs[0]).toContain('31 g');
    expect(a.paragraphs[0]).toContain('31%');
    expect(a.paragraphs.join(' ')).toContain('69 g to go');
  });

  it('answers calories remaining', () => {
    const a = answerQuestion('How many calories remain?', { meals: [meal], profile, today });
    expect(a.paragraphs[0]).toContain('1,835');
  });

  it('suggests high-protein foods from the list', () => {
    const a = answerQuestion('What can I eat to reach my protein target?', { meals: [meal], profile, today });
    expect(a.paragraphs.length).toBeGreaterThan(2);
    expect(a.paragraphs.join(' ')).toMatch(/protein/);
  });

  it('weekly summary handles no data', () => {
    const a = answerQuestion('weekly summary', { meals: [], profile, today });
    expect(a.paragraphs[0]).toMatch(/No meals/);
  });

  it('falls back to help for unknown questions', () => {
    expect(answerQuestion('hello', { meals: [], profile, today }).intent).toBe('help');
  });
});
