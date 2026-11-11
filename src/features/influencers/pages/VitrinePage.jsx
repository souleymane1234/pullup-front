import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageSkeleton } from '@/components/feedback/Skeleton/Skeleton.jsx';
import { Avatar } from '@/components/ui/Avatar/Avatar.jsx';
import { Bars } from '@/components/ui/Bars/Bars.jsx';
import { Orbs } from '@/components/ui/Decor/Decor.jsx';
import { Icon } from '@/components/ui/Icon/Icon.jsx';
import { Kpi, KpiGrid } from '@/components/ui/Kpi/Kpi.jsx';
import { Pill } from '@/components/ui/Pill/Pill.jsx';
import { QrCode } from '@/components/ui/QrCode/QrCode.jsx';
import { StarRating } from '@/components/ui/StarRating/StarRating.jsx';
import { NET } from '@/domain/catalog.js';
import { avatarOf, badge, catLabel, displayPullupScore } from '@/domain/metrics.js';
import { useSession } from '@/features/auth/index.js';
import { useFlags } from '@/features/platform/index.js';
import { copyText, saveFile } from '@/lib/browser.js';
import { cn } from '@/lib/cn.js';
import { formatCompact, formatDay, formatFcfa, formatPercent, formatScore } from '@/lib/format.js';
import { toast } from '@/lib/toast.js';
import { ContactDialog } from '../components/ContactDialog.jsx';
import { useInfluencerProfile, useRecordVisit, useToggleFavorite } from '../hooks/useInfluencers.js';

