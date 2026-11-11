import { forwardRef, useId } from 'react';
import { cn } from '@/lib/cn.js';

/**
 * Champ libellé (input, textarea ou select). La ref est transmise pour React Hook Form.
 * @type {import('react').ForwardRefExoticComponent<
 *   Record<string, any> & {
 *     as?: 'input'|'textarea'|'select',
 *     label: import('react').ReactNode,
 *     hint?: import('react').ReactNode,
 *     error?: string,
 *     fieldStyle?: import('react').CSSProperties,
 *   } & import('react').RefAttributes<any>
 * >}
 */
export const Input = forwardRef(function Input(
  { as: Tag = 'input', id, label, hint, error, disabled, className, fieldStyle, children, ...props },
  ref,
) {
  const generated = useId();
  const fieldId = id ?? generated;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="field" style={fieldStyle}>
      <label className="f" htmlFor={fieldId}>{label}</label>
      <Tag
        ref={ref}
        id={fieldId}
        className={cn('inp', className)}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      >
        {children}
      </Tag>
      {hint ? <div id={hintId} className="hint">{hint}</div> : null}
      {error ? <p id={errorId} className="field-error" role="alert">{error}</p> : null}
    </div>
  );
});
