/**
 * Indicateur chiffré. À placer dans un conteneur `.kpis`.
 * @param {{ value: import('react').ReactNode, label: import('react').ReactNode, top?: import('react').ReactNode,
 *   style?: import('react').CSSProperties }} props
 */
export function Kpi({ value, label, top = null, style }) {
  return (
    <div className="kpi" style={style}>
      {top}
      <b style={top ? { marginTop: 6 } : undefined}>{value}</b>
      <span>{label}</span>
    </div>
  );
}

/** @param {{ children: import('react').ReactNode, style?: import('react').CSSProperties }} props */
export function KpiGrid({ children, style }) {
  return <div className="kpis" style={style}>{children}</div>;
}
