import { useState } from 'react';
import { ConfirmButton } from '../components/ConfirmButton';
import { EmptyState } from '../components/EmptyState';
import { MealEditor } from '../components/MealEditor';
import { useAppStore } from '../hooks/useAppStore';
import { href, navigate } from '../hooks/useHashRoute';
import { draftFromMeal, mealFromDraft, type MealDraft } from '../utils/meals';

export function EditMealPage({ mealId }: { mealId: string }) {
  const { getMeal, updateMeal, deleteMeal, showToast } = useAppStore();
  const meal = getMeal(mealId);
  const [draft, setDraft] = useState<MealDraft | null>(() => (meal ? draftFromMeal(meal) : null));

  if (!meal || !draft) {
    return (
      <div className="page">
        <EmptyState
          title="Meal not found"
          action={
            <a className="btn btn--primary" href={href('diary')}>
              Back to diary
            </a>
          }
        >
          It may have been deleted.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__header">
        <a className="back-link" href={href(`diary?date=${meal.date}`)}>
          Back to diary
        </a>
        <h1 className="page__title">Edit meal</h1>
      </header>
      <section className="panel">
        {meal.origin === 'demo' ? (
          <p className="notice notice--demo">This meal is demo data. Your edits keep it labelled as demo data.</p>
        ) : null}
        <MealEditor
          draft={draft}
          onChange={setDraft}
          saveLabel="Save changes"
          onCancel={() => navigate(`diary?date=${meal.date}`)}
          onSave={() => {
            const updated = mealFromDraft(draft, meal);
            updateMeal(updated);
            showToast('Changes saved');
            navigate(`diary?date=${updated.date}`);
          }}
        />
        <div className="danger-zone">
          <ConfirmButton
            label="Delete this meal"
            confirmLabel="Delete meal"
            onConfirm={() => {
              deleteMeal(meal.id);
              showToast('Meal deleted');
              navigate(`diary?date=${meal.date}`);
            }}
          />
        </div>
      </section>
    </div>
  );
}
