import { AppShell } from './components/AppShell';
import { useHashRoute } from './hooks/useHashRoute';
import { CoachPage } from './pages/CoachPage';
import { DiaryPage } from './pages/DiaryPage';
import { EditMealPage } from './pages/EditMealPage';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { ProgressPage } from './pages/ProgressPage';
import { ScanPage } from './pages/ScanPage';

export default function App() {
  const route = useHashRoute();
  let page;
  switch (route.name) {
    case 'scan':
      page = <ScanPage key={route.query.get('date') ?? 'scan'} dateParam={route.query.get('date')} />;
      break;
    case 'diary':
      page = <DiaryPage dateParam={route.query.get('date')} />;
      break;
    case 'edit':
      page = <EditMealPage key={route.param ?? ''} mealId={route.param ?? ''} />;
      break;
    case 'progress':
      page = <ProgressPage />;
      break;
    case 'coach':
      page = <CoachPage />;
      break;
    case 'profile':
      page = <ProfilePage />;
      break;
    default:
      page = <HomePage />;
  }
  return <AppShell active={route.name}>{page}</AppShell>;
}
