import { useId, useState } from 'react';
import type { MealItem, Nutrients } from '../models/types';
import { customItem } from '../utils/meals';
import { isValidGrams, isValidPer100g } from '../utils/nutrition';
import { NumberField } from './NumberField';

/** Add a food that is not in the list, with nutrition per 100 g from a label or trusted source. */
export function CustomFoodForm({ onAdd, onCancel }: { onAdd: (item: MealItem) => void; onCancel: () => void }) {
  const nameId = useId();
  const [name, setName] = useState('');
  const [grams, setGrams] = useState(100);
  const [n, setN] = useState<Nutrients>({ kcal: Number.NaN, protein: Number.NaN, carbs: Number.NaN, fat: Number.NaN, fibre: null });
  const [tried, setTried] = useState(false);

  const problems: string[] = [];
  if (!name.trim()) problems.push('Enter a food name.');
  if (!isValidGrams(grams)) problems.push('Enter a serving between 1 and 3000 g.');
  if (!isValidPer100g(n)) problems.push('Enter calories, protein, carbs and fat per 100 g (fibre is optional).');

  const set = (k: keyof Nutrients) => (v: number) =>
    setN((prev) => ({ ...prev, [k]: k === 'fibre' && Number.isNaN(v) ? null : v }));

  return (
    <div className="custom">
      <h4 className="custom__title">Custom food</h4>
      <p className="custom__hint">Copy the per-100 g values from the packet label or a nutrition database.</p>
      <div className="field">
        <label htmlFor={nameId} className="field__label">
          Food name
        </label>
        <div className="field__control">
          <input id={nameId} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ragi mudde" />
        </div>
      </div>
      <div className="grid-fields">
        <NumberField label="Serving" unit="g" value={grams} onChange={setGrams} />
        <NumberField label="Calories / 100 g" unit="kcal" value={n.kcal} onChange={set('kcal')} />
        <NumberField label="Protein / 100 g" unit="g" value={n.protein} onChange={set('protein')} />
        <NumberField label="Carbs / 100 g" unit="g" value={n.carbs} onChange={set('carbs')} />
        <NumberField label="Fat / 100 g" unit="g" value={n.fat} onChange={set('fat')} />
        <NumberField label="Fibre / 100 g" unit="g" value={n.fibre} onChange={set('fibre')} allowEmpty />
      </div>
      {tried && problems.length > 0 ? (
        <ul className="problems" role="alert">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      ) : null}
      <div className="row-actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => {
            setTried(true);
            if (problems.length === 0) onAdd(customItem(name.trim(), grams, n));
          }}
        >
          Add custom food
        </button>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
