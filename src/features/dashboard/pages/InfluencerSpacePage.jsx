import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageSkeleton } from '@/components/feedback/Skeleton/Skeleton.jsx';
import { DashLayout } from '@/components/layout/DashLayout/DashLayout.jsx';
import { DashHeader } from '@/components/layout/DashHeader/DashHeader.jsx';
import { Bars } from '@/components/ui/Bars/Bars.jsx';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Icon } from '@/components/ui/Icon/Icon.jsx';
import { Input } from '@/components/ui/Input/Input.jsx';
import { Kpi, KpiGrid } from '@/components/ui/Kpi/Kpi.jsx';
import { LineChart } from '@/components/ui/LineChart/LineChart.jsx';
import { Pill } from '@/components/ui/Pill/Pill.jsx';
import { QrCode } from '@/components/ui/QrCode/QrCode.jsx';
import { BOOSTS, PAY } from '@/domain/catalog.js';
import { displayPullupScore, firstName } from '@/domain/metrics.js';
import { AccountPanel } from '@/features/auth/index.js';
import { CampaignRow } from '@/features/campaigns/index.js';
import { useFlags } from '@/features/platform/index.js';
import { InfluencerWalletPanel, usePurchaseBoost } from '@/features/wallet/index.js';
import { copyText } from '@/lib/browser.js';
import { formatDay, formatFcfa, formatNumber, formatScore } from '@/lib/format.js';
import { toast } from '@/lib/toast.js';
import { VitrineEditor } from '../components/VitrineEditor.jsx';
import { useTabParam } from '@/hooks/useTabParam.js';
import { useInfluencerSpace } from '../hooks/useSpaces.js';

const SOURCES = [
  { label: 'QR code', value: 38 },
  { label: 'Lien en bio', value: 34 },
  { label: 'Annuaire', value: 19 },
  { label: 'Matching IA', value: 9 },
];

