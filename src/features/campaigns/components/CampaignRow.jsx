import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar/Avatar.jsx';
import { formatFcfa } from '@/lib/format.js';
import { CampaignStatus } from './CampaignStatus.jsx';

/**
 * Ligne de campagne vue par l'annonceur (on montre l'influenceur) ou par l'influenceur (on montre la marque et son net).
 * @param {{ campaign: any, perspective: 'brand'|'influencer' }} props
 */
export function CampaignRow({ campaign: c, perspective }) {
  const other = perspective === 'brand' ? c.influencer : { name: c.brand.name, hue: 30 };
  return (
    <Link className="camp" to={`/c/${c.id}`}>
      <Avatar {...other} size={42} />
      <div style={{ minWidth: 0 }}>
        <b>{c.brief.title || 'Campagne'}</b>
        <div className="small muted">{other.name} · {c.offer.fmt} · {formatFcfa(perspective === 'influencer' ? c.payout : c.amount)}</div>
      </div>
      <CampaignStatus status={c.status} />
    </Link>
  );
}
