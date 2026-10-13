import { FOODS } from '../data/foods';
import type { Meal, Profile } from '../models/types';
import { MEAL_CATEGORY_LABELS } from '../models/types';
import { addDays, formatDayLong, lastNDays } from '../utils/dates';
import { fmtGrams, fmtKcal } from '../utils/format';
import { dayTotals, mealTotals, mealsForDate, percentOf } from '../utils/nutrition';

/**
 * RULE-BASED NUTRITION COACH
 * This is not an AI chatbot. It recognises a few kinds of question with
 * simple keyword rules and answers from the person's saved diary and the
 * food list, using the same arithmetic as the rest of the app.
 * A real language model can be connected later through your own backend.
 */

export interface CoachContext {
  meals: Meal[];
  profile: Profile;
  today: string;
}

export interface CoachAnswer {
  intent: Intent;
  paragraphs: string[];
}

export type Intent =
  | 'help'
  | 'suggest-protein'
  | 'weekly-summary'
  | 'calories-remaining'
  | 'calories-eaten'
  | 'protein'
  | 'carbs'
  | 'fat'
  | 'fibre'
  | 'meals-eaten';

export const EXAMPLE_QUESTIONS = [
  'How much protein have I eaten today?',
  'How many calories remain?',
  'What can I eat to reach my protein target?',
  'Summarise my weekly nutrition.',
];

export function detectIntent(question: string): Intent {
  const q = question.toLowerCase();
  const has = (re: RegExp) => re.test(q);
  if (has(/(what (can|should|could) i eat|\bsuggest|\brecommend|\bideas?\b|\breach\b|\bhit\b|\bmeet\b|more protein|high.?protein)/)) return 'suggest-protein';
  if (has(/(week|weekly|7 days|seven days|last few days)/)) return 'weekly-summary';
  if (has(/(calorie|kcal|energy)/) && has(/(left|remain|more|budget|still)/)) return 'calories-remaining';
  if (has(/protein/)) return 'protein';
  if (has(/(carb|carbohydrate)/)) return 'carbs';
  if (has(/\bfat\b|fats/)) return 'fat';
  if (has(/(fibre|fiber)/)) return 'fibre';
  if (has(/(calorie|kcal|energy)/)) return 'calories-eaten';
  if (has(/(what did i eat|what have i eaten|meals|logged|ate|eaten)/)) return 'meals-eaten';
  return 'help';
}

/** Detects "yesterday" so "how much protein yesterday?" works too. */
function targetDay(question: string, today: string): { date: string; label: string } {
  if (/yesterday/i.test(question)) return { date: addDays(today, -1), label: 'yesterday' };
  return { date: today, label: 'today' };
}

export function answerQuestion(question: string, ctx: CoachContext): CoachAnswer {
  const intent = detectIntent(question);
  const { date, label } = targetDay(question, ctx.today);
  const t = ctx.profile.targets;
  const totals = dayTotals(ctx.meals, date);
  const dayMeals = mealsForDate(ctx.meals, date);
  const nothingLogged = dayMeals.length === 0;
  const noLogNote = `You have not logged any meals ${label} yet, so these numbers are zero.`;
  const p: string[] = [];

  switch (intent) {
    case 'protein': {
      p.push(`You have eaten ${fmtGrams(totals.protein)} g of protein ${label}, which is ${Math.round(percentOf(totals.protein, t.protein))}% of your ${t.protein} g target.`);
      const left = t.protein - totals.protein;
      p.push(left > 0 ? `${fmtGrams(left)} g to go. Ask "What can I eat to reach my protein target?" for ideas.` : 'You have reached your protein target.');
      if (nothingLogged) p.push(noLogNote);
      break;
    }
    case 'calories-eaten':
    case 'calories-remaining': {
      const left = t.kcal - totals.kcal;
      if (intent === 'calories-eaten') p.push(`You have eaten ${fmtKcal(totals.kcal)} kcal ${label}.`);
      p.push(
        left >= 0
          ? `${fmtKcal(left)} kcal remain of your ${fmtKcal(t.kcal)} kcal target.`
          : `You are ${fmtKcal(-left)} kcal over your ${fmtKcal(t.kcal)} kcal target.`,
      );
      if (nothingLogged) p.push(noLogNote);
      break;
    }
    case 'carbs':
      p.push(`You have eaten ${fmtGrams(totals.carbs)} g of carbohydrate ${label}, against a target of ${t.carbs} g.`);
      if (nothingLogged) p.push(noLogNote);
      break;
    case 'fat':
      p.push(`You have eaten ${fmtGrams(totals.fat)} g of fat ${label}, against a target of ${t.fat} g.`);
      if (nothingLogged) p.push(noLogNote);
      break;
    case 'fibre':
      p.push(
        totals.fibre === null
          ? `Fibre is unknown for the foods logged ${label}.`
          : `You have eaten ${fmtGrams(totals.fibre)} g of fibre ${label}, against a target of ${t.fibre} g. Fruit, dal, sprouts and vegetables are good sources.`,
      );
      if (nothingLogged) p.push(noLogNote);
      break;
    case 'meals-eaten':
      if (nothingLogged) {
        p.push(`No meals logged ${label}. Use Scan food to add one.`);
      } else {
        p.push(`You logged ${dayMeals.length} meal${dayMeals.length === 1 ? '' : 's'} ${label}:`);
        dayMeals.forEach((m) => {
          const n = mealTotals(m);
          p.push(`${MEAL_CATEGORY_LABELS[m.category]}: ${m.name}, ${fmtKcal(n.kcal)} kcal and ${fmtGrams(n.protein)} g protein.`);
        });
      }
      break;
    case 'suggest-protein':
      p.push(...proteinSuggestions(ctx));
      break;
    case 'weekly-summary':
      p.push(...weeklySummary(ctx));
      break;
    default:
      p.push('I can answer questions about the meals you have logged. Try one of these:');
      p.push(...EXAMPLE_QUESTIONS);
  }
  return { intent, paragraphs: p };
}

