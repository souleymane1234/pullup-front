import { Icon } from '@/components/ui/Icon/Icon.jsx';
import { NET } from '@/domain/catalog.js';
import { formatCompact, formatPercent } from '@/lib/format.js';

/** @param {{ net: Record<string, [number, number]>, compact?: boolean }} props */
export function NetworkRow({ net, compact = false }) {
  return (
    <div className="netrow">
      {Object.entries(net).map(([key, [followers, engagement]]) => (
        <span className="net" key={key} title={NET[key].l}>
          <Icon name={key} />
          <span className="sr">{NET[key].l} : </span>
          {formatCompact(followers)}
          {compact ? null : <span className="muted tiny"> · {formatPercent(engagement)}</span>}
        </span>
      ))}
    </div>
  );
}
