import { fmtGrams, fmtKcal } from '../utils/format';

interface Props {
  label: string;
  value: number | null;
  target: number;
  unit: 'g' | 'kcal';
  tone: 'kcal' | 'protein' | 'carbs' | 'fat' | 'fibre';
  /** Show "x g left" under the bar. */
  showRemaining?: boolean;
}

/** A labelled progress bar. Goes past 100% visually capped, with an "over" note. */
export function MacroBar({ label, value, target, unit, tone, showRemaining = false }: Props) {
  const fmt = unit === 'kcal' ? fmtKcal : fmtGrams;
  const known = value !== null;
  const v = value ?? 0;
  const pct = target > 0 ? (v / target) * 100 : 0;
  const width = Math.min(100, Math.max(0, pct));
  const left = target - v;
  return (
    <div className={`macro macro--${tone}`}>
      <div className="macro__head">
        <span className="macro__label">{label}</span>
        <span className="macro__value">
          {known ? fmt(v) : 'Unknown'}
          <span className="macro__target">
            {' '}
            / {fmt(target)} {unit}
          </span>
        </span>
      </div>
      <div
        className="macro__track"
        role="progressbar"
        aria-label={`${label}: ${known ? fmt(v) : 'unknown'} of ${fmt(target)} ${unit}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(width)}
      >
        <div className={`macro__fill${pct > 100 ? ' macro__fill--over' : ''}`} style={{ width: `${width}%` }} />
      </div>
      {showRemaining && known ? (
        <div className="macro__foot">
          {left >= 0 ? `${fmt(left)} ${unit} left` : `${fmt(-left)} ${unit} over target`}
        </div>
      ) : null}
    </div>
  );
}
