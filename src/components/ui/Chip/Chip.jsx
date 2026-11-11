import { cn } from '@/lib/cn.js';

/**
 * Puce de sélection. Hors d'un `tablist`, l'état est annoncé par `aria-pressed`.
 * @param {import('react').ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }} props
 */
export function Chip({ selected = false, className, children, role, ...props }) {
  const state = role === 'tab' ? { 'aria-selected': selected } : { 'aria-pressed': selected };
  return (
    <button type="button" role={role} className={cn('chip', selected && 'on', className)} {...state} {...props}>
      {children}
    </button>
  );
}
