import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar/Avatar.jsx';
import { Bars } from '@/components/ui/Bars/Bars.jsx';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Kpi, KpiGrid } from '@/components/ui/Kpi/Kpi.jsx';
import { Pill } from '@/components/ui/Pill/Pill.jsx';
import { Switch } from '@/components/ui/Switch/Switch.jsx';
import { Table } from '@/components/ui/Table/Table.jsx';
import { HELD_STATUSES, PLANS, REFUNDED_STATUSES, STATUS } from '@/domain/catalog.js';
import { avatarOf, catLabel, totalFollowers } from '@/domain/metrics.js';
import { CampaignStatus, useAutoValidate } from '@/features/campaigns/index.js';
import { NetworkRow, useSetPhoto } from '@/features/influencers/index.js';
import { useResetDemo, useSetFlag } from '@/features/platform/index.js';
import { cropSquare } from '@/lib/browser.js';
import { formatCompact, formatFcfa } from '@/lib/format.js';
import { toast } from '@/lib/toast.js';
import { isRemote } from '@/services/remote.js';
import { useCertifyInfluencer, useRejectInfluencer, useSuspendInfluencer, useUpdateScores, useVerifyInfluencer } from '../hooks/useAdmin.js';
import { DashHeader } from '@/components/layout/DashHeader/DashHeader.jsx';
import { Input } from '@/components/ui/Input/Input.jsx';
import { Modal } from '@/components/ui/Modal/Modal.jsx';

/** @param {{ data: any, onVerify: () => void }} props */
export function AdminOverview({ data, onVerify }) {
  const C = data.campaigns;
  const held = C.filter((c) => HELD_STATUSES.includes(c.status)).reduce((sum, c) => sum + c.amount, 0);
  const gmv = C.filter((c) => !REFUNDED_STATUSES.includes(c.status)).reduce((sum, c) => sum + c.amount, 0);
  const fees = C.filter((c) => c.status === 'completed').reduce((sum, c) => sum + c.fee, 0);
  const subs = data.brands.reduce((sum, b) => sum + (PLANS[b.plan]?.p ?? 0), 0);
  const pending = data.influencers.filter((i) => i.status === 'pending');
  const disputes = C.filter((c) => c.status === 'dispute');
  const split = Object.entries(STATUS)
    .filter(([key]) => key !== 'request' && key !== 'awaiting_payment')
    .map(([key, s]) => ({ label: s.l.split(' · ')[0], count: C.filter((c) => c.status === key).length }))
    .filter((row) => row.count)
    .map((row) => ({ label: row.label, value: C.length ? Math.round((row.count / C.length) * 100) : 0 }));

  return (
    <>
      <DashHeader title="Tableau de bord" subtitle="Activité de la plateforme et points à traiter." />
      <KpiGrid>
        <Kpi value={formatFcfa(gmv)} label="volume de campagnes" />
        <Kpi value={formatFcfa(held)} label="sous séquestre" />
        <Kpi value={formatFcfa(fees)} label="commissions encaissées" />
        <Kpi value={formatFcfa(subs)} label="abonnements / mois" />
        <Kpi value={data.influencers.filter((i) => i.verified).length} label="influenceurs vérifiés" />
        <Kpi value={data.brands.length} label="annonceurs" />
      </KpiGrid>
      {disputes.length || pending.length ? (
        <div className="panel" style={{ marginTop: 20 }}>
          <h3 className="h4">À traiter</h3>
          {disputes.map((c) => (
            <Link key={c.id} className="camp" to={`/c/${c.id}`} style={{ gridTemplateColumns: '1fr auto' }}>
              <div>
                <b>Litige {c.ref}</b>
                <div className="small muted">{c.brand.name} × {c.influencer.name} · {formatFcfa(c.amount)}</div>
              </div>
              <CampaignStatus status={c.status} />
            </Link>
          ))}
          {pending.map((i) => (
            <div key={i.id} className="camp" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
              <Avatar {...avatarOf(i)} size={40} />
              <div>
                <b>{i.name}</b>
                <div className="small muted">Nouvelle inscription · {formatCompact(totalFollowers(i))} abonnés</div>
              </div>
              <Button size="sm" onClick={onVerify}>Vérifier</Button>
            </div>
          ))}
        </div>
      ) : null}
      <div className="panel" style={{ marginTop: 20 }}>
        <h3 className="h4">Répartition des campagnes</h3>
        <Bars items={split} />
      </div>
    </>
  );
}

const FLAGS = [
  ['v1', 'V1 · Vitrine influenceur', 'Pages publiques, tarifs, QR code, statistiques d\'audience, demandes de devis. Socle permanent.'],
  ['v2', 'V2 · Engagement et paiement sous séquestre', 'Réservation en ligne, paiement mobile money et carte, fonds bloqués jusqu\'à la preuve de publication, portefeuille et retraits.'],
  ['v3', 'V3 · Matching IA', 'Note de compatibilité marque × influenceur, prédiction de portée, analyse IA du brief, formules d\'abonnement.'],
];

