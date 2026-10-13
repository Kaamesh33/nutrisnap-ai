import type { ReactNode } from 'react';
import { href, type RouteName } from '../hooks/useHashRoute';
import { useAppStore } from '../hooks/useAppStore';
import { Icon, type IconName } from './Icon';

const NAV: Array<{ route: RouteName; path: string; label: string; icon: IconName }> = [
  { route: 'home', path: '', label: 'Home', icon: 'home' },
  { route: 'diary', path: 'diary', label: 'Diary', icon: 'book' },
  { route: 'scan', path: 'scan', label: 'Scan food', icon: 'camera' },
  { route: 'progress', path: 'progress', label: 'Progress', icon: 'chart' },
  { route: 'coach', path: 'coach', label: 'Coach', icon: 'chat' },
  { route: 'profile', path: 'profile', label: 'Profile', icon: 'user' },
];

export function AppShell({ active, children }: { active: RouteName; children: ReactNode }) {
  const { toast, dismissToast, storageError, loadNotice, dismissLoadNotice } = useAppStore();
  const current = active === 'edit' ? 'diary' : active;

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <a className="brand" href={href('')}>
          <span className="brand__mark" aria-hidden="true" />
          <span className="brand__text">
            <span className="brand__name">NutriSnap AI</span>
            <span className="brand__tag">Snap it. Track it. Improve it.</span>
          </span>
        </a>
        <nav aria-label="Main">
          <ul className="sidebar__nav">
            {NAV.map((n) => (
              <li key={n.route}>
                <a
                  href={href(n.path)}
                  className={`sidebar__link${n.route === 'scan' ? ' sidebar__link--scan' : ''}`}
                  aria-current={current === n.route ? 'page' : undefined}
                >
                  <Icon name={n.icon} />
                  <span>{n.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="sidebar__foot">Estimates for everyday tracking. Not medical advice.</p>
      </aside>

      <header className="topbar">
        <a className="brand brand--small" href={href('')}>
          <span className="brand__mark" aria-hidden="true" />
          <span className="brand__name">NutriSnap AI</span>
        </a>
      </header>

      <main id="main" className="main" tabIndex={-1}>
        {storageError ? (
          <p className="notice notice--error" role="alert">
            <Icon name="alert" size={18} />
            {storageError}
          </p>
        ) : null}
        {loadNotice ? (
          <p className="notice notice--warn">
            <Icon name="info" size={18} />
            {loadNotice}
            <button type="button" className="link-btn" onClick={dismissLoadNotice}>
              Dismiss
            </button>
          </p>
        ) : null}
        {children}
      </main>

      <nav className="tabbar" aria-label="Main">
        {NAV.map((n) => (
          <a
            key={n.route}
            href={href(n.path)}
            className={`tabbar__link${n.route === 'scan' ? ' tabbar__link--scan' : ''}`}
            aria-current={current === n.route ? 'page' : undefined}
          >
            <span className="tabbar__icon">
              <Icon name={n.icon} size={n.route === 'scan' ? 24 : 22} />
            </span>
            <span className="tabbar__label">{n.route === 'scan' ? 'Scan' : n.label}</span>
          </a>
        ))}
      </nav>

      <div className="toast-region" aria-live="polite" role="status">
        {toast ? (
          <div key={toast.id} className={`toast toast--${toast.kind}`}>
            <Icon name={toast.kind === 'error' ? 'alert' : toast.kind === 'info' ? 'info' : 'check'} size={18} />
            <span>{toast.message}</span>
            <button type="button" className="icon-btn" onClick={dismissToast} aria-label="Dismiss message">
              <Icon name="close" size={16} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
