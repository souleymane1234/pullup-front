import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { PageSkeleton } from '@/components/feedback/Skeleton/Skeleton.jsx';
import { Avatar } from '@/components/ui/Avatar/Avatar.jsx';
import { Kpi, KpiGrid } from '@/components/ui/Kpi/Kpi.jsx';
import { StarRating } from '@/components/ui/StarRating/StarRating.jsx';
import { Vault } from '@/components/ui/Vault/Vault.jsx';
import { HELD_STATUSES, NET, OBJ, PAY, STATUS } from '@/domain/catalog.js';
import { trackingUrl } from '@/domain/utm.js';
import { useSession } from '@/features/auth/index.js';
import { CampaignMessages } from '@/features/messaging/index.js';
import { copyText } from '@/lib/browser.js';
import { cn } from '@/lib/cn.js';
import { formatCompact, formatDateTime, formatDay, formatFcfa, formatPercent } from '@/lib/format.js';
import { toast } from '@/lib/toast.js';
import { CampaignActions } from '../components/CampaignActions.jsx';
import { CampaignStatus } from '../components/CampaignStatus.jsx';
import { ReviewForm } from '../components/ReviewForm.jsx';
import { useCampaign, useCampaignPayment } from '../hooks/useCampaigns.js';

const STEPS = ['Payée', 'Acceptée', 'Publiée', 'Fonds libérés'];

function Tracker({ status }) {
  const step = STATUS[status]?.step ?? 0;
  return (
    <ol className="tracker" aria-label="Progression de la campagne">
      {STEPS.map((label, k) => {
        const done = k < step || status === 'completed';
        const current = k === step && status !== 'completed';
        return (
          <li key={label} className={cn('st', done && 'done', current && 'cur')} aria-current={current ? 'step' : undefined}>
            {label}
          </li>
        );
      })}
    </ol>
  );
}

