import { cn } from '@/lib/cn.js';

const VARIANTS = {
  primary: '',
  light: 'light',
  ghost: 'ghost',
  gold: 'gold',
  wine: 'wine',
  ok: 'ok',
  danger: 'danger',
};

/**
 * Bouton du design system. Aucune logique métier : état, variante et libellé viennent des props.
 * @param {import('react').ButtonHTMLAttributes<HTMLButtonElement> & {
 *   variant?: keyof typeof VARIANTS,
 *   size?: 'md'|'sm',
 *   block?: boolean,
 *   loading?: boolean,
 * }} props
 */
export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn('btn', VARIANTS[variant], size === 'sm' && 'sm', block && 'block', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {children}
    </button>
  );
}
