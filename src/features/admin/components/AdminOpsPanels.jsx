import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashHeader } from '@/components/layout/DashHeader/DashHeader.jsx';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Input } from '@/components/ui/Input/Input.jsx';
import { Kpi, KpiGrid } from '@/components/ui/Kpi/Kpi.jsx';
import { Modal } from '@/components/ui/Modal/Modal.jsx';
import { Pill } from '@/components/ui/Pill/Pill.jsx';
import { Table } from '@/components/ui/Table/Table.jsx';
import { PAY, PLANS } from '@/domain/catalog.js';
import { saveFile } from '@/lib/browser.js';
import { formatDateTime, formatFcfa } from '@/lib/format.js';
import { toast } from '@/lib/toast.js';
import { downloadLedgerCsv } from '../api/admin.api.js';
import { useAuditLog, useCreditBrand, useFinanceSummary, useRetryWithdrawal, useWithdrawals } from '../hooks/useAdmin.js';

const WITHDRAW_STATUS = {
  pending: { l: 'En attente', tone: 'warn' },
  sent: { l: 'Envoyé', tone: 'ok' },
  failed: { l: 'Échec', tone: 'danger' },
};

const ACTION_LABELS = {
  influencer_verify: 'Vérification',
  influencer_reject: 'Refus',
  influencer_suspend: 'Suspension',
  influencer_certify: 'Certification',
  influencer_scores: 'Scores',
  influencer_photo_update: 'Photo',
  influencer_photo_remove: 'Photo retirée',
  brand_credit: 'Crédit annonceur',
  withdrawal_retry: 'Relance retrait',
};

function payLabel(operator) {
  return PAY.find((item) => item.k === operator)?.l ?? operator;
}

