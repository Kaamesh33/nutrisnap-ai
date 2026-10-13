import { useId, useRef, useState } from 'react';
import { ConfirmButton } from '../components/ConfirmButton';
import { Icon } from '../components/Icon';
import { NumberField } from '../components/NumberField';
import { useAppStore } from '../hooks/useAppStore';
import { DEFAULT_PROFILE } from '../models/defaults';
import type { ActivityLevel, Goal, Profile, Sex, Targets } from '../models/types';
import { ACTIVITY_LABELS, GOAL_LABELS, profileProblems, suggestTargets, targetsProblems, type TargetSuggestion } from '../utils/targets';

const ACTIVITIES = Object.keys(ACTIVITY_LABELS) as ActivityLevel[];
const GOALS = Object.keys(GOAL_LABELS) as Goal[];

const nullIfNaN = (v: number) => (Number.isNaN(v) ? null : v);

export function ProfilePage() {
  const store = useAppStore();
  const [p, setP] = useState<Profile>(() => JSON.parse(JSON.stringify(store.profile)) as Profile);
  const [suggestion, setSuggestion] = useState<TargetSuggestion | null>(null);
  const [calcProblems, setCalcProblems] = useState<string[]>([]);
  const [saveProblems, setSaveProblems] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const nameId = useId();
  const activityId = useId();

  const setTarget = (k: keyof Targets) => (v: number) => setP((x) => ({ ...x, targets: { ...x.targets, [k]: v } }));

  const calculate = () => {
    const problems = profileProblems(p);
    setCalcProblems(problems);
    setSuggestion(problems.length ? null : suggestTargets(p));
  };

  const save = () => {
    const problems = targetsProblems(p.targets);
    setSaveProblems(problems);
    if (problems.length) return;
    store.saveProfile({ ...p, name: p.name.trim(), isPersonalised: true });
    store.showToast('Profile saved');
  };

  const download = () => {
    const blob = new Blob([store.exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrisnap-backup-${store.today}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    store.showToast('Backup downloaded');
  };

  const importFile = async (f: File | undefined) => {
    if (!f) return;
    const text = await f.text();
    const r = store.importData(text);
    store.showToast(r.message, r.ok ? 'success' : 'error');
    if (r.ok && r.profile) {
      setP(JSON.parse(JSON.stringify(r.profile)) as Profile);
      setSuggestion(null);
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Profile and targets</h1>
        <p className="notice notice--info">
          <Icon name="info" size={18} />
          <span>
            Targets here are estimates from standard formulas, not medical advice. If you are pregnant, under 18, have
            diabetes, kidney disease or another condition, ask a doctor or registered dietitian.
          </span>
        </p>
      </header>

      <section className="panel">
        <h2 className="panel__title">About you</h2>
        <div className="field">
          <label htmlFor={nameId} className="field__label">
            Name <span className="field__optional">(optional)</span>
          </label>
          <div className="field__control">
            <input id={nameId} type="text" maxLength={40} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} />
          </div>
        </div>
        <div className="grid-fields">
          <NumberField label="Age" unit="years" value={p.age} onChange={(v) => setP({ ...p, age: nullIfNaN(v) })} />
          <NumberField label="Height" unit="cm" value={p.heightCm} onChange={(v) => setP({ ...p, heightCm: nullIfNaN(v) })} />
          <NumberField label="Weight" unit="kg" value={p.weightKg} onChange={(v) => setP({ ...p, weightKg: nullIfNaN(v) })} />
        </div>

        <fieldset className="radios">
          <legend className="field__label">Sex (used by the energy formula)</legend>
          {(['female', 'male'] as Sex[]).map((s) => (
            <label key={s} className="radio">
              <input type="radio" name="sex" checked={p.sex === s} onChange={() => setP({ ...p, sex: s })} />
              <span>{s === 'female' ? 'Female' : 'Male'}</span>
            </label>
          ))}
        </fieldset>

        <div className="field">
          <label htmlFor={activityId} className="field__label">
            Activity level
          </label>
          <div className="field__control">
            <select id={activityId} value={p.activity} onChange={(e) => setP({ ...p, activity: e.target.value as ActivityLevel })}>
              {ACTIVITIES.map((a) => (
                <option key={a} value={a}>
                  {ACTIVITY_LABELS[a]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="radios">
          <legend className="field__label">Goal</legend>
          {GOALS.map((g) => (
            <label key={g} className="radio">
              <input type="radio" name="goal" checked={p.goal === g} onChange={() => setP({ ...p, goal: g })} />
              <span>{GOAL_LABELS[g]}</span>
            </label>
          ))}
        </fieldset>

        <button type="button" className="btn btn--outline" onClick={calculate}>
          Estimate my targets
        </button>
        {calcProblems.length ? (
          <ul className="problems" role="alert">
            {calcProblems.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        ) : null}
        {suggestion ? (
          <div className="suggestion">
            <p>
              Resting energy about <strong>{suggestion.restingKcal.toLocaleString()} kcal</strong>, about{' '}
              <strong>{suggestion.maintenanceKcal.toLocaleString()} kcal</strong> with your activity. For{' '}
              {GOAL_LABELS[p.goal].toLowerCase()}, the estimate is <strong>{suggestion.targets.kcal.toLocaleString()} kcal</strong> and{' '}
              <strong>{suggestion.targets.protein} g protein</strong> ({suggestion.proteinGPerKg} g per kg). Fat is set to 25% of
              energy and carbohydrates fill the rest.
            </p>
            {suggestion.warnings.map((w) => (
              <p key={w} className="notice notice--warn">
                <Icon name="alert" size={18} />
                {w}
              </p>
            ))}
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                setP((x) => ({ ...x, targets: { ...suggestion.targets } }));
                store.showToast('Estimates copied into your targets. Save to keep them.', 'info');
              }}
            >
              Use these targets
            </button>
          </div>
        ) : null}
      </section>

      <section className="panel">
        <h2 className="panel__title">Daily targets</h2>
        <p className="field__hint">Edit any number. They are used on the dashboard, diary, progress and coach.</p>
        <div className="grid-fields">
          <NumberField label="Calories" unit="kcal" value={p.targets.kcal} onChange={setTarget('kcal')} />
          <NumberField label="Protein" unit="g" value={p.targets.protein} onChange={setTarget('protein')} />
          <NumberField label="Carbohydrates" unit="g" value={p.targets.carbs} onChange={setTarget('carbs')} />
          <NumberField label="Fat" unit="g" value={p.targets.fat} onChange={setTarget('fat')} />
          <NumberField label="Fibre" unit="g" value={p.targets.fibre} onChange={setTarget('fibre')} />
        </div>
        {saveProblems.length ? (
          <ul className="problems" role="alert">
            {saveProblems.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        ) : null}
        <div className="row-actions row-actions--end">
          <button type="button" className="btn btn--primary btn--large" onClick={save}>
            Save profile
          </button>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel__title">Your data</h2>
        <p>
          Meals and targets are saved only in this browser on this device. They do not sync to your phone or other
          browsers, and clearing your browser data deletes them. Download a backup now and then.
        </p>
        <div className="row-actions">
          <button type="button" className="btn btn--outline" onClick={download}>
            Download backup
          </button>
          <button type="button" className="btn btn--outline" onClick={() => fileRef.current?.click()}>
            Restore from backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              void importFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
        <p className="field__hint">Restoring replaces everything currently saved in this browser.</p>

        <h3 className="panel__subtitle">Demo diary</h3>
        <p>Fill the last 7 days with sample meals to explore the charts and coach. Demo meals are labelled and can be removed in one step.</p>
        <div className="row-actions">
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => {
              const n = store.loadDemo();
              store.showToast(`Added ${n} demo meals`);
            }}
          >
            {store.hasDemo ? 'Reload demo diary' : 'Load demo diary'}
          </button>
          {store.hasDemo ? (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                const n = store.removeDemo();
                store.showToast(`Removed ${n} demo meals`);
              }}
            >
              Remove demo meals
            </button>
          ) : null}
        </div>

        <h3 className="panel__subtitle">Start fresh</h3>
        <ConfirmButton
          label="Delete all data"
          confirmLabel="Delete all meals and profile"
          onConfirm={() => {
            store.resetAll();
            setP(JSON.parse(JSON.stringify(DEFAULT_PROFILE)) as Profile);
            setSuggestion(null);
            store.showToast('All data deleted');
          }}
        />
      </section>
    </div>
  );
}