/** @param {{ flags: Record<string, boolean> }} props */
export function AdminFlags({ flags }) {
  const navigate = useNavigate();
  const setFlag = useSetFlag();
  const reset = useResetDemo(() => navigate('/'));
  const onReset = () => {
    if (window.confirm('Réinitialiser toutes les données de démonstration ?')) reset.mutate();
  };
  return (
    <>
      <DashHeader
        title="Fonctionnalités évolutives"
        subtitle="Activez chaque version au bon moment : le changement est immédiat sur tout le site."
      />
      <div className="panel">
        {FLAGS.map(([key, title, text]) => (
          <div key={key} className="flag">
            <div className="grow">
              <h3 className="h4" style={{ margin: 0 }}>{title}</h3>
              <p className="small muted" style={{ margin: '4px 0 0' }}>{text}</p>
            </div>
            <Switch
              label={title}
              checked={key === 'v1' ? true : Boolean(flags[key])}
              disabled={key === 'v1' || setFlag.isPending}
              onChange={(value) => setFlag.mutate({ key, value })}
            />
          </div>
        ))}
      </div>
      {isRemote() ? null : (
        <div className="panel flat" style={{ marginTop: 18 }}>
          <h3 className="h4">Données de démonstration</h3>
          <p className="small muted">Remet la plateforme dans son état initial (influenceurs, campagnes, soldes).</p>
          <Button size="sm" variant="danger" loading={reset.isPending} onClick={onReset}>Réinitialiser la démo</Button>
        </div>
      )}
    </>
  );
}

/** @param {{ influencers: any[] }} props */
export function AdminVerification({ influencers }) {
  const verify = useVerifyInfluencer();
  const reject = useRejectInfluencer();
  const suspend = useSuspendInfluencer();
  const certify = useCertifyInfluencer();
  const scores = useUpdateScores();
  const [draft, setDraft] = useState(/** @type {{ id: string, name: string, auth: number, creat: number, brief: number, onTime: number }|null} */ (null));
  const pending = influencers.filter((i) => i.status === 'pending');
  const listed = influencers.filter((i) => i.status === 'active' || i.status === 'suspended');
  const busy = verify.isPending || reject.isPending || suspend.isPending || certify.isPending || scores.isPending;

  const onReject = (id) => {
    const reason = window.prompt('Motif du refus (optionnel) :');
    if (reason === null) return;
    reject.mutate({ id, reason });
  };
  const onSuspend = (id) => {
    const reason = window.prompt('Motif de la suspension :');
    if (reason === null) return;
    if (!reason.trim()) {
      toast('Indiquez le motif de la suspension.');
      return;
    }
    suspend.mutate({ id, reason });
  };

  return (
    <>
      <DashHeader title="Vérification des influenceurs" subtitle="Validez les inscriptions, certifiez, suspendez ou corrigez les scores." />
      {pending.length ? pending.map((i) => (
        <div key={i.id} className="panel" style={{ marginBottom: 14 }}>
          <div className="row">
            <Avatar {...avatarOf(i)} size={52} />
            <div className="grow">
              <b>{i.name}</b> <span className="muted small">@{i.handle}</span>
              <div className="small muted">{i.city} · {(i.cats ?? []).map(catLabel).join(', ')}</div>
            </div>
          </div>
          <NetworkRow net={i.net ?? {}} />
          <p className="small" style={{ margin: '10px 0' }}>{i.bio}</p>
          <div className="row">
            <Button size="sm" variant="ok" disabled={busy} onClick={() => verify.mutate(i.id)}>Valider le profil</Button>
            <Button size="sm" variant="danger" disabled={busy} onClick={() => onReject(i.id)}>Refuser</Button>
            <Link className="btn sm ghost" to={`/i/${i.handle}`}>Voir la vitrine</Link>
          </div>
        </div>
      )) : (
        <div className="panel empty">
          <h3 className="h4">Aucun profil en attente</h3>
          <p>Les nouvelles inscriptions d'influenceurs apparaîtront ici.</p>
        </div>
      )}
      <div className="panel" style={{ marginTop: 18 }}>
        <h3 className="h4">Profils actifs</h3>
        {listed.map((i) => (
          <div key={i.id} className="camp" style={{ gridTemplateColumns: 'auto 1fr auto', alignItems: 'center' }}>
            <Avatar {...avatarOf(i)} size={40} />
            <div>
              <b>{i.name}</b> <span className="muted small">@{i.handle}</span>
              {' '}{i.certified ? <Pill tone="info" dot={false}>Certifié</Pill> : null}
              {i.status === 'suspended' ? <Pill tone="danger">Masqué</Pill> : null}
              <div className="tiny muted">Auth. {i.auth} % · créativité {i.creat} · briefs {i.brief} % · délais {i.onTime} %</div>
            </div>
            <div className="row" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {i.status === 'active' && !i.certified ? (
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => certify.mutate(i.id)}>Certifier</Button>
              ) : null}
              {i.status === 'active' ? (
                <Button size="sm" variant="danger" disabled={busy} onClick={() => onSuspend(i.id)}>Suspendre</Button>
              ) : null}
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => setDraft({ id: i.id, name: i.name, auth: i.auth, creat: i.creat, brief: i.brief, onTime: i.onTime })}>Scores</Button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={Boolean(draft)} onClose={() => setDraft(null)} title={draft ? `Scores · ${draft.name}` : 'Scores'}>
        {draft ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              scores.mutate(
                { id: draft.id, auth: Number(draft.auth), creat: Number(draft.creat), brief: Number(draft.brief), onTime: Number(draft.onTime) },
                { onSuccess: () => setDraft(null) },
              );
            }}
          >
            <div className="grid2">
              <Input label="Authenticité (0–100)" type="number" min={0} max={100} value={draft.auth} onChange={(e) => setDraft((d) => ({ ...d, auth: e.target.value }))} />
              <Input label="Créativité (0–5)" type="number" min={0} max={5} step={0.1} value={draft.creat} onChange={(e) => setDraft((d) => ({ ...d, creat: e.target.value }))} />
              <Input label="Briefs (0–100)" type="number" min={0} max={100} value={draft.brief} onChange={(e) => setDraft((d) => ({ ...d, brief: e.target.value }))} />
              <Input label="Délais (0–100)" type="number" min={0} max={100} value={draft.onTime} onChange={(e) => setDraft((d) => ({ ...d, onTime: e.target.value }))} />
            </div>
            <Modal.Footer>
              <Button variant="ghost" onClick={() => setDraft(null)}>Annuler</Button>
              <Button type="submit" loading={scores.isPending}>Enregistrer</Button>
            </Modal.Footer>
          </form>
        ) : null}
      </Modal>
    </>
  );
}

