import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { MacroBar } from '../components/MacroBar';
import { MealCard } from '../components/MealCard';
import { useAppStore } from '../hooks/useAppStore';
import { href, navigate } from '../hooks/useHashRoute';
import { MEAL_CATEGORIES, MEAL_CATEGORY_LABELS } from '../models/types';
import { addDays, isDateKey, relativeDayName } from '../utils/dates';
import { fmtKcal } from '../utils/format';
import { dayTotals, mealTotals, mealsForDate, sumNutrients } from '../utils/nutrition';

export function DiaryPage({ dateParam }: { dateParam: string | null }) {
  const { meals, profile, today, deleteMeal, showToast } = useAppStore();
  const date = dateParam && isDateKey(dateParam) ? dateParam : today;
  const dayMeals = mealsForDate(meals, date);
  const totals = dayTotals(meals, date);
  const t = profile.targets;
  const go = (d: string) => navigate(`diary?date=${d}`);

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Food diary</h1>
      </header>

      <div className="datebar">
        <button type="button" className="icon-btn icon-btn--soft" onClick={() => go(addDays(date, -1))} aria-label="Previous day">
          <Icon name="chevron-left" />
        </button>
        <div className="datebar__center">
          <span className="datebar__label">{relativeDayName(date, today)}</span>
          <label className="sr-only" htmlFor="diary-date">
            Choose a date
          </label>
          <input id="diary-date" type="date" value={date} onChange={(e) => isDateKey(e.target.value) && go(e.target.value)} />
        </div>
        <button type="button" className="icon-btn icon-btn--soft" onClick={() => go(addDays(date, 1))} aria-label="Next day">
          <Icon name="chevron-right" />
        </button>
        {date !== today ? (
          <button type="button" className="btn btn--ghost" onClick={() => go(today)}>
            Today
          </button>
        ) : null}
      </div>

      <section className="panel panel--totals" aria-label="Daily totals">
        <h2 className="panel__title">Daily totals</h2>
        <div className="bars-grid">
          <MacroBar label="Calories" value={totals.kcal} target={t.kcal} unit="kcal" tone="kcal" showRemaining />
          <MacroBar label="Protein" value={totals.protein} target={t.protein} unit="g" tone="protein" showRemaining />
          <MacroBar label="Carbohydrates" value={totals.carbs} target={t.carbs} unit="g" tone="carbs" />
          <MacroBar label="Fat" value={totals.fat} target={t.fat} unit="g" tone="fat" />
          <MacroBar label="Fibre" value={totals.fibre} target={t.fibre} unit="g" tone="fibre" />
        </div>
      </section>

      {dayMeals.length === 0 ? (
        <EmptyState
          title={`No meals logged ${date === today ? 'today' : 'on this day'}`}
          action={
            <a className="btn btn--primary" href={href(`scan?date=${date}`)}>
              <Icon name="plus" size={18} />
              Add a meal
            </a>
          }
        />
      ) : (
        <>
          {MEAL_CATEGORIES.map((cat) => {
            const list = dayMeals.filter((m) => m.category === cat);
            if (list.length === 0) return null;
            const sub = sumNutrients(list.map(mealTotals));
            return (
              <section key={cat} className="section">
                <div className="section__head">
                  <h2 className="section__title">{MEAL_CATEGORY_LABELS[cat]}</h2>
                  <span className="section__meta">{fmtKcal(sub.kcal)} kcal</span>
                </div>
                <div className="meals">
                  {list.map((m) => (
                    <MealCard
                      key={m.id}
                      meal={m}
                      onDelete={() => {
                        deleteMeal(m.id);
                        showToast('Meal deleted');
                      }}
                    />
                  ))}
                </div>
              </section>
            );
          })}
          <a className="btn btn--outline add-more" href={href(`scan?date=${date}`)}>
            <Icon name="plus" size={18} />
            Add another meal
          </a>
        </>
      )}
    </div>
  );
}
