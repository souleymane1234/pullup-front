import { cn } from '@/lib/cn.js';

/**
 * Interrupteur accessible (`role="switch"`).
 * @param {{ checked: boolean, onChange: (next: boolean) => void, label: string, disabled?: boolean }} props
 */
export function Switch({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      className={cn('toggle', checked && 'on')}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    />
  );
}
