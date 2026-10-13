import type { ReactNode } from 'react';

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <svg className="empty__art" viewBox="0 0 120 60" aria-hidden="true">
        <ellipse cx="60" cy="40" rx="54" ry="16" />
        <ellipse cx="60" cy="36" rx="40" ry="10" />
      </svg>
      <h3 className="empty__title">{title}</h3>
      {children ? <div className="empty__body">{children}</div> : null}
      {action ? <div className="empty__action">{action}</div> : null}
    </div>
  );
}