export function CampaignPage() {
  const { id = '' } = useParams();
  const { role, isPending: sessionPending } = useSession();
  const { data, isPending } = useCampaign(id);
  const awaiting = data?.campaign?.status === 'awaiting_payment';
  const payment = useCampaignPayment(id, Boolean(awaiting));
  const queryClient = useQueryClient();

  useEffect(() => {
    if (payment.data?.status === 'paid') {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
    }
  }, [payment.data?.status, id, queryClient]);

  if (isPending || sessionPending) return <PageSkeleton />;
  if (!data || data.access === 'missing') {
    return (
      <div className="wrap section empty">
        <h1 className="h4">Campagne introuvable</h1>
        <Link className="btn" to="/espace">Mes campagnes</Link>
      </div>
    );
  }
  if (data.access === 'forbidden') {
    return (
      <div className="wrap section empty">
        <h1 className="h4">Vous n'avez pas accès à cette campagne</h1>
        <Link className="btn" to={`/connexion?next=/c/${id}`}>Changer de compte</Link>
      </div>
    );
  }

  const c = data.campaign;
  if (c.status === 'awaiting_payment') {
    if (payment.data?.status === 'cancelled') {
      return (
        <div className="wrap section empty">
          <h1 className="h4">Paiement non abouti</h1>
          <p>Le montant éventuellement pris sur votre solde a été recrédité.</p>
          <Link className="btn" to="/espace?tab=campagnes">Mes campagnes</Link>
        </div>
      );
    }
    return (
      <div className="wrap section" style={{ maxWidth: 520 }}>
        <div className="panel" style={{ textAlign: 'center' }} role="status">
          <span className="think" aria-hidden="true"><i /><i /><i /></span>
          <h1 className="h3">Confirmez le paiement sur votre téléphone</h1>
          <p className="muted">Nous interrogeons le statut du paiement. Cette page se met à jour dès que le mobile money est confirmé.</p>
          <p className="small muted">Réf. {c.ref}</p>
        </div>
      </div>
    );
  }
  const step = STATUS[c.status]?.step ?? 0;
  const held = HELD_STATUSES.includes(c.status);
  const perf = c.perf;
  let vaultTitle = 'Fonds remboursés';
  if (held) vaultTitle = 'Fonds sous séquestre';
  else if (c.status === 'completed') vaultTitle = 'Fonds libérés';

  return (
    <div className="wrap" style={{ padding: '30px 20px 60px' }}>
      <div className="crumbs muted small">
        <Link to={role === 'admin' ? '/admin?tab=camps' : '/espace?tab=campagnes'}>← Campagnes</Link>
      </div>
      <div className="row between" style={{ margin: '10px 0 20px', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.6rem,3.2vw,2.3rem)', margin: 0 }}>{c.brief.title || 'Campagne sans titre'}</h1>
          <div className="muted small">Réf. {c.ref} · créée le {formatDay(c.createdAt)}</div>
        </div>
        <CampaignStatus status={c.status} />
      </div>
      <div className="vlayout">
        <div className="stack">
          {step ? (
            <div className="panel">
              <Tracker status={c.status} />
              {c.status === 'dispute' ? (
                <div className="banner" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', marginTop: 16 }}>
                  <span><b>Litige :</b> {c.disputeReason} Les fonds restent bloqués jusqu'à la décision de PULLUP.</span>
                </div>
              ) : null}
              {c.status === 'published' && role !== 'admin' ? (
                <p className="small muted" style={{ margin: '14px 0 0' }}>Sans réponse de l'annonceur, les fonds sont libérés automatiquement 72 h après la preuve.</p>
              ) : null}
            </div>
          ) : null}

          <CampaignActions campaign={c} role={role} />

          <div className="panel">
            <div className="row" style={{ gap: 14 }}>
              <Avatar {...c.influencer} size={52} />
              <div className="grow" style={{ minWidth: 150 }}>
                <b>{c.influencer.name}</b>
                <div className="small muted">{c.offer.fmt} · {NET[c.offer.net].l}</div>
              </div>
              <div className="small" style={{ textAlign: 'right' }}>Annonceur<br /><b>{c.brand.name}</b></div>
            </div>
            <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '18px 0' }} />
            <h2 className="h4">Brief</h2>
            <div className="grid2 small" style={{ marginBottom: 10 }}>
              <div><span className="muted">Objectif</span><br /><b>{OBJ[c.brief.objective] || '—'}</b></div>
              <div><span className="muted">Publication prévue</span><br /><b>{c.brief.date ? formatDay(c.brief.date) : 'Dès que possible'}</b></div>
            </div>
            <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{c.brief.text || 'Aucune consigne particulière.'}</p>
            {c.brief.file ? (
              <p className="small" style={{ margin: '8px 0 0' }}>
                Pièce jointe : {/^https?:\/\//.test(c.brief.file)
                  ? <a href={c.brief.file} target="_blank" rel="noopener noreferrer">{decodeURIComponent(c.brief.file.split('/').pop() || 'fichier')}</a>
                  : c.brief.file}
              </p>
            ) : null}
            <div style={{ marginTop: 16 }}>
              <label className="f" htmlFor="utm-link">Lien de suivi (clics comptés)</label>
              <div className="row" style={{ flexWrap: 'nowrap' }}>
                <input id="utm-link" className="inp small" readOnly value={trackingUrl(c.ref) || c.utm} />
                <button type="button" className="btn sm ghost" onClick={async () => toast((await copyText(trackingUrl(c.ref) || c.utm)) ? 'Lien copié.' : (trackingUrl(c.ref) || c.utm))}>Copier</button>
              </div>
              {c.utm ? <p className="tiny muted" style={{ margin: '6px 0 0' }}>Destination : {c.utm}</p> : null}
            </div>
          </div>

          {c.proof ? (
            <div className="panel">
              <h2 className="h4">Preuve de publication</h2>
              <p className="small" style={{ margin: 0 }}><a href={c.proof.url} target="_blank" rel="noopener noreferrer">{c.proof.url}</a></p>
              <p className="small muted" style={{ margin: '6px 0 0' }}>{c.proof.note} · envoyée le {formatDateTime(c.proof.at)}</p>
            </div>
          ) : null}

          {perf ? (
            <div className="panel">
              <h2 className="h4">Performance</h2>
              <KpiGrid style={{ marginTop: 10 }}>
                <Kpi value={formatCompact(perf.views)} label="vues" />
                <Kpi value={formatPercent(((perf.likes + perf.comments + perf.shares) / perf.views) * 100)} label="taux d'engagement" />
                <Kpi value={formatCompact(perf.clicks)} label="clics sur le lien UTM" />
                <Kpi value={formatFcfa((c.amount / perf.views) * 1000)} label="coût pour 1 000 vues" />
              </KpiGrid>
            </div>
          ) : null}

          {c.status === 'completed' && role === 'brand' && !c.review ? (
            <ReviewForm campaignId={c.id} influencerName={c.influencer.name} />
          ) : null}
          {c.review ? (
            <div className="panel">
              <h2 className="h4">Avis de l'annonceur</h2>
              <StarRating value={c.review.stars} label="Note" />
              <p className="small" style={{ margin: '6px 0 0' }}>{c.review.text}</p>
            </div>
          ) : null}

          <CampaignMessages campaignId={c.id} messages={c.msgs || []} role={role} names={{ brand: c.brand.name, influencer: c.influencer.name }} />

          <div className="panel">
            <h2 className="h4">Historique</h2>
            <div className="log">
              {[...c.log].reverse().map((entry) => (
                <div key={`${entry.at}-${entry.s}`}><b>{entry.n}</b><br /><span className="tiny muted">{formatDateTime(entry.at)}</span></div>
              ))}
            </div>
          </div>
        </div>
        <aside className="vside">
          <Vault
            title={vaultTitle}
            amount={formatFcfa(c.amount)}
            lines={[
              { label: `Payé par ${c.brand.name}`, value: formatFcfa(c.amount) },
              { label: 'Commission PULLUP', value: formatFcfa(c.fee) },
              { label: `Pour ${c.influencer.name}`, value: formatFcfa(c.payout) },
              { label: 'Moyen de paiement', value: PAY.find((p) => p.k === c.pay)?.l || '—' },
            ]}
          />
        </aside>
      </div>
    </div>
  );
}
