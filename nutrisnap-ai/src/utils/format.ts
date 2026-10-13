/** Display helpers. Calculations keep full precision; only display is rounded. */

export function fmtKcal(v: number): string {
  return Math.round(v).toLocaleString();
}

/** Grams with one decimal under 10 g, whole numbers above. */
export function fmtGrams(v: number): string {
  if (!Number.isFinite(v)) return '0';
  const abs = Math.abs(v);
  if (abs > 0 && abs < 10) return (Math.round(v * 10) / 10).toString();
  return Math.round(v).toString();
}

export function fmtPercent(v: number): string {
  return `${Math.round(v)}%`;
}

/** Parses a number typed by a person; empty or invalid text gives NaN. */
export function parseNumberInput(text: string): number {
  const cleaned = text.trim().replace(',', '.');
  if (cleaned === '') return Number.NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : Number.NaN;
}