export function VitrinePage() {
  const { handle = '' } = useParams();
  const navigate = useNavigate();
  const flags = useFlags();
  const { session, role } = useSession();
  const { data, isPending } = useInfluencerProfile(handle);
  const [rateId, setRateId] = useState(/** @type {string|null} */ (null));
  const [contactOpen, setContactOpen] = useState(false);
  const canvasRef = useRef(/** @type {HTMLCanvasElement|null} */ (null));
  const { mutate: toggleFavorite } = useToggleFavorite();
  useRecordVisit(data?.influencer.id, Boolean(data?.own));

  if (isPending) return <PageSkeleton />;
  if (!data) {
    return (
      <div className="wrap section empty">
        <h1 className="h4">Cette vitrine n'existe pas</h1>
        <Link className="btn" to="/influenceurs">Voir les influenceurs</Link>
      </div>
    );
  }

  const { influencer: i, own, reviews, recent } = data;
  const level = badge(i);
  const stats = i.stats;
  const score = stats?.score?.value ?? displayPullupScore(i);
  const selected = rateId ?? i.rates[0]?.id;
  const link = `https://pullup.net/@${i.handle}`;

  const copyLink = async () => toast((await copyText(link)) ? 'Lien copié.' : link);
  const downloadQr = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast('QR code indisponible.');
      return;
    }
    canvas.toBlob((blob) => blob && saveFile(`pullup-qr-${i.handle}.png`, blob), 'image/png');
  };

  return (
    <>
      <section className="vhead">
        <Orbs />
        <div className="wrap">
          <nav className="crumbs" aria-label="Fil d'Ariane">
            <Link to="/">Accueil</Link> › <Link to="/influenceurs">Influenceurs</Link> › <span aria-current="page">{i.name}</span>
          </nav>
        </div>
      </section>
      <div className="wrap vbody">
        <div className="vlayout">
          <div className="stack">
            <div className="panel">
              {i.status === 'pending' ? (
                <div className="banner" style={{ background: 'var(--warn-bg)', color: 'var(--warn)', marginBottom: 16 }}>
                  <Icon name="shield" />
                  <span><b>Vérification en cours.</b> Votre vitrine sera visible dans l'annuaire après validation par l'équipe PULLUP.</span>
                </div>
              ) : null}
              <div className="idhead">
                <Avatar {...avatarOf(i)} size={92} />
                <div className="grow">
                  <h1 style={{ fontSize: '2rem', margin: 0 }}>{i.name}</h1>
                  <div className="muted">@{i.handle} · {i.city}</div>
                  <div className="row" style={{ gap: 6, marginTop: 8 }}>
                    <Pill tone={level.tone}>{level.l}</Pill>
                    {i.certified ? <Pill tone="info" dot={false}>Certifié PULLUP</Pill> : null}
                    {(i.cats ?? []).map((cat) => <Pill key={cat} tone="mute" dot={false}>{catLabel(cat)}</Pill>)}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span className="score" style={{ fontSize: '1.6rem' }}>★ {String(i.rating).replace('.', ',')}</span>
                  <div className="tiny muted">{i.reviews} avis</div>
                </div>
              </div>
              <p style={{ margin: '18px 0 0', maxWidth: '68ch' }}>{i.bio}</p>
            </div>

            <div className="panel">
              <h2 className="h3">Réseaux et engagement</h2>
              <KpiGrid style={{ marginTop: 12 }}>
                {(stats?.networks ?? []).map((network) => (
                  <Kpi
                    key={network.key}
                    style={{ background: 'var(--surface-2)', border: 0 }}
                    top={<span className="net" style={{ color: 'var(--ink)' }}><Icon name={network.key} />{network.label}</span>}
                    value={formatCompact(network.followers)}
                    label={`${formatPercent(network.engagement)} d'engagement`}
                  />
                ))}
              </KpiGrid>
            </div>

            <div className="panel">
              <h2 className="h3">Audience</h2>
              <div className="grid2" style={{ marginTop: 14, gap: 28 }}>
                <div>
                  <h3 className="muted small" style={{ fontFamily: 'var(--font)' }}>Géographie des abonnés</h3>
                  <Bars items={stats?.audience?.cities ?? []} />
                </div>
                <div>
                  <h3 className="muted small" style={{ fontFamily: 'var(--font)' }}>Âge</h3>
                  <Bars items={stats?.audience?.ages ?? []} />
                  <div className="row" style={{ marginTop: 16, gap: 6 }} aria-hidden="true">
                    <div style={{ flex: stats?.audience?.gender?.women ?? 0, height: 10, borderRadius: 9, background: 'var(--wine)' }} />
                    <div style={{ flex: stats?.audience?.gender?.men ?? 0, height: 10, borderRadius: 9, background: 'var(--blue)' }} />
                  </div>
                  <div className="row between small muted" style={{ marginTop: 4 }}>
                    <span>Femmes {stats?.audience?.gender?.women ?? 0} %</span>
                    <span>Hommes {stats?.audience?.gender?.men ?? 0} %</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel">
              <h2 className="h3">Score PULLUP</h2>
              <div className="scorebox" style={{ marginTop: 12 }}>
                <div className="ring" style={{ '--v': score * 20 }} role="img" aria-label={`${formatScore(score)} sur 5`}>
                  <span>{formatScore(score)}</span>
                </div>
                <Bars items={(stats?.score?.bars ?? []).map((bar) => ({ label: bar.label, value: bar.value }))} />
              </div>
              <p className="small muted" style={{ margin: '14px 0 0' }}>
                {stats?.score?.caption ?? ''}
              </p>
            </div>

            {reviews.length ? (
              <div className="panel">
                <h2 className="h3">Avis des marques</h2>
                {reviews.map((review) => (
                  <div className="camp" style={{ gridTemplateColumns: '1fr' }} key={`${review.brand}-${review.at}`}>
                    <div>
                      <div className="row between"><b>{review.brand}</b><StarRating value={review.stars} label="Note" /></div>
                      <p className="small" style={{ margin: '4px 0 0' }}>{review.text}</p>
                      <div className="tiny muted">{formatDay(review.at)} · campagne vérifiée</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {recent.length ? (
              <div className="panel">
                <h2 className="h3">Campagnes récentes</h2>
                {recent.map((c) => (
                  <div className="camp" style={{ gridTemplateColumns: '1fr auto' }} key={c.id}>
                    <div><b>{c.brand}</b><div className="small muted">{c.fmt} · {NET[c.net].l} · {formatDay(c.createdAt)}</div></div>
                    <div className="small" style={{ textAlign: 'right' }}>
                      <b>{formatCompact(c.perf?.views || 0)}</b> vues<br />
                      <span className="muted">{formatCompact(c.perf?.clicks || 0)} clics</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="vside stack">
            <div className="panel">
              <h2 className="h3">Tarifs</h2>
              <p className="small muted" style={{ marginTop: -4 }}>Prix fixes payés par l'annonceur, commission incluse.</p>
              <div className="ratelist" role="radiogroup" aria-label="Choisir une offre">
                {i.rates.map((rate) => (
                  <button
                    key={rate.id}
                    type="button"
                    className={cn('rate', selected === rate.id && 'on')}
                    role="radio"
                    aria-checked={selected === rate.id}
                    onClick={() => setRateId(rate.id)}
                  >
                    <span style={{ width: 20, height: 20, display: 'inline-block' }}><Icon name={rate.net} /></span>
                    <span><b style={{ display: 'block', fontSize: '.92rem' }}>{rate.fmt}</b><span className="tiny muted">{NET[rate.net].l}</span></span>
                    <span className="p">{formatFcfa(rate.price)}</span>
                  </button>
                ))}
              </div>
              <p className="tiny muted" style={{ margin: '10px 0 0' }}>Publie le {(i.days ?? []).join(', ')} · délai de publication 72 h max.</p>
              {own ? <Link className="btn block ghost" style={{ marginTop: 14 }} to="/espace?tab=vitrine">Modifier ma vitrine</Link> : null}
              {!own && flags.v2 ? (
                <>
                  <button
                    type="button"
                    className="btn block gold"
                    style={{ marginTop: 14 }}
                    onClick={() => navigate(`/engager/${i.handle}?r=${selected}`, { state: { fresh: true } })}
                  >
                    <Icon name="lock" size={18} /> Engager cet influenceur
                  </button>
                  <button type="button" className="btn block ghost" style={{ marginTop: 8 }} onClick={() => setContactOpen(true)}>Proposer un partenariat</button>
                  {role === 'brand' ? (
                    <button type="button" className="btn block ghost" style={{ marginTop: 8 }} aria-pressed={Boolean(i.favorite)} onClick={() => toggleFavorite(i.id)}>
                      {i.favorite ? '♥ Dans ma sélection' : '♡ Ajouter à ma sélection'}
                    </button>
                  ) : null}
                </>
              ) : null}
              {!own && !flags.v2 ? (
                <button type="button" className="btn block" style={{ marginTop: 14 }} onClick={() => setContactOpen(true)}>Demander un devis</button>
              ) : null}
              {flags.v2 && !own ? (
                <div className="lockline" style={{ marginTop: 12, justifyContent: 'center' }}><Icon name="lock" size={18} />Payé seulement après la publication</div>
              ) : null}
            </div>
            <div className="panel" style={{ textAlign: 'center' }}>
              <QrCode
                value={link}
                label={`QR code de la vitrine de ${i.name}`}
                size={150}
                onReady={(canvas) => { canvasRef.current = canvas; }}
                style={{ width: 150, height: 150, margin: '0 auto', padding: 8, background: '#fff', borderRadius: 14, border: '1px solid var(--line)' }}
              />
              <p className="small" style={{ margin: '12px 0 4px', fontWeight: 700 }}>pullup.net/@{i.handle}</p>
              <div className="row" style={{ justifyContent: 'center' }}>
                <button type="button" className="btn sm ghost" onClick={copyLink}>Copier le lien</button>
                <button type="button" className="btn sm ghost" onClick={downloadQr}>Télécharger le QR</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <div style={{ height: 40 }} />
      <ContactDialog
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        influencer={i}
        v2={flags.v2}
        defaultFrom={session?.role === 'brand' ? session.name : ''}
      />
    </>
  );
}
