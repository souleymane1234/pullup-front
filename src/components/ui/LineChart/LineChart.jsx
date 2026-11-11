import { useId } from 'react';

/**
 * Courbe d'évolution en SVG, sans dépendance.
 * @param {{ values: number[], label: string, height?: number, startLabel?: string, endLabel?: string }} props
 */
export function LineChart({ values, label, height = 150, startLabel = 'il y a 30 j', endLabel = "aujourd'hui" }) {
  const gradientId = `lc${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const width = 600;
  const max = Math.max(...values) * 1.15 || 1;
  const step = width / Math.max(values.length - 1, 1);
  const points = values.map((v, k) => [k * step, height - (v / max) * (height - 16)]);
  const path = points.map((p, k) => `${k ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height + 20}`} role="img" aria-label={label}>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5A3D72" stopOpacity=".35" />
          <stop offset="1" stopColor="#5A3D72" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((f) => (
        <line key={f} x1="0" x2={width} y1={8 + f * (height - 16)} y2={8 + f * (height - 16)} stroke="var(--line)" strokeDasharray="3 5" />
      ))}
      <path d={`${path} L${width},${height} L0,${height} Z`} fill={`url(#${gradientId})`} />
      <path d={path} fill="none" stroke="var(--plum)" strokeWidth="2.5" strokeLinejoin="round" />
      <text x="0" y={height + 16} fontSize="11" fill="var(--muted)">{startLabel}</text>
      <text x={width} y={height + 16} fontSize="11" fill="var(--muted)" textAnchor="end">{endLabel}</text>
    </svg>
  );
}