function proteinSuggestions(ctx: CoachContext): string[] {
  const t = ctx.profile.targets;
  const totals = dayTotals(ctx.meals, ctx.today);
  const proteinLeft = t.protein - totals.protein;
  const kcalLeft = t.kcal - totals.kcal;
  if (proteinLeft <= 0) return [`You have already reached today's protein target of ${t.protein} g.`];

  const candidates = FOODS.map((f) => {
    const g = f.servingG;
    const protein = (f.per100g.protein * g) / 100;
    const kcal = (f.per100g.kcal * g) / 100;
    return { f, protein, kcal, density: kcal > 0 ? protein / kcal : 0 };
  })
    .filter((c) => c.protein >= 5 && c.density >= 0.05 && c.f.id !== 'whey')
    .filter((c) => (kcalLeft > 200 ? c.kcal <= kcalLeft : c.kcal <= 200))
    .sort((a, b) => b.density - a.density)
    .slice(0, 5);

  const out = [`You need about ${fmtGrams(proteinLeft)} g more protein today, with ${fmtKcal(Math.max(0, kcalLeft))} kcal left in your target.`];
  if (candidates.length === 0) {
    out.push('None of the foods in the list fit your remaining calories. Consider adjusting tomorrow\'s meals instead.');
    return out;
  }
  out.push('Foods from the list that give a lot of protein for their calories:');
  candidates.forEach((c) => {
    out.push(`${c.f.name}, ${c.f.servingLabel} (${c.f.servingG} g): about ${fmtGrams(c.protein)} g protein and ${fmtKcal(c.kcal)} kcal.`);
  });
  if (kcalLeft <= 200) out.push('Your calories for today are nearly used up, so only lighter options are shown.');
  out.push('These figures come from the approximate food list, not from a dietitian.');
  return out;
}

function weeklySummary(ctx: CoachContext): string[] {
  const t = ctx.profile.targets;
  const days = lastNDays(ctx.today, 7);
  const logged = days.filter((d) => mealsForDate(ctx.meals, d).length > 0);
  if (logged.length === 0) return ['No meals were logged in the last 7 days, so there is nothing to summarise yet.'];
  const totals = logged.map((d) => ({ d, n: dayTotals(ctx.meals, d) }));
  const avg = (k: 'kcal' | 'protein' | 'carbs' | 'fat') => totals.reduce((s, x) => s + x.n[k], 0) / totals.length;
  const avgKcal = avg('kcal');
  const avgProtein = avg('protein');
  const proteinDays = totals.filter((x) => x.n.protein >= t.protein * 0.9).length;
  const best = totals.reduce((a, b) => (b.n.protein > a.n.protein ? b : a));
  return [
    `You logged meals on ${logged.length} of the last 7 days. Averages below use only those days.`,
    `Average energy: ${fmtKcal(avgKcal)} kcal a day (${Math.round(percentOf(avgKcal, t.kcal))}% of target).`,
    `Average protein: ${fmtGrams(avgProtein)} g a day (${Math.round(percentOf(avgProtein, t.protein))}% of target).`,
    `Average carbohydrate ${fmtGrams(avg('carbs'))} g and fat ${fmtGrams(avg('fat'))} g a day.`,
    `You reached at least 90% of your protein target on ${proteinDays} of ${logged.length} logged days. Your highest protein day was ${formatDayLong(best.d)} with ${fmtGrams(best.n.protein)} g.`,
  ];
}
