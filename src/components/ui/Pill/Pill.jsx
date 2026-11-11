import { cn } from '@/lib/cn.js';

/**
 * Étiquette d'état.
 * @param {{ tone?: 'ok'|'warn'|'orange'|'danger'|'info'|'mute', dot?: boolean, className?: string,
 *   style?: import('react').CSSProperties, children: import('react').ReactNode }} props
 */
export function Pill({ tone, dot = true, className, style, children }) {
  return <span className={cn('pill', tone && `p-${tone}`, !dot && 'nodot', className)} style={style}>{children}</span>;
}