export function AdminFinance({ active }) {
  const { data, isPending, isError, refetch } = useFinanceSummary(active);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [exporting, setExporting] = useState(false);

  const onExport = async () => {
    setExporting(true);
    try {
      const blob = await downloadLedgerCsv({ from, to });
      saveFile(`pullup-grand-livre.csv`, blob);
      toast('Grand livre téléchargé.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Export impossible.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <DashHeader title="Finance" subtitle="Séquestre, commissions du mois, retraits en attente et grand livre." />
      {isPending ? <p className="muted">Chargement…</p> : null}
      {isError ? (
        <div className="panel empty">
          <h3 className="h4">Impossible de charger la synthèse</h3>
          <Button size="sm" variant="ghost" onClick={() => refetch()}>Réessayer</Button>
        </div>
      ) : null}
      {data ? (
        <>
          <KpiGrid>
            <Kpi value={formatFcfa(data.escrow)} label="sous séquestre" />
            <Kpi value={formatFcfa(data.commissionsMonth)} label="commissions ce mois" />
            <Kpi value={formatFcfa(data.pendingWithdrawals)} label="retraits en attente" />
            <Kpi value={data.gaps.length} label="écarts de réconciliation" />
          </KpiGrid>
          {data.gaps.length ? (
            <div className="panel" style={{ marginTop: 18 }}>
              <h3 className="h4">Écarts soldes / grand livre</h3>
              <ul>{data.gaps.map((gap) => <li key={gap}>{gap}</li>)}</ul>
            </div>
          ) : (
            <p className="small muted" style={{ marginTop: 12 }}>Aucun écart entre les soldes et le grand livre.</p>
          )}
        </>
      ) : null}
      <div className="panel" style={{ marginTop: 20 }}>
        <h3 className="h4">Export du grand livre</h3>
        <div className="grid2">
          <Input label="Du" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input label="Au" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button size="sm" loading={exporting} onClick={onExport}>Télécharger le CSV</Button>
      </div>
    </>
  );
}

const WITHDRAW_COLUMNS = [
  { key: 'when', header: 'Date' },
  { key: 'who', header: 'Influenceur' },
  { key: 'amount', header: 'Montant' },
  { key: 'via', header: 'Opérateur' },
  { key: 'status', header: 'Statut' },
  { key: 'act', header: 'Action' },
];

export function AdminWithdrawals({ active }) {
  const [status, setStatus] = useState('');
  const { data = [], isPending, isError, refetch } = useWithdrawals(status, active);
  const retry = useRetryWithdrawal();
  const rows = data.map((row) => ({
    id: row.id,
    when: formatDateTime(row.createdAt),
    who: row.influencer?.handle
      ? <Link to={`/i/${row.influencer.handle}`}>{row.influencer.name}</Link>
      : (row.influencer?.name ?? row.influencerId),
    amount: formatFcfa(row.amount),
    via: `${payLabel(row.operator)} · ${row.phone}`,
    status: <Pill tone={WITHDRAW_STATUS[row.status]?.tone ?? 'mute'}>{WITHDRAW_STATUS[row.status]?.l ?? row.status}</Pill>,
    act: row.status === 'failed'
      ? <Button size="sm" variant="ghost" disabled={retry.isPending} onClick={() => retry.mutate(row.id)}>Relancer</Button>
      : '—',
  }));

  return (
    <>
      <DashHeader title="Retraits" subtitle="Demandes de virement mobile money, du plus récent au plus ancien." />
      <div className="row" style={{ marginBottom: 14 }}>
        <select className="inp" aria-label="Filtrer par statut" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="sent">Envoyés</option>
          <option value="failed">Échecs</option>
        </select>
      </div>
      {isError ? (
        <div className="panel empty">
          <h3 className="h4">Impossible de charger les retraits</h3>
          <Button size="sm" variant="ghost" onClick={() => refetch()}>Réessayer</Button>
        </div>
      ) : (
        <div className="panel">
          <Table
            columns={WITHDRAW_COLUMNS}
            rows={rows}
            caption="Retraits"
            status={isPending ? 'loading' : 'idle'}
            emptyText="Aucun retrait."
          />
        </div>
      )}
    </>
  );
}

const AUDIT_COLUMNS = [
  { key: 'when', header: 'Date' },
  { key: 'action', header: 'Action' },
  { key: 'target', header: 'Cible' },
  { key: 'reason', header: 'Motif' },
  { key: 'ip', header: 'IP' },
];

export function AdminAudit({ active }) {
  const [actor, setActor] = useState('');
  const [target, setTarget] = useState('');
  const { data = [], isPending, isError, refetch } = useAuditLog({ actor, target }, active);
  const rows = data.map((row) => ({
    id: row.id,
    when: formatDateTime(row.createdAt),
    action: ACTION_LABELS[row.action] ?? row.action,
    target: `${row.targetType} ${row.targetId}`,
    reason: row.data?.reason || '—',
    ip: row.ip || '—',
  }));

  return (
    <>
      <DashHeader title="Journal d'audit" subtitle="Avant / après, motif et adresse IP de chaque action d'administration." />
      <form className="row" style={{ marginBottom: 14 }} onSubmit={(event) => event.preventDefault()}>
        <Input label="Acteur" value={actor} onChange={(e) => setActor(e.target.value)} placeholder="Identifiant utilisateur" fieldStyle={{ margin: 0, flex: 1 }} />
        <Input label="Cible" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="id ou type" fieldStyle={{ margin: 0, flex: 1 }} />
      </form>
      {isError ? (
        <div className="panel empty">
          <h3 className="h4">Impossible de charger l'audit</h3>
          <Button size="sm" variant="ghost" onClick={() => refetch()}>Réessayer</Button>
        </div>
      ) : (
        <div className="panel">
          <Table
            columns={AUDIT_COLUMNS}
            rows={rows}
            caption="Journal d'audit"
            status={isPending ? 'loading' : 'idle'}
            emptyText="Aucun événement."
          />
        </div>
      )}
    </>
  );
}

const BRAND_COLUMNS = [
  { key: 'name', header: 'Annonceur' },
  { key: 'plan', header: 'Formule' },
  { key: 'balance', header: 'Solde' },
  { key: 'act', header: 'Action' },
];

/** @param {{ brands: any[] }} props */
export function AdminBrands({ brands }) {
  const credit = useCreditBrand();
  const [draft, setDraft] = useState(/** @type {{ id: string, name: string, amount: string, reason: string }|null} */ (null));
  const rows = brands.map((brand) => ({
    id: brand.id,
    name: (
      <div>
        <b>{brand.name}</b>
        <div className="tiny muted">{brand.contact} · {brand.email}</div>
      </div>
    ),
    plan: PLANS[brand.plan]?.l ?? brand.plan,
    balance: formatFcfa(brand.balance ?? 0),
    act: <Button size="sm" variant="ghost" onClick={() => setDraft({ id: brand.id, name: brand.name, amount: '', reason: '' })}>Créditer</Button>,
  }));

  return (
    <>
      <DashHeader title="Annonceurs" subtitle="Formules, soldes et gestes commerciaux." />
      <div className="panel">
        <Table columns={BRAND_COLUMNS} rows={rows} caption="Annonceurs" emptyText="Aucun annonceur." />
      </div>
      <Modal open={Boolean(draft)} onClose={() => setDraft(null)} title={draft ? `Crédit · ${draft.name}` : 'Crédit'}>
        {draft ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              credit.mutate(
                { id: draft.id, amount: Number(draft.amount), reason: draft.reason },
                { onSuccess: () => setDraft(null) },
              );
            }}
          >
            <Input label="Montant (FCFA)" type="number" min={1} step={1} value={draft.amount} onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))} required />
            <Input as="textarea" label="Motif" value={draft.reason} onChange={(e) => setDraft((d) => ({ ...d, reason: e.target.value }))} required />
            <Modal.Footer>
              <Button variant="ghost" onClick={() => setDraft(null)}>Annuler</Button>
              <Button type="submit" loading={credit.isPending}>Créditer le solde</Button>
            </Modal.Footer>
          </form>
        ) : null}
      </Modal>
    </>
  );
}
