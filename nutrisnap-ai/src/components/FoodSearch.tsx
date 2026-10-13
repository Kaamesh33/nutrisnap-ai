import { useId, useState } from 'react';
import type { FoodReference } from '../models/types';
import { QUICK_PICKS, getFoodById, searchFoods } from '../services/foodDatabase';
import { fmtKcal } from '../utils/format';
import { Icon } from './Icon';

/** Search the food list and add a food with its typical serving. */
export function FoodSearch({ onPick }: { onPick: (food: FoodReference) => void }) {
  const id = useId();
  const [query, setQuery] = useState('');
  const results = searchFoods(query, 10);
  const quick = QUICK_PICKS.map(getFoodById).filter((f): f is FoodReference => Boolean(f));

  return (
    <div className="search">
      <label htmlFor={id} className="field__label">
        Add a food
      </label>
      <div className="search__box">
        <Icon name="search" size={18} />
        <input
          id={id}
          type="search"
          value={query}
          placeholder="Search idli, dal, chicken curry, roti..."
          autoComplete="off"
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {query.trim() === '' ? (
        <div className="chips" aria-label="Common foods">
          {quick.map((f) => (
            <button key={f.id} type="button" className="chip" onClick={() => onPick(f)}>
              <Icon name="plus" size={14} />
              {f.name.split(/[,(/]/)[0].trim()}
            </button>
          ))}
        </div>
      ) : results.length === 0 ? (
        <p className="search__none">
          No food called "{query.trim()}" in the list. Add it as a custom food below with values from the packet or a
          trusted source.
        </p>
      ) : (
        <ul className="search__results">
          {results.map((f) => {
            const kcal = (f.per100g.kcal * f.servingG) / 100;
            return (
              <li key={f.id}>
                <button
                  type="button"
                  className="search__result"
                  onClick={() => {
                    onPick(f);
                    setQuery('');
                  }}
                >
                  <span className="search__name">{f.name}</span>
                  <span className="search__meta">
                    {f.servingLabel}, {f.servingG} g, about {fmtKcal(kcal)} kcal
                  </span>
                  <Icon name="plus" size={18} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
