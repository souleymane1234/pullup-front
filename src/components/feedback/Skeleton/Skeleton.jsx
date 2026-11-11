/**
 * @param {{ width?: string|number, height?: string|number, className?: string }} props
 */
export function Skeleton({ width = '100%', height = 16 }) {
  return <span className="skeleton" style={{ width, height, borderRadius: 8, marginBottom: 8 }} aria-hidden="true" />;
}

export function PageSkeleton() {
  return (
    <div className="wrap section tight" aria-busy="true" aria-live="polite">
      <Skeleton width={220} height={32} />
      <Skeleton height={18} />
      <Skeleton height={18} />
      <Skeleton height={120} />
    </div>
  );
}
