import type { Meal } from '../models/types';
import { MEAL_CATEGORY_LABELS } from '../models/types';
import { href } from '../hooks/useHashRoute';
import { fmtGrams, fmtKcal } from '../utils/format';
import { mealTotals } from '../utils/nutrition';
import { ConfirmButton } from './ConfirmButton';
import { Icon } from './Icon';

/** Summary of a saved meal, with optional edit and delete actions. */
export function MealCard({ meal, onDelete, compact = false }: { meal: Meal; onDelete?: () => void; compact?: boolean }) {
  const n = mealTotals(meal);
  const foods = meal.items.map((i) => `${i.name.split(/[,(/]/)[0].trim()} ${Math.round(i.grams)} g`).join(', ');
  return (
    <article className={`meal${compact ? ' meal--compact' : ''}`}>
      <div className="meal__main">
        <div className="meal__heading">
          <span className={`meal__cat meal__cat--${meal.category}`}>{MEAL_CATEGORY_LABELS[meal.category]}</span>
          {meal.origin === 'demo' ? <span className="badge badge--demo">Demo data</span> : null}
          {meal.origin === 'ai' ? <span className="badge badge--ai-estimate">AI estimate</span> : null}
        </div>
        <h3 className="meal__name">{meal.name}</h3>
        {!compact ? <p className="meal__foods">{foods}</p> : null}
      </div>
      <div className="meal__numbers">
        <span className="meal__kcal">
          {fmtKcal(n.kcal)} <small>kcal</small>
        </span>
        <span className="meal__macros">
          P {fmtGrams(n.protein)} g, C {fmtGrams(n.carbs)} g, F {fmtGrams(n.fat)} g
        </span>
      </div>
      {onDelete ? (
        <div className="meal__actions">
          <a className="btn btn--ghost" href={href(`edit/${encodeURIComponent(meal.id)}`)}>
            <Icon name="edit" size={18} />
            <span>Edit</span>
          </a>
          <ConfirmButton label="Delete" confirmLabel="Delete meal" onConfirm={onDelete} />
        </div>
      ) : null}
    </article>
  );
}
