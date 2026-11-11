import { EmptyState } from '@/components/feedback/EmptyState/EmptyState.jsx';
import { ErrorState } from '@/components/feedback/ErrorState/ErrorState.jsx';
import { Skeleton } from '@/components/feedback/Skeleton/Skeleton.jsx';

/**
 * @param {{
 *   columns: { key: string, header: string }[],
 *   rows?: Record<string, import('react').ReactNode>[],
 *   caption: string,
 *   status?: 'idle'|'loading'|'error'|'empty',
 *   emptyTitle?: string,
 *   emptyText?: string,
 *   errorText?: string,
 *   onRetry?: () => void,
 * }} props
 */
export function Table({
  columns,
  rows = [],
  caption,
  status = 'idle',
  emptyTitle,
  emptyText,
  errorText,
  onRetry,
}) {
  if (status === 'loading') {
    return (
      <div aria-busy="true" aria-live="polite">
        <Skeleton height={18} />
        <Skeleton height={18} />
        <Skeleton height={18} />
      </div>
    );
  }
  if (status === 'error') return <ErrorState text={errorText} onRetry={onRetry} />;
  if (status === 'empty' || rows.length === 0) return <EmptyState title={emptyTitle} text={emptyText} />;

  return (
    <div className="scroll-x">
      <table className="table">
        <caption className="sr">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => <th key={column.key} scope="col">{column.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)}>
              {columns.map((column) => <td key={column.key}>{row[column.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
