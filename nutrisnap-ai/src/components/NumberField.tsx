import { useEffect, useId, useState } from 'react';
import { parseNumberInput } from '../utils/format';

/**
 * Number input that lets the person clear the box while typing.
 * It reports NaN for empty or invalid text; validation shows the message.
 */
export function NumberField({
  label,
  value,
  onChange,
  unit,
  allowEmpty = false,
  hint,
  error,
  className = '',
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
  unit?: string;
  allowEmpty?: boolean;
  hint?: string;
  error?: string | null;
  className?: string;
}) {
  const id = useId();
  const toText = (v: number | null) => (v === null || Number.isNaN(v) ? '' : String(Math.round(v * 100) / 100));
  const [text, setText] = useState(toText(value));

  // Follow changes made outside this box (for example the +/- buttons).
  useEffect(() => {
    const parsed = parseNumberInput(text);
    const valueEmpty = value === null || Number.isNaN(value);
    const same = (Number.isNaN(parsed) && valueEmpty) || parsed === value;
    if (!same) setText(toText(value));
    // Only react to the outside value, not to typing.
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`field ${className}`}>
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <div className={`field__control${error ? ' field__control--error' : ''}`}>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={text}
          aria-invalid={error ? true : undefined}
          aria-describedby={hint || error ? `${id}-desc` : undefined}
          placeholder={allowEmpty ? 'unknown' : undefined}
          onChange={(e) => {
            setText(e.target.value);
            onChange(parseNumberInput(e.target.value));
          }}
        />
        {unit ? <span className="field__unit">{unit}</span> : null}
      </div>
      {error || hint ? (
        <div id={`${id}-desc`} className={error ? 'field__error' : 'field__hint'}>
          {error ?? hint}
        </div>
      ) : null}
    </div>
  );
}
