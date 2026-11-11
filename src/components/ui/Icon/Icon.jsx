const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 };
const round = { ...stroke, strokeLinecap: 'round' };
const join = { ...stroke, strokeLinejoin: 'round' };
const HEART = 'M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z';
const STAR = 'M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z';

const icon = (props, body) => ({ props, body });

const ICONS = {
  heart: icon(join, <path d={HEART} />),
  heartFill: icon({ fill: 'currentColor' }, <path d={HEART} />),
  ig: icon(stroke, <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></>),
  tt: icon(round, <><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c.5 2.6 2.4 4.4 5 4.6" /></>),
  fb: icon(round, <path d="M15 3h-2a4 4 0 0 0-4 4v14M6 11h8" />),
  sc: icon(join, <path d="M12 3c3.3 0 5 2.5 5 5.5v2l2 1-2 1.5c.5 2 2.5 3 3.5 3.5-1 1-3 1-4 1.5-.5 1-1 2-4.5 2s-4-1-4.5-2c-1-.5-3-.5-4-1.5 1-.5 3-1.5 3.5-3.5L4 11.5l2-1v-2C6 5.5 8.7 3 12 3z" />),
  verified: icon({}, <><path fill="#2A7CF6" d="M12 1.5l2.6 2 3.2-.3.9 3.1 2.8 1.7-1 3.1 1 3-2.8 1.8-.9 3.1-3.2-.3L12 22.5l-2.6-2-3.2.3-.9-3.1-2.8-1.7 1-3.1-1-3 2.8-1.8.9-3.1 3.2.3z" /><path d="M8 12.2l2.7 2.6L16 9.5" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></>),
  lock: icon(round, <><rect x="4" y="11" width="16" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>),
  card: icon(round, <><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 10h19M6.5 15h4" /></>),
  home: icon(join, <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />),
  search: icon(round, <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>),
  spark: icon(join, <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" /></>),
  grid: icon(stroke, <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>),
  user: icon(round, <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>),
  bell: icon(round, <><path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z" /><path d="M10 21h4" /></>),
  shield: icon(join, <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></>),
  tag: icon(join, <><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="7.5" r="1.5" /></>),
  chart: icon(round, <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />),
  people: icon(round, <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5" /><circle cx="17" cy="9" r="2.5" /><path d="M17 14c2.3 0 4 1.3 4.8 3.8" /></>),
  chat: icon(join, <path d="M4 5h16v11H9l-5 4z" />),
  coin: icon(stroke, <><circle cx="12" cy="12" r="8.5" /><path d="M9.5 9.5c0-1 1-1.8 2.5-1.8s2.5.8 2.5 1.8-1 1.5-2.5 1.8-2.5.8-2.5 1.9 1 1.8 2.5 1.8 2.5-.8 2.5-1.8M12 6.5v11" /></>),
  audit: icon(round, <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></>),
  start: icon(join, <path d={STAR} />),
  star: icon({ fill: 'currentColor' }, <path d={STAR} />),
  play: icon({ fill: 'currentColor' }, <path d="M8 5.5v13l10.5-6.5z" />),
};

export const ICON_NAMES = Object.keys(ICONS);

/**
 * Pictogramme décoratif : toujours masqué aux technologies d'assistance, le libellé est porté par le parent.
 * @param {{ name: string, size?: number, className?: string, style?: import('react').CSSProperties }} props
 */
export function Icon({ name, size, className, style }) {
  const { props, body } = ICONS[name] ?? ICONS.spark;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {body}
    </svg>
  );
}
