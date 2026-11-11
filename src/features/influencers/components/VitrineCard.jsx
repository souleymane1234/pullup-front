import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar/Avatar.jsx';
import { Icon } from '@/components/ui/Icon/Icon.jsx';
import { Pill } from '@/components/ui/Pill/Pill.jsx';
import { QrCode } from '@/components/ui/QrCode/QrCode.jsx';
import { avatarOf, displayPullupScore } from '@/domain/metrics.js';
import { formatFcfa, formatScore } from '@/lib/format.js';
import { NetworkRow } from './NetworkRow.jsx';

/** Carte de visite signature : identité, trois tarifs d'appel et QR code. @param {{ influencer: any, v2: boolean, cta?: boolean }} props */
export function VitrineCard({ influencer: i, v2, cta = false }) {
  const rates = [...i.rates].sort((a, b) => a.price - b.price).slice(0, 3);
  return (
    <article className="vcard" aria-label={`Vitrine de ${i.name}`}>
      <div className="vc-head">
        <Avatar {...avatarOf(i)} size={58} />
        <div className="grow">
          <div className="vc-name">{i.name}</div>
          <div className="small muted">@{i.handle} · {i.city}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="score" style={{ fontSize: '1.35rem' }}>{formatScore(displayPullupScore(i))}<small>/5</small></span>
          <div className="tiny muted">Score PULLUP</div>
        </div>
      </div>
      <div style={{ marginTop: 14 }}><NetworkRow net={i.net} compact /></div>
      <div className="vc-rates">
        {rates.map((rate) => (
          <div key={rate.id}>
            <span><Icon name={rate.net} size={14} style={{ verticalAlign: -2, marginRight: 6 }} />{rate.fmt}</span>
            <b>{formatFcfa(rate.price)}</b>
          </div>
        ))}
      </div>
      <div className="vc-foot">
        <QrCode value={`https://pullup.net/@${i.handle}`} label={`QR code de la vitrine de ${i.name}`} />
        <div className="small">
          <div style={{ fontWeight: 700 }}>pullup.net/@{i.handle}</div>
          <div className="muted tiny" style={{ margin: '2px 0 8px' }}>Scannez pour voir les tarifs et réserver</div>
          {v2
            ? <div className="lockline"><Icon name="lock" size={18} />Paiement sous séquestre</div>
            : <Pill tone="info" dot={false}>Vitrine vérifiée</Pill>}
        </div>
      </div>
      {cta ? <Link className="btn block" style={{ marginTop: 16 }} to={`/i/${i.handle}`}>Voir la vitrine complète</Link> : null}
    </article>
  );
}
