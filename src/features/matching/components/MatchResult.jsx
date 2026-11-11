import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar/Avatar.jsx';
import { avatarOf, catLabel } from '@/domain/metrics.js';
import { formatCompact, formatFcfa, formatScore } from '@/lib/format.js';

function noteColor(note) {
  if (note >= 4.3) return 'var(--ok)';
  if (note >= 3.8) return 'var(--warn)';
  return 'var(--orange)';
}

/** @param {{ match: any, showPrediction: boolean, canEngage: boolean, hidden?: boolean }} props */
export function MatchResult({ match: m, showPrediction, canEngage, hidden = false }) {
  const i = m.influencer;
  const tabIndex = hidden ? -1 : undefined;
  return (
    <article className="mres" aria-hidden={hidden || undefined}>
      <div className="note">
        <b style={{ color: noteColor(m.note) }}>{formatScore(m.note)}</b>
        <div className="tiny muted">sur 5</div>
      </div>
      <div>
        <div className="row" style={{ gap: 10 }}>
          <Avatar {...avatarOf(i)} size={40} />
          <div>
            <b>{i.name}</b> {i.handle ? <span className="tiny muted">@{i.handle}</span> : null}
            <div className="tiny muted">
              {(i.cats ?? []).map(catLabel).join(' / ')}
              {m.price != null ? <> · dès {formatFcfa(m.price)}</> : ' · tarif masqué'}
              {m.inBudget ? null : <span className="pill p-danger nodot" style={{ marginLeft: 4 }}>Hors budget</span>}
            </div>
          </div>
        </div>
        <ul className="why">{(m.why ?? []).slice(0, 3).map((reason) => <li key={reason}>{reason}</li>)}</ul>
        {showPrediction ? (
          <div className="pred">
            <span>Portée prédite <b>{formatCompact(m.reach)}</b></span>
            <span>Interactions <b>{formatCompact(m.interactions)}</b></span>
            <span>Coût / 1 000 vues <b>{formatFcfa(m.cpm)}</b></span>
            <span className="muted">Idéal pour : {(m.reco || '').toLowerCase()}</span>
          </div>
        ) : (
          <div className="pred muted">Prédiction de portée disponible avec la formule Pro</div>
        )}
      </div>
      <div className="act" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {i.handle ? <Link className="btn sm ghost" to={`/i/${i.handle}`} tabIndex={tabIndex}>Vitrine</Link> : <span className="btn sm ghost" aria-disabled="true">Vitrine</span>}
        {canEngage && i.handle ? (
          <Link className="btn sm" to={`/engager/${i.handle}`} state={{ fresh: true }} tabIndex={tabIndex}>Engager</Link>
        ) : null}
      </div>
    </article>
  );
}