/** @param {{ influencers: any[] }} props */
export function AdminPhotos({ influencers }) {
  const photo = useSetPhoto();
  const [consent, setConsent] = useState(false);
  const onFile = async (id, event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!consent) {
      toast("Cochez la case : j'ai l'accord écrit de l'influenceur.");
      return;
    }
    try {
      photo.mutate({ id, photo: await cropSquare(file), consent: true });
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Image illisible.');
    }
  };
  return (
    <>
      <DashHeader
        title="Photos des profils"
        subtitle="Uniquement avec l'accord écrit de l'influenceur (droit à l'image). Recadrage automatique."
      />
      <label className="row" style={{ gap: 8, marginBottom: 16 }}>
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
        <span>J'ai l'accord écrit de l'influenceur</span>
      </label>
      <div className="photo-grid">
        {influencers.map((i) => (
          <div key={i.id} className="panel">
            <Avatar {...avatarOf(i)} size={88} />
            <b className="small">{i.name}</b>
            <label className="btn sm ghost" htmlFor={`ph-${i.id}`} style={{ cursor: 'pointer' }}>
              {i.photo ? 'Changer' : 'Ajouter une photo'}
              <span className="sr"> pour {i.name}</span>
            </label>
            <input className="sr" id={`ph-${i.id}`} type="file" accept="image/*" onChange={(event) => onFile(i.id, event)} />
            {i.photo ? (
              <Button size="sm" variant="danger" disabled={photo.isPending} onClick={() => photo.mutate({ id: i.id, photo: null, consent: true })} aria-label={`Retirer la photo de ${i.name}`}>
                Retirer
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}

const CAMP_COLUMNS = [
  { key: 'ref', header: 'Réf.' },
  { key: 'brand', header: 'Annonceur' },
  { key: 'influencer', header: 'Influenceur' },
  { key: 'amount', header: 'Montant' },
  { key: 'fee', header: 'Commission' },
  { key: 'status', header: 'Statut' },
];

/** @param {{ campaigns: any[] }} props */
export function AdminCampaigns({ campaigns }) {
  const auto = useAutoValidate();
  const rows = campaigns.map((c) => ({
    id: c.id,
    ref: <Link to={`/c/${c.id}`}>{c.ref}</Link>,
    brand: c.brand?.name ?? 'Annonceur',
    influencer: c.influencer?.name ?? 'Influenceur',
    amount: formatFcfa(c.amount),
    fee: formatFcfa(c.fee),
    status: <CampaignStatus status={c.status} />,
  }));
  return (
    <>
      <DashHeader title="Toutes les campagnes" subtitle={`${campaigns.length} campagnes sur la plateforme.`} />
      <div className="panel">
        <Table columns={CAMP_COLUMNS} rows={rows} caption="Toutes les campagnes" emptyText="Aucune campagne." />
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        <Button size="sm" variant="ghost" loading={auto.isPending} onClick={() => auto.mutate()}>
          Libérer les publications de plus de 72 h
        </Button>
      </div>
    </>
  );
}
