import { cn } from '@/lib/cn.js';

/**
 * Note sur 5. Sans `onChange`, la note est affichée en lecture seule.
 * @param {{ value: number, onChange?: (value: number) => void, label: string }} props
 */
export function StarRating({ value, onChange, label }) {
  if (!onChange) {
    return (
      <span className="stars" role="img" aria-label={`${value} sur 5`}>
        {'★'.repeat(value)}
        <span style={{ color: 'var(--line)' }}>{'★'.repeat(5 - value)}</span>
      </span>
    );
  }
  return (
    <div className="stars" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={n === value}
          aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
          className={cn(n <= value && 'on')}
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
