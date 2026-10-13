import { useState } from 'react';
import { BarChart, LineChart, MacroSplit } from '../components/Charts';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { MacroBar } from '../components/MacroBar';
import { useAppStore } from '../hooks/useAppStore';
import { href } from '../hooks/useHashRoute';
import { addDays, formatDayMonth, formatDayShort, lastNDays, startOfWeek } from '../utils/dates';
import { fmtGrams, fmtKcal } from '../utils/format';
import { dayTotals, macroEnergySplit, mealsForDate, sumNutrients } from '../utils/nutrition';

export function ProgressPage() {
  const { meals, profile, today } = useAppStore();
  const [weeksBack, setWeeksBack] = useState(0);
  const t = profile.targets;

  if (meals.length === 0) {
    return (
      <div className="page">
        <header className="page__header">
          <h1 className="page__title">Progress</h1>
        </header>
        <EmptyState
          title="No meals to chart yet"
          action={
            <>
              <a className="btn btn--primary" href={href('scan')}>
                Log a meal
              </a>
              <a className="btn btn--ghost" href={href('profile')}>
                Load the demo diary
              </a>
            </>
          }
        >
          Charts appear once you log meals.
        </EmptyState>
      </div>
    );
  }

  const end = addDays(today, -7 * weeksBack);
  const days = lastNDays(end, 7);
  const perDay = days.map((d) => ({ d, n: dayTotals(meals, d), logged: mealsForDate(meals, d).length > 0 }));
  const logged = perDay.filter((x) => x.logged);
  const avg = (k: 'kcal' | 'protein' | 'carbs' | 'fat') => (logged.length ? logged.reduce((s, x) => s + x.n[k], 0) / logged.length : 0);
  const avgFibre = logged.length ? logged.reduce((s, x) => s + (x.n.fibre ?? 0), 0) / logged.length : 0;
  const weekTotal = sumNutrients(logged.map((x) => x.n));
  const proteinHitDays = logged.filter((x) => x.n.protein >= t.protein * 0.9).length;

  // 8-week trend: average per logged day for each Monday-to-Sunday week.
  const thisMonday = startOfWeek(today);
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(thisMonday, -7 * (7 - i)));
  const weekly = weeks.map((mon) => {
    const wd = lastNDays(addDays(mon, 6), 7).filter((d) => mealsForDate(meals, d).length > 0);
    if (wd.length === 0) return { mon, kcal: null, protein: null };
    const tot = wd.map((d) => dayTotals(meals, d));
    return {
      mon,
      kcal: tot.reduce((s, n) => s + n.kcal, 0) / wd.length,
      protein: tot.reduce((s, n) => s + n.protein, 0) / wd.length,
    };
  });
  const weekLabels = weekly.map((w) => formatDayMonth(w.mon));

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Progress</h1>
        <p className="page__lead">Built from the meals saved in this browser.</p>
      </header>

      <div className="datebar">
        <button type="button" className="icon-btn icon-btn--soft" onClick={() => setWeeksBack((w) => w + 1)} aria-label="Previous 7 days">
          <Icon name="chevron-left" />
        </button>
        <div className="datebar__center">
          <span className="datebar__label">
            {formatDayMonth(days[0])} to {formatDayMonth(days[6])}
          </span>
          <span className="datebar__sub">{weeksBack === 0 ? 'Last 7 days' : `${weeksBack} week${weeksBack > 1 ? 's' : ''} earlier`}</span>
        </div>
        <button
          type="button"
          className="icon-btn icon-btn--soft"
          onClick={() => setWeeksBack((w) => Math.max(0, w - 1))}
          disabled={weeksBack === 0}
          aria-label="Next 7 days"
        >
          <Icon name="chevron-right" />
        </button>
      </div>

      <section className="stats" aria-label="Averages">
        <div className="stat">
          <span className="stat__value">{fmtKcal(avg('kcal'))}</span>
          <span className="stat__label">kcal a day on average</span>
        </div>
        <div className="stat">
          <span className="stat__value">{fmtGrams(avg('protein'))} g</span>
          <span className="stat__label">protein a day on average</span>
        </div>
        <div className="stat">
          <span className="stat__value">
            {proteinHitDays} of {logged.length}
          </span>
          <span className="stat__label">logged days at 90%+ of protein target</span>
        </div>
      </section>
      <p className="field__hint">
        Averages use the {logged.length} day{logged.length === 1 ? '' : 's'} with meals logged, so skipped days do not
        pull them down.
      </p>

      <div className="grid-2">
        <section className="panel">
          <h2 className="panel__title">Daily calories</h2>
          <BarChart
            title="Daily calories for the selected 7 days"
            unit="kcal"
            tone="kcal"
            target={t.kcal}
            data={perDay.map((x) => ({ label: formatDayShort(x.d), value: x.n.kcal, detail: `${formatDayMonth(x.d)}: ${fmtKcal(x.n.kcal)} kcal` }))}
          />
        </section>
        <section className="panel">
          <h2 className="panel__title">Daily protein</h2>
          <BarChart
            title="Daily protein for the selected 7 days"
            unit="g"
            tone="protein"
            target={t.protein}
            data={perDay.map((x) => ({ label: formatDayShort(x.d), value: x.n.protein, detail: `${formatDayMonth(x.d)}: ${fmtGrams(x.n.protein)} g` }))}
          />
        </section>
      </div>

      <div className="grid-2">
        <section className="panel">
          <h2 className="panel__title">Target completion</h2>
          <p className="field__hint">Average logged day compared with your daily targets.</p>
          <div className="bars-grid bars-grid--single">
            <MacroBar label="Calories" value={avg('kcal')} target={t.kcal} unit="kcal" tone="kcal" />
            <MacroBar label="Protein" value={avg('protein')} target={t.protein} unit="g" tone="protein" />
            <MacroBar label="Carbohydrates" value={avg('carbs')} target={t.carbs} unit="g" tone="carbs" />
            <MacroBar label="Fat" value={avg('fat')} target={t.fat} unit="g" tone="fat" />
            <MacroBar label="Fibre" value={avgFibre} target={t.fibre} unit="g" tone="fibre" />
          </div>
        </section>
        <section className="panel">
          <h2 className="panel__title">Where your calories came from</h2>
          <p className="field__hint">Share of energy from protein, carbs and fat across these 7 days.</p>
          <MacroSplit split={macroEnergySplit(weekTotal)} />
        </section>
      </div>

      <div className="grid-2">
        <section className="panel">
          <h2 className="panel__title">Weekly calorie trend</h2>
          <p className="field__hint">Average per logged day, weeks starting Monday.</p>
          <LineChart title="Average daily calories per week, last 8 weeks" labels={weekLabels} series={{ name: 'Calories', tone: 'kcal', unit: 'kcal', values: weekly.map((w) => w.kcal) }} />
        </section>
        <section className="panel">
          <h2 className="panel__title">Weekly protein trend</h2>
          <p className="field__hint">Average per logged day, weeks starting Monday.</p>
          <LineChart title="Average daily protein per week, last 8 weeks" labels={weekLabels} series={{ name: 'Protein', tone: 'protein', unit: 'g', values: weekly.map((w) => w.protein) }} />
        </section>
      </div>
    </div>
  );
}
