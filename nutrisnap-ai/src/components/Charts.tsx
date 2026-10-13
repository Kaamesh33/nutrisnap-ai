/**
 * Lightweight SVG charts (no chart library, so nothing extra to install or break).
 * Each chart also renders its numbers in a visually hidden table for screen readers.
 */

/** Rounds up to a tidy axis maximum: 1, 2, 2.5 or 5 times a power of ten. */
export function niceCeil(v: number): number {
  if (!Number.isFinite(v) || v <= 0) return 1;
  const exp = 10 ** Math.floor(Math.log10(v));
  const f = v / exp;
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nf * exp;
}

interface BarDatum {
  label: string;
  value: number;
  /** Shown as hover text. */
  detail?: string;
}

export function BarChart({
  data,
  target,
  unit,
  tone,
  title,
}: {
  data: BarDatum[];
  target?: number;
  unit: string;
  tone: 'kcal' | 'protein';
  title: string;
}) {
  const W = 560;
  const H = 220;
  const padL = 44;
  const padB = 28;
  const padT = 14;
  const max = niceCeil(Math.max(1, target ?? 0, ...data.map((d) => d.value)) * 1.05);
  const innerW = W - padL - 8;
  const innerH = H - padT - padB;
  const slot = innerW / Math.max(1, data.length);
  const barW = Math.min(44, slot * 0.6);
  const y = (v: number) => padT + innerH - (v / max) * innerH;
  const ticks = [0, 0.5, 1].map((f) => Math.round(max * f));

  return (
    <figure className={`chart chart--${tone}`}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} preserveAspectRatio="xMidYMid meet">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - 8} y1={y(t)} y2={y(t)} className="chart__grid" />
            <text x={padL - 6} y={y(t) + 4} textAnchor="end" className="chart__tick">
              {t.toLocaleString()}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = padL + slot * i + (slot - barW) / 2;
          const h = Math.max(0, y(0) - y(d.value));
          return (
            <g key={d.label + i}>
              <rect x={x} y={y(d.value)} width={barW} height={h} rx={6} className="chart__bar">
                <title>{d.detail ?? `${d.label}: ${Math.round(d.value)} ${unit}`}</title>
              </rect>
              <text x={x + barW / 2} y={H - 8} textAnchor="middle" className="chart__label">
                {d.label}
              </text>
            </g>
          );
        })}
        {target ? (
          <g>
            <line x1={padL} x2={W - 8} y1={y(target)} y2={y(target)} className="chart__target" />
            <text x={W - 10} y={y(target) - 6} textAnchor="end" className="chart__target-label">
              Target {Math.round(target).toLocaleString()} {unit}
            </text>
          </g>
        ) : null}
      </svg>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {data.map((d, i) => (
            <tr key={d.label + i}>
              <th scope="row">{d.label}</th>
              <td>
                {Math.round(d.value)} {unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

interface LineSeries {
  name: string;
  tone: 'kcal' | 'protein';
  values: Array<number | null>;
  unit: string;
}

/** Trend line; null values (weeks with no data) leave a gap. One series per chart keeps scales honest. */
export function LineChart({ labels, series, title }: { labels: string[]; series: LineSeries; title: string }) {
  const W = 560;
  const H = 200;
  const padL = 44;
  const padB = 28;
  const padT = 16;
  const known = series.values.filter((v): v is number => v !== null);
  const max = niceCeil(Math.max(1, ...known) * 1.05);
  const innerW = W - padL - 20;
  const innerH = H - padT - padB;
  const x = (i: number) => padL + (labels.length <= 1 ? innerW / 2 : (innerW / (labels.length - 1)) * i);
  const y = (v: number) => padT + innerH - (v / max) * innerH;

  const segments: string[] = [];
  let current = '';
  series.values.forEach((v, i) => {
    if (v === null) {
      if (current) segments.push(current);
      current = '';
    } else {
      current += `${current ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
    }
  });
  if (current) segments.push(current);

  return (
    <figure className={`chart chart--${series.tone}`}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} preserveAspectRatio="xMidYMid meet">
        {[0, 0.5, 1].map((f) => {
          const t = Math.round(max * f);
          return (
            <g key={f}>
              <line x1={padL} x2={W - 8} y1={y(t)} y2={y(t)} className="chart__grid" />
              <text x={padL - 6} y={y(t) + 4} textAnchor="end" className="chart__tick">
                {t.toLocaleString()}
              </text>
            </g>
          );
        })}
        {segments.map((d, i) => (
          <path key={i} d={d} className="chart__line" />
        ))}
        {series.values.map((v, i) =>
          v === null ? null : (
            <circle key={i} cx={x(i)} cy={y(v)} r={4.5} className="chart__dot">
              <title>{`${labels[i]}: ${Math.round(v)} ${series.unit}`}</title>
            </circle>
          ),
        )}
        {labels.map((l, i) => (
          <text key={l + i} x={x(i)} y={H - 8} textAnchor="middle" className="chart__label">
            {l}
          </text>
        ))}
      </svg>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {labels.map((l, i) => (
            <tr key={l + i}>
              <th scope="row">{l}</th>
              <td>{series.values[i] === null ? 'No data' : `${Math.round(series.values[i] as number)} ${series.unit}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/** Horizontal stacked bar showing the share of energy from protein, carbs and fat. */
export function MacroSplit({ split }: { split: { protein: number; carbs: number; fat: number } }) {
  const parts = [
    { key: 'protein', label: 'Protein', v: split.protein },
    { key: 'carbs', label: 'Carbs', v: split.carbs },
    { key: 'fat', label: 'Fat', v: split.fat },
  ];
  const empty = parts.every((p) => p.v === 0);
  return (
    <div className="split">
      <div className="split__bar" role="img" aria-label={parts.map((p) => `${p.label} ${Math.round(p.v * 100)}%`).join(', ')}>
        {empty ? <div className="split__empty" /> : parts.map((p) => <div key={p.key} className={`split__part split__part--${p.key}`} style={{ width: `${p.v * 100}%` }} />)}
      </div>
      <ul className="split__legend">
        {parts.map((p) => (
          <li key={p.key}>
            <span className={`dot dot--${p.key}`} aria-hidden="true" />
            {p.label} <strong>{Math.round(p.v * 100)}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
