import { useState } from 'react';
import { Icon } from '../components/Icon';
import { MealEditor } from '../components/MealEditor';
import { PhotoPicker } from '../components/PhotoPicker';
import { useAppStore } from '../hooks/useAppStore';
import { navigate } from '../hooks/useHashRoute';
import type { MealItem, MealOrigin } from '../models/types';
import { analysisEndpoint, analyzeWithBackend, demoAnalysis, type AnalysisMode } from '../services/photoAnalysis';
import { isDateKey } from '../utils/dates';
import { categoryForTime, mealFromDraft, type MealDraft } from '../utils/meals';

type Phase = 'choose' | 'analysing' | 'review';

function originFor(items: MealItem[]): MealOrigin {
  if (items.some((i) => i.source === 'demo')) return 'demo';
  if (items.some((i) => i.source === 'ai-estimate')) return 'ai';
  return 'manual';
}

export function ScanPage({ dateParam }: { dateParam: string | null }) {
  const { today, addMeal, showToast } = useAppStore();
  const endpoint = analysisEndpoint();
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>('choose');
  const [mode, setMode] = useState<AnalysisMode | 'manual'>('manual');
  const [error, setError] = useState<string | null>(null);
  const [unmatched, setUnmatched] = useState<string[]>([]);
  const [draft, setDraft] = useState<MealDraft>(() => ({
    id: null,
    date: dateParam && isDateKey(dateParam) ? dateParam : today,
    category: categoryForTime(),
    name: '',
    items: [],
    origin: 'manual',
  }));

  const startManual = () => {
    setMode('manual');
    setPhase('review');
    setError(null);
  };

  const startDemo = () => {
    const r = demoAnalysis();
    setMode('demo');
    setUnmatched([]);
    setDraft((d) => ({ ...d, items: r.items, origin: 'demo' }));
    setPhase('review');
    setError(null);
  };

  const startAi = async () => {
    if (!file || !endpoint) return;
    setPhase('analysing');
    setError(null);
    try {
      const r = await analyzeWithBackend(file, endpoint);
      setMode('ai');
      setUnmatched(r.unmatched);
      setDraft((d) => ({ ...d, items: r.items, origin: 'ai' }));
      setPhase('review');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Photo analysis failed. Add foods by hand instead.');
      setPhase('choose');
    }
  };

  const save = () => {
    const meal = mealFromDraft({ ...draft, origin: originFor(draft.items) });
    addMeal(meal);
    showToast(`Meal saved to ${meal.date === today ? "today's" : 'your'} diary`);
    navigate(`diary?date=${meal.date}`);
  };

  const startOver = () => {
    setPhase('choose');
    setMode('manual');
    setUnmatched([]);
    setDraft((d) => ({ ...d, items: [], name: '' }));
  };

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Scan food</h1>
        <p className="page__lead">Add a photo, list what is on the plate, adjust the grams, then save.</p>
      </header>

      <section className="panel">
        <h2 className="panel__title">Photo</h2>
        <PhotoPicker file={file} onFile={setFile} />
      </section>

      {phase !== 'review' ? (
        <section className="panel">
          <h2 className="panel__title">Foods on the plate</h2>
          {endpoint ? (
            <p className="notice notice--info">
              <Icon name="info" size={18} />
              AI photo analysis is connected. Results are estimates: always check the foods and grams.
            </p>
          ) : (
            <p className="notice notice--info">
              <Icon name="info" size={18} />
              <span>
                AI photo analysis is not set up in this version, so the app will not guess what is in your photo. Add
                the foods you see, then set the grams. The photo is only a reminder for you.
              </span>
            </p>
          )}
          {error ? (
            <p className="notice notice--error" role="alert">
              <Icon name="alert" size={18} />
              {error}
            </p>
          ) : null}
          {phase === 'analysing' ? (
            <div className="loading" role="status">
              <span className="spinner" aria-hidden="true" />
              Analysing your photo. This can take up to a minute.
            </div>
          ) : (
            <div className="choice">
              {endpoint ? (
                <button type="button" className="btn btn--primary btn--large" disabled={!file} onClick={startAi}>
                  Analyse photo
                </button>
              ) : null}
              <button type="button" className={`btn ${endpoint ? 'btn--outline' : 'btn--primary btn--large'}`} onClick={startManual}>
                <Icon name="plus" size={18} />
                Add foods myself
              </button>
              <button type="button" className="btn btn--ghost" onClick={startDemo}>
                See a demo result
              </button>
              {endpoint && !file ? <p className="field__hint">Add a photo to enable analysis.</p> : null}
              <p className="field__hint">The demo fills in a fixed sample meal so you can see how editing works. It does not read your photo.</p>
            </div>
          )}
        </section>
      ) : (
        <section className="panel">
          <div className="panel__head">
            <h2 className="panel__title">Check and adjust</h2>
            <button type="button" className="link-btn" onClick={startOver}>
              Start over
            </button>
          </div>
          {mode === 'demo' ? (
            <p className="notice notice--demo" role="note">
              <Icon name="alert" size={18} />
              <span>
                <strong>Demo result.</strong> These foods are a fixed sample and were not detected from your photo. Edit
                them freely; the saved meal will be labelled as demo data.
              </span>
            </p>
          ) : null}
          {mode === 'ai' ? (
            <p className="notice notice--warn" role="note">
              <Icon name="info" size={18} />
              <span>
                <strong>AI estimate.</strong> Foods and portions were suggested by the analysis service and can be wrong.
                Photos cannot show hidden oil or exact weight. Nutrition comes from the food list.
              </span>
            </p>
          ) : null}
          {unmatched.length > 0 ? (
            <p className="notice notice--error">
              <Icon name="alert" size={18} />
              Not in the food list: {unmatched.join(', ')}. Enter their nutrition per 100 g or replace them.
            </p>
          ) : null}
          <MealEditor draft={draft} onChange={setDraft} onSave={save} saveLabel="Save meal" />
        </section>
      )}
    </div>
  );
}
