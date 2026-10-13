import { useId, useState } from 'react';
import type { MealItem, Nutrients } from '../models/types';
import { fmtGrams, fmtKcal } from '../utils/format';
import { GRAMS_MAX, isValidGrams, itemNutrients } from '../utils/nutrition';
import { getFoodById } from '../services/foodDatabase';
import { Icon } from './Icon';
import { NumberField } from './NumberField';
import { SourceBadge } from './SourceBadge';

/** One editable food inside a meal. Changing grams recalculates instantly. */
export function ItemRow({
  item,
  onChange,
  onRemove,
  showErrors,
}: {
  item: MealItem;
  onChange: (item: MealItem) => void;
  onRemove: () => void;
  showErrors: boolean;
}) {
  const nameId = useId();
  const [open, setOpen] = useState(false);
  const n = itemNutrients(item);
  const ref = item.foodId ? getFoodById(item.foodId) : undefined;
  const step = item.grams < 50 ? 5 : 10;
  const gramsError = showErrors && !isValidGrams(item.grams) ? 'Enter 1 to 3000 g.' : null;

  const setGrams = (g: number) => onChange({ ...item, grams: g });
  const bump = (delta: number) => {
    const base = Number.isFinite(item.grams) ? item.grams : 0;
    setGrams(Math.min(GRAMS_MAX, Math.max(1, Math.round(base + delta))));
  };
  const setPer100 = (k: keyof Nutrients) => (v: number) =>
    onChange({
      ...item,
      source: 'user',
      per100g: { ...item.per100g, [k]: k === 'fibre' && Number.isNaN(v) ? null : v },
    });

  return (
    <li className="item">
      <div className="item__top">
        <div className="item__name">
          <label htmlFor={nameId} className="sr-only">
            Food name
          </label>
          <input
            id={nameId}
            type="text"
            value={item.name}
            aria-invalid={showErrors && !item.name.trim() ? true : undefined}
            onChange={(e) => onChange({ ...item, name: e.target.value })}
          />
          <SourceBadge source={item.source} />
        </div>
        <button type="button" className="icon-btn" onClick={onRemove} aria-label={`Remove ${item.name || 'food'}`}>
          <Icon name="close" size={18} />
        </button>
      </div>

      <div className="item__portion">
        <button type="button" className="icon-btn icon-btn--soft" onClick={() => bump(-step)} aria-label={`Decrease by ${step} grams`}>
          <Icon name="minus" size={18} />
        </button>
        <NumberField label="Serving" unit="g" value={item.grams} onChange={setGrams} error={gramsError} className="item__grams" />
        <button type="button" className="icon-btn icon-btn--soft" onClick={() => bump(step)} aria-label={`Increase by ${step} grams`}>
          <Icon name="plus" size={18} />
        </button>
        {ref ? (
          <button type="button" className="link-btn" onClick={() => setGrams(ref.servingG)}>
            Typical: {ref.servingLabel} ({ref.servingG} g)
          </button>
        ) : null}
      </div>

      <dl className="item__nutrients">
        <div><dt>kcal</dt><dd>{fmtKcal(n.kcal)}</dd></div>
        <div><dt>Protein</dt><dd>{fmtGrams(n.protein)} g</dd></div>
        <div><dt>Carbs</dt><dd>{fmtGrams(n.carbs)} g</dd></div>
        <div><dt>Fat</dt><dd>{fmtGrams(n.fat)} g</dd></div>
        <div><dt>Fibre</dt><dd>{n.fibre === null ? 'n/a' : `${fmtGrams(n.fibre)} g`}</dd></div>
      </dl>

      {item.note ? <p className="item__note">{item.note}</p> : null}

      <button type="button" className="link-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? 'Hide nutrition per 100 g' : 'Edit nutrition per 100 g'}
      </button>
      {open ? (
        <div className="item__per100">
          <p className="field__hint">Changing these marks the food as "Your values".</p>
          <div className="grid-fields">
            <NumberField label="Calories" unit="kcal" value={item.per100g.kcal} onChange={setPer100('kcal')} />
            <NumberField label="Protein" unit="g" value={item.per100g.protein} onChange={setPer100('protein')} />
            <NumberField label="Carbs" unit="g" value={item.per100g.carbs} onChange={setPer100('carbs')} />
            <NumberField label="Fat" unit="g" value={item.per100g.fat} onChange={setPer100('fat')} />
            <NumberField label="Fibre" unit="g" value={item.per100g.fibre} onChange={setPer100('fibre')} allowEmpty />
          </div>
          {ref ? <p className="field__hint">Food list basis: {ref.basis}.</p> : null}
        </div>
      ) : null}
    </li>
  );
}
