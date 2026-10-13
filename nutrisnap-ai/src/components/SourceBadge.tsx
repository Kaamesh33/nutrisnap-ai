import type { DataSource } from '../models/types';

const LABELS: Record<DataSource, { text: string; title: string }> = {
  reference: { text: 'Food list (approx.)', title: 'Approximate per-100 g values from the built-in food list' },
  user: { text: 'Your values', title: 'Nutrition values entered or changed by you' },
  'ai-estimate': { text: 'AI estimate', title: 'Food and portion suggested by an AI service; check before saving' },
  demo: { text: 'Demo data', title: 'Sample data for trying the app; not a real analysis' },
};

export function SourceBadge({ source }: { source: DataSource }) {
  const l = LABELS[source];
  return (
    <span className={`badge badge--${source}`} title={l.title}>
      {l.text}
    </span>
  );
}
