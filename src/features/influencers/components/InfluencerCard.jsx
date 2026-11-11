import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon/Icon.jsx';
import { Portrait } from '@/components/ui/Portrait/Portrait.jsx';
import { avatarOf, badge, catLabel, displayPullupScore, minPrice } from '@/domain/metrics.js';
import { cn } from '@/lib/cn.js';
import { formatFcfa, formatScore } from '@/lib/format.js';
import { useToggleFavorite } from '../hooks/useInfluencers.js';
import { NetworkRow } from './NetworkRow.jsx';

/**
 * Carte d'annuaire plein cadre : la photo occupe toute la carte, les informations sont posées dessus.
 * Toute la carte mène à la vitrine ; le cœur reste un bouton indépendant.
 * @param {{ influencer: any, v2: boolean }} props
 */
export function InfluencerCard({ influencer: i, v2 }) {
  const level = badge(i);
  const { mutate: toggle, isPending } = useToggleFavorite();
  const { verified, ...portrait } = avatarOf(i);

  return (
    <article className="icard pcard">
      <Portrait {...portrait} fill />
      <div className="pcard-shade" aria-hidden="true" />

      <div className="pcard-top">
        <span className={cn('pcard-badge', `t-${level.tone}`)}>{level.l}</span>
        <span className="pcard-score" title="Score PULLUP">
          <Icon name="star" />
          <span className="sr">Score PULLUP </span>{formatScore(displayPullupScore(i))}
        </span>
      </div>

      <button
        type="button"
        className={cn('fav', i.favorite && 'on')}
        aria-pressed={Boolean(i.favorite)}
        aria-label={`${i.favorite ? 'Retirer' : 'Ajouter'} ${i.name} ${i.favorite ? 'de' : 'à'} ma sélection`}
        disabled={isPending}
        onClick={() => toggle(i.id)}
      >
        <Icon name="heart" />
      </button>

      <div className="pcard-body">
        <h3 className="nm">
          <Link className="stretched" to={`/i/${i.handle}`}>{i.name}</Link>
          {verified ? <span className="pcard-vf" title="Profil vérifié"><Icon name="verified" /><span className="sr"> vérifié</span></span> : null}
        </h3>
        <div className="pcard-meta">@{i.handle} · {i.city.split(' · ')[0]}</div>
        <div className="pcard-cats">
          {i.cats.slice(0, 2).map((cat) => <span key={cat}>{catLabel(cat)}</span>)}
          {i.certified ? <span className="gold">Certifié</span> : null}
        </div>
        <NetworkRow net={i.net} compact />
        <div className="pcard-foot">
          <div className="pcard-price">dès <b>{formatFcfa(minPrice(i))}</b></div>
          <span className="pcard-cta" aria-hidden="true">{v2 ? 'Engager' : 'Contacter'} →</span>
        </div>
      </div>
    </article>
  );
}
