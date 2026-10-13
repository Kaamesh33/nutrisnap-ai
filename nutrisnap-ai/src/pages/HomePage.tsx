import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { MacroBar } from '../components/MacroBar';
import { MealCard } from '../components/MealCard';
import { ThaliRing } from '../components/ThaliRing';
import { useAppStore } from '../hooks/useAppStore';
import { href } from '../hooks/useHashRoute';
import { formatDayLong } from '../utils/dates';
import { dayTotals, mealsForDate } from '../utils/nutrition';

export function HomePage() {
  const { meals, profile, today, deleteMeal, showToast } = useAppStore();
  const t = profile.targets;
  const totals = dayTotals(meals, today);
  const todays = mealsForDate(meals, today);

  return (
    <div className="page page--home">
      <header className="page__header page__header--home">
        <div>
          <p className="page__date">{formatDayLong(today)}</p>
          <h1 className="page__title">{profile.name.trim() ? `Today's plate, ${profile.name.trim()}` : "Today's plate"}</h1>
        </div>
        <a className="btn btn--primary btn--large btn--scan" href={href('scan')}>
          <Icon name="camera" size={22} />
          Scan food
        </a>
      </header>

      {!profile.isPersonalised ? (
        <p className="notice notice--info">
          <Icon name="info" size={18} />
          <span>
            These targets are placeholders, not advice for you.{' '}
            <a href={href('profile')}>Set up your profile</a> to estimate your own.
          </span>
        </p>
      ) : null}

      <section className="hero" aria-label="Today's totals">
        <div className="hero__plate">
          <ThaliRing totals={totals} targets={t} />
        </div>
        <div className="hero__bars">
          <MacroBar label="Calories" value={totals.kcal} target={t.kcal} unit="kcal" tone="kcal" showRemaining />
          <MacroBar label="Protein" value={totals.protein} target={t.protein} unit="g" tone="protein" showRemaining />
          <MacroBar label="Carbohydrates" value={totals.carbs} target={t.carbs} unit="g" tone="carbs" />
          <MacroBar label="Fat" value={totals.fat} target={t.fat} unit="g" tone="fat" />
          <MacroBar label="Fibre" value={totals.fibre} target={t.fibre} unit="g" tone="fibre" />
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">Today's meals</h2>
          {todays.length > 0 ? (
            <a className="link-btn" href={href('diary')}>
              Open diary
            </a>
          ) : null}
        </div>
        {todays.length === 0 ? (
          <EmptyState
            title="Nothing logged today"
            action={
              <>
                <a className="btn btn--primary" href={href('scan')}>
                  <Icon name="camera" size={18} />
                  Log your first meal
                </a>
                <a className="btn btn--ghost" href={href('profile')}>
                  Try the demo diary
                </a>
              </>
            }
          >
            Snap or describe what you ate and the totals above fill in.
          </EmptyState>
        ) : (
          <div className="meals">
            {todays.map((m) => (
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
        )}
      </section>
    </div>
  );
}
