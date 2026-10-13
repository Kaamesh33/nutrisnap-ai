import { useId, useState } from 'react';
import type { FoodReference, MealItem } from '../models/types';
import { MEAL_CATEGORIES, MEAL_CATEGORY_LABELS } from '../models/types';
import { fmtGrams, fmtKcal } from '../utils/format';
import { draftProblems, itemFromFood, type MealDraft } from '../utils/meals';
import { countUnknownFibre, itemsTotals } from '../utils/nutrition';
import { CustomFoodForm } from './CustomFoodForm';
import { FoodSearch } from './FoodSearch';
import { ItemRow } from './ItemRow';

/**
 * Shared meal editor used by Scan food (new meals) and the diary (editing).
 * The parent owns the draft; this component edits it and validates on save.
 */
export function MealEditor({
  draft,
  onChange,
  onSave,
  onCancel,
  saveLabel,
  saving = false,
}: {
  draft: MealDraft;
  onChange: (d: MealDraft) => void;
  onSave: () => void;
  onCancel?: () => void;
  saveLabel: string;
  saving?: boolean;
}) {
  const nameId = useId();
  const catId = useId();
  const dateId = useId();
  const [showCustom, setShowCustom] = useState(false);
  const [tried, setTried] = useState(false);

  const totals = itemsTotals(draft.items);
  const unknownFibre = countUnknownFibre(draft.items);
  const problems = draftProblems(draft);

  const setItems = (items: MealItem[]) => onChange({ ...draft, items });
  const addFood = (f: FoodReference) => setItems([...draft.items, itemFromFood(f)]);

  return (
    <div className="editor">
      <div className="editor__meta">
        <div className="field">
          <label htmlFor={nameId} className="field__label">
            Meal name <span className="field__optional">(optional)</span>
          </label>
          <div className="field__control">
            <input
              id={nameId}
              type="text"
              value={draft.name}
              maxLength={80}
              placeholder="e.g. Sunday lunch"
              onChange={(e) => onChange({ ...draft, name: e.target.value })}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor={catId} className="field__label">
            Meal
          </label>
          <div className="field__control">
            <select
              id={catId}
              value={draft.category}
              onChange={(e) => onChange({ ...draft, category: e.target.value as MealDraft['category'] })}
            >
              {MEAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {MEAL_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor={dateId} className="field__label">
            Date
          </label>
          <div className="field__control">
            <input id={dateId} type="date" value={draft.date} onChange={(e) => onChange({ ...draft, date: e.target.value })} />
          </div>
        </div>
      </div>

      <section aria-label="Foods in this meal">
        {draft.items.length === 0 ? (
          <p className="editor__empty">No foods yet. Search below or tap a common food to add it.</p>
        ) : (
          <ul className="items">
            {draft.items.map((item, idx) => (
              <ItemRow
                key={item.id}
                item={item}
                showErrors={tried}
                onChange={(next) => setItems(draft.items.map((x, i) => (i === idx ? next : x)))}
                onRemove={() => setItems(draft.items.filter((_, i) => i !== idx))}
              />
            ))}
          </ul>
        )}
      </section>

      <FoodSearch onPick={addFood} />

      {showCustom ? (
        <CustomFoodForm
          onAdd={(item) => {
            setItems([...draft.items, item]);
            setShowCustom(false);
          }}
          onCancel={() => setShowCustom(false)}
        />
      ) : (
        <button type="button" className="link-btn" onClick={() => setShowCustom(true)}>
          Food not in the list? Add a custom food
        </button>
      )}

      <div className="totals" aria-live="polite">
        <h3 className="totals__title">Meal total</h3>
        <dl className="totals__grid">
          <div className="totals__kcal"><dt>Calories</dt><dd>{fmtKcal(totals.kcal)} <small>kcal</small></dd></div>
          <div><dt>Protein</dt><dd>{fmtGrams(totals.protein)} <small>g</small></dd></div>
          <div><dt>Carbs</dt><dd>{fmtGrams(totals.carbs)} <small>g</small></dd></div>
          <div><dt>Fat</dt><dd>{fmtGrams(totals.fat)} <small>g</small></dd></div>
          <div><dt>Fibre</dt><dd>{totals.fibre === null ? 'n/a' : fmtGrams(totals.fibre)} <small>g</small></dd></div>
        </dl>
        {unknownFibre > 0 && draft.items.length > unknownFibre ? (
          <p className="totals__note">Fibre is unknown for {unknownFibre} food(s), so the fibre total is incomplete.</p>
        ) : null}
        <p className="totals__note">
          Totals are calculated as per-100 g value x grams / 100 for each food, then added up. Portions from photos are
          estimates; adjust the grams if you know better.
        </p>
      </div>

      {tried && problems.length > 0 ? (
        <ul className="problems" role="alert">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      ) : null}

      <div className="row-actions row-actions--end">
        {onCancel ? (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button
          type="button"
          className="btn btn--primary btn--large"
          disabled={saving}
          onClick={() => {
            setTried(true);
            if (problems.length === 0) onSave();
          }}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
