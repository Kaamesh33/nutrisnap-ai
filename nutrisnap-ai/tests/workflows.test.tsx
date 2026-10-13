import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../src/App';
import { AppStoreProvider } from '../src/hooks/useAppStore';
import { buildDemoMeals } from '../src/data/demoDiary';
import { emptyData, STORAGE_KEY } from '../src/services/storage';
import { todayKey } from '../src/utils/dates';

function renderAt(hash: string) {
  window.location.hash = hash;
  return render(
    <AppStoreProvider>
      <App />
    </AppStoreProvider>,
  );
}

const stored = () => JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');

describe('user workflows', () => {
  it('logs a meal by hand, recalculates when grams change, and saves it', async () => {
    const user = userEvent.setup();
    renderAt('#/scan');

    expect(screen.getByText(/AI photo analysis is not set up/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Add foods myself/ }));

    await user.type(screen.getByLabelText('Add a food'), 'idli');
    await user.click(screen.getByRole('button', { name: /^Idli 1 medium idli/ }));

    // 40 g idli at 135 kcal/100 g = 54 kcal
    const totals = screen.getByRole('heading', { name: 'Meal total' }).parentElement as HTMLElement;
    expect(within(totals).getByText(/^54/)).toBeInTheDocument();

    const grams = screen.getByLabelText('Serving');
    await user.clear(grams);
    await user.type(grams, '120');
    // 120 g -> 162 kcal, protein 5.4 g
    expect(within(totals).getByText(/^162/)).toBeInTheDocument();
    expect(within(totals).getByText(/^5\.4/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save meal' }));

    const data = stored();
    expect(data.meals).toHaveLength(1);
    expect(data.meals[0].items[0].grams).toBe(120);
    expect(data.meals[0].origin).toBe('manual');
    expect(await screen.findByRole('heading', { name: 'Food diary' })).toBeInTheDocument();
  });

  it('blocks saving an empty meal with a clear message', async () => {
    const user = userEvent.setup();
    renderAt('#/scan');
    await user.click(screen.getByRole('button', { name: /Add foods myself/ }));
    await user.click(screen.getByRole('button', { name: 'Save meal' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Add at least one food.');
    expect(stored()).toBeNull();
  });

  it('labels the demo result so it cannot be mistaken for analysis', async () => {
    const user = userEvent.setup();
    renderAt('#/scan');
    await user.click(screen.getByRole('button', { name: /See a demo result/ }));
    expect(screen.getByText(/were not detected from your photo/)).toBeInTheDocument();
    expect(screen.getAllByText('Demo data').length).toBe(3);
    await user.click(screen.getByRole('button', { name: 'Save meal' }));
    expect(stored().meals[0].origin).toBe('demo');
  });

  it('deletes a meal after confirmation and the totals update', async () => {
    const data = emptyData();
    data.meals = buildDemoMeals(todayKey()).filter((m) => m.date === todayKey()).slice(0, 1);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const user = userEvent.setup();
    renderAt('#/diary');

    expect(screen.getByText(data.meals[0].name)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete meal' }));
    expect(screen.queryByText(data.meals[0].name)).not.toBeInTheDocument();
    expect(screen.getByText(/No meals logged today/)).toBeInTheDocument();
    expect(stored().meals).toHaveLength(0);
  });

  it('estimates, edits and saves personal targets', async () => {
    const user = userEvent.setup();
    renderAt('#/profile');
    await user.type(screen.getByLabelText('Age'), '30');
    await user.type(screen.getByLabelText('Height'), '175');
    await user.type(screen.getByLabelText('Weight'), '70');
    await user.click(screen.getByLabelText('Male'));
    await user.selectOptions(screen.getByLabelText('Activity level'), 'moderate');
    await user.click(screen.getByRole('button', { name: 'Estimate my targets' }));
    await user.click(screen.getByRole('button', { name: 'Use these targets' }));
    await user.click(screen.getByRole('button', { name: 'Save profile' }));
    const p = stored().profile;
    expect(p.isPersonalised).toBe(true);
    expect(p.targets.kcal).toBe(2560);
    expect(p.targets.protein).toBe(84);
  });

  it('keeps data after the app is closed and reopened', async () => {
    const user = userEvent.setup();
    const first = renderAt('#/scan');
    await user.click(screen.getByRole('button', { name: /See a demo result/ }));
    await user.click(screen.getByRole('button', { name: 'Save meal' }));
    first.unmount();

    await act(async () => {
      renderAt('#/');
    });
    expect(screen.getByRole('heading', { name: "Today's meals" })).toBeInTheDocument();
    expect(screen.queryByText('Nothing logged today')).not.toBeInTheDocument();
  });
});
