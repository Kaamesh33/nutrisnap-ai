import type { Nutrients, Targets } from '../models/types';
import { fmtGrams, fmtKcal } from '../utils/format';

/**
 * "Today's plate": a thali seen from above. The plate rim fills with
 * calories; the four katori bowls fill with protein, carbs, fat and fibre.
 * Purely visual; the same numbers are shown as text in the macro bars.
 */

interface Props {
  totals: Nutrients;
  targets: Targets;
}

const PLATE_R = 112;
const PLATE_STROKE = 16;

function arc(r: number, fraction: number) {
  const c = 2 * Math.PI * r;
  const f = Math.min(1, Math.max(0, fraction));
  return { dasharray: `${c}`, dashoffset: `${c * (1 - f)}` };
}

const KATORIS: Array<{ key: 'protein' | 'carbs' | 'fat' | 'fibre'; label: string; cx: number; cy: number }> = [
  { key: 'protein', label: 'Protein', cx: 46, cy: 46 },
  { key: 'carbs', label: 'Carbs', cx: 274, cy: 46 },
  { key: 'fat', label: 'Fat', cx: 46, cy: 274 },
  { key: 'fibre', label: 'Fibre', cx: 274, cy: 274 },
];

export function ThaliRing({ totals, targets }: Props) {
  const kcalFrac = targets.kcal > 0 ? totals.kcal / targets.kcal : 0;
  const plate = arc(PLATE_R, kcalFrac);
  const left = targets.kcal - totals.kcal;
  const summary = `Calories ${fmtKcal(totals.kcal)} of ${fmtKcal(targets.kcal)} kcal. Protein ${fmtGrams(totals.protein)} of ${targets.protein} g. Carbs ${fmtGrams(totals.carbs)} of ${targets.carbs} g. Fat ${fmtGrams(totals.fat)} of ${targets.fat} g.`;

  return (
    <svg className="thali" viewBox="0 0 320 320" role="img" aria-label={summary}>
      {/* plate */}
      <circle cx="160" cy="160" r="140" className="thali__plate" />
      <circle cx="160" cy="160" r={PLATE_R} className="thali__rim-track" strokeWidth={PLATE_STROKE} />
      <circle
        cx="160"
        cy="160"
        r={PLATE_R}
        className={`thali__rim${kcalFrac > 1 ? ' thali__rim--over' : ''}`}
        strokeWidth={PLATE_STROKE}
        strokeDasharray={plate.dasharray}
        strokeDashoffset={plate.dashoffset}
        transform="rotate(-90 160 160)"
      />
      <text x="160" y="150" textAnchor="middle" className="thali__kcal">
        {fmtKcal(totals.kcal)}
      </text>
      <text x="160" y="176" textAnchor="middle" className="thali__kcal-label">
        of {fmtKcal(targets.kcal)} kcal
      </text>
      <text x="160" y="200" textAnchor="middle" className="thali__kcal-left">
        {left >= 0 ? `${fmtKcal(left)} left` : `${fmtKcal(-left)} over`}
      </text>

      {/* katoris */}
      {KATORIS.map((k) => {
        const value = totals[k.key] ?? 0;
        const target = targets[k.key];
        const frac = target > 0 ? value / target : 0;
        const ring = arc(28, frac);
        return (
          <g key={k.key} className={`katori katori--${k.key}`}>
            <circle cx={k.cx} cy={k.cy} r="37" className="katori__bowl" />
            <circle cx={k.cx} cy={k.cy} r="28" className="katori__track" />
            <circle
              cx={k.cx}
              cy={k.cy}
              r="28"
              className="katori__fill"
              strokeDasharray={ring.dasharray}
              strokeDashoffset={ring.dashoffset}
              transform={`rotate(-90 ${k.cx} ${k.cy})`}
            />
            <text x={k.cx} y={k.cy + 2} textAnchor="middle" className="katori__value">
              {fmtGrams(value)}g
            </text>
            <text x={k.cx} y={k.cy + 16} textAnchor="middle" className="katori__label">
              {k.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
