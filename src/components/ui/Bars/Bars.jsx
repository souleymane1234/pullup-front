const clamp = (value) => Math.max(0, Math.min(100, value));

/**
 * Histogramme horizontal en pourcentages.
 * @param {{ items: { label: string, value: number }[] }} props
 */
export function Bars({ items }) {
  return (
    <div className="bars">
      {items.map((item) => (
        <div className="bar" key={item.label}>
          <span>{item.label}</span>
          <span className="t"><i style={{ width: `${clamp(item.value)}%` }} /></span>
          <span className="small" style={{ textAlign: 'right' }}>{item.value} %</span>
        </div>
      ))}
    </div>
  );
}