function Overview({ influencer: i, campaigns, requests, wallet, escrow, v2 }) {
  const pending = campaigns.filter((c) => c.status === 'paid');
  const views30 = i.views.reduce((sum, v) => sum + v, 0);
  return (
    <>
      <DashHeader title={`Bonjour ${firstName(i.name)}`} subtitle={`@${i.handle} · Score PULLUP ${formatScore(displayPullupScore(i))} / 5`} />
      {i.status === 'pending' ? (
        <div className="banner" style={{ background: 'var(--warn-bg)', color: 'var(--warn)', marginBottom: 18 }}>
          <Icon name="shield" />
          <span><b>Profil en cours de vérification.</b> Nous contrôlons vos comptes sous 48 h. Votre vitrine est déjà partageable.</span>
        </div>
      ) : null}
      {pending.length && v2 ? (
        <div className="banner" style={{ background: 'var(--warn-bg)', color: 'var(--warn)', marginBottom: 18 }}>
          <Icon name="bell" />
          <span>
            <b>{pending.length} campagne{pending.length > 1 ? 's' : ''} à accepter</b> · {formatFcfa(pending.reduce((sum, c) => sum + c.payout, 0))} vous attendent.
          </span>
          <Link className="btn sm" style={{ marginLeft: 'auto' }} to={`/c/${pending[0].id}`}>Voir</Link>
        </div>
      ) : null}
      <KpiGrid>
        <Kpi value={formatNumber(views30)} label="visites de la vitrine (30 j)" />
        <Kpi value={formatNumber(i.qr)} label="scans du QR code" />
        <Kpi value={formatNumber(i.contacts + requests.length)} label="demandes reçues" />
        {v2 ? <Kpi value={formatFcfa(escrow)} label="sous séquestre" /> : null}
        {v2 ? <Kpi value={formatFcfa(wallet.available)} label="disponible au retrait" /> : null}
        <Kpi value={`${formatScore(displayPullupScore(i))} / 5`} label="Score PULLUP" />
      </KpiGrid>
      <div className="panel" style={{ marginTop: 20 }}>
        <div className="row between">
          <h3 style={{ margin: 0 }}>Visites de votre vitrine</h3>
          <span className="small muted">30 derniers jours</span>
        </div>
        <LineChart values={i.views} label="Évolution des visites sur 30 jours" />
      </div>
      <div className="grid2" style={{ marginTop: 18 }}>
        <div className="panel">
          <h3 className="h4">D'où viennent vos visiteurs</h3>
          <Bars items={SOURCES} />
        </div>
        <div className="panel">
          <h3 className="h4">Votre vitrine</h3>
          <p className="small muted">Partagez ce lien en bio et imprimez votre QR code sur vos supports.</p>
          <div className="row" style={{ marginTop: 12, alignItems: 'center' }}>
            <QrCode
              value={`https://pullup.net/@${i.handle}`}
              label={`QR code de la vitrine de ${i.name}`}
              size={96}
              style={{ width: 96, height: 96, padding: 6, background: '#fff', borderRadius: 12, border: '1px solid var(--line)', flex: 'none' }}
            />
            <div className="stack" style={{ minWidth: 0, flex: 1 }}>
              <b className="small" style={{ wordBreak: 'break-all' }}>pullup.net/@{i.handle}</b>
              <Link className="btn sm ghost" to={`/i/${i.handle}`}>Voir ma vitrine</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Requests({ campaigns, requests, v2 }) {
  return (
    <>
      <DashHeader title="Campagnes & demandes" subtitle="Les campagnes payées et les demandes de devis des marques." />
      {v2 ? (
        <div className="panel">
          <h3 className="h4">Campagnes payées</h3>
          {campaigns.length ? campaigns.map((c) => <CampaignRow key={c.id} campaign={c} perspective="influencer" />) : (
            <div className="empty">
              <h4>Aucune campagne</h4>
              <p>Complétez vos tarifs pour apparaître en tête du matching.</p>
            </div>
          )}
        </div>
      ) : null}
      <div className="panel" style={{ marginTop: 18 }}>
        <h3 className="h4">Demandes de devis et partenariats</h3>
        {requests.length ? requests.map((r) => (
          <div key={r.id ?? `${r.at}-${r.from}`} className="camp" style={{ gridTemplateColumns: '1fr auto' }}>
            <div>
              <b>{r.from}</b> <Pill tone="info" dot={false}>{r.type}</Pill>
              <div className="small" style={{ marginTop: 4 }}>{r.msg}</div>
              <div className="tiny muted">{r.contact} · {formatDay(r.at)}</div>
            </div>
            <a className="btn sm ghost" href={`tel:${String(r.contact || '').replace(/\s/g, '')}`}>Répondre</a>
          </div>
        )) : <div className="empty"><p>Aucune demande pour le moment.</p></div>}
      </div>
    </>
  );
}

function Booster({ influencer: i }) {
  const boost = usePurchaseBoost();
  const [pay, setPay] = useState('om');
  const [phone, setPhone] = useState(i.phone || '');
  const referral = `https://pullup.net/?ref=${i.handle}`;
  return (
    <>
      <DashHeader title="Booster ma visibilité" subtitle="Options mensuelles pour les influenceurs, sans engagement." />
      <div className="panel" style={{ marginBottom: 16 }}>
        <label className="f" htmlFor="boost-pay">Moyen de paiement</label>
        <select id="boost-pay" className="inp" value={pay} onChange={(event) => setPay(event.target.value)}>
          {PAY.filter((item) => item.k !== 'card').map((item) => (
            <option key={item.k} value={item.k}>{item.l}</option>
          ))}
        </select>
        <Input label="Numéro mobile money" value={phone} onChange={(event) => setPhone(event.target.value)} />
      </div>
      <div className="roadmap">
        {BOOSTS.map((option) => (
          <div key={option.k} className="rm">
            <h3 className="h4" style={{ margin: 0 }}>{option.l}</h3>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.6rem', fontWeight: 600, margin: '6px 0' }}>
              {formatNumber(option.p)} <span className="small muted">FCFA / mois</span>
            </div>
            <p className="small muted">{option.d}</p>
            {option.k === 'certified' && i.certified
              ? <Pill tone="ok">Actif</Pill>
              : <Button size="sm" block disabled={boost.isPending} onClick={() => boost.mutate({ key: option.k, pay, phone })}>Activer</Button>}
          </div>
        ))}
      </div>
      <div className="panel flat" style={{ marginTop: 20 }}>
        <h3 className="h4">Programme d'affiliation</h3>
        <p className="small muted" style={{ margin: '0 0 10px' }}>Gagnez jusqu'à 30 % de commission sur chaque campagne achetée par une marque que vous avez parrainée.</p>
        <div className="row" style={{ flexWrap: 'nowrap' }}>
          <input className="inp small" readOnly value={referral} aria-label="Lien de parrainage" />
          <Button size="sm" variant="ghost" onClick={async () => toast((await copyText(referral)) ? 'Lien copié.' : referral)}>Copier</Button>
        </div>
      </div>
    </>
  );
}

export function InfluencerSpacePage() {
  const flags = useFlags();
  const { data, isPending } = useInfluencerSpace();
  const keys = ['apercu', 'demandes', ...(flags.v2 ? ['wallet'] : []), 'vitrine', 'booster', 'profil'];
  const [tab, select] = useTabParam(keys);

  if (isPending || !data) return <PageSkeleton />;
  const { influencer, campaigns, requests, wallet, escrow } = data;
  const pending = campaigns.filter((c) => c.status === 'paid').length;

  let content = null;
  if (tab === 'apercu') content = <Overview {...data} v2={flags.v2} />;
  if (tab === 'demandes') content = <Requests campaigns={campaigns} requests={requests} v2={flags.v2} />;
  if (tab === 'wallet') content = <InfluencerWalletPanel wallet={wallet} escrow={escrow} />;
  if (tab === 'vitrine') content = <VitrineEditor key={influencer.id} influencer={influencer} />;
  if (tab === 'booster') content = <Booster influencer={influencer} />;
  if (tab === 'profil') content = <AccountPanel />;

  return (
    <DashLayout
      current={tab}
      onSelect={select}
      tabs={[
        { key: 'apercu', label: 'Aperçu' },
        { key: 'demandes', label: flags.v2 ? 'Campagnes' : 'Demandes', count: pending },
        ...(flags.v2 ? [{ key: 'wallet', label: 'Portefeuille' }] : []),
        { key: 'vitrine', label: 'Ma vitrine' },
        { key: 'booster', label: 'Booster' },
        { key: 'profil', label: 'Profil' },
      ]}
    >
      {content}
    </DashLayout>
  );
}
