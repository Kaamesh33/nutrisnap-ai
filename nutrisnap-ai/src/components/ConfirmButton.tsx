import { useEffect, useState } from 'react';
import { Icon, type IconName } from './Icon';

/**
 * Two-step button for destructive actions: first click asks, second click does it.
 * Resets after 5 seconds if the person does nothing.
 */
export function ConfirmButton({
  label,
  confirmLabel,
  onConfirm,
  icon = 'trash',
  className = 'btn btn--ghost btn--danger',
}: {
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
  icon?: IconName;
  className?: string;
}) {
  const [asking, setAsking] = useState(false);
  useEffect(() => {
    if (!asking) return;
    const t = setTimeout(() => setAsking(false), 5000);
    return () => clearTimeout(t);
  }, [asking]);
  if (!asking) {
    return (
      <button type="button" className={className} onClick={() => setAsking(true)}>
        <Icon name={icon} size={18} />
        <span>{label}</span>
      </button>
    );
  }
  return (
    <span className="confirm" role="group" aria-label={confirmLabel}>
      <button type="button" className="btn btn--danger-solid" onClick={() => { setAsking(false); onConfirm(); }}>
        {confirmLabel}
      </button>
      <button type="button" className="btn btn--ghost" onClick={() => setAsking(false)}>
        Keep
      </button>
    </span>
  );
}
