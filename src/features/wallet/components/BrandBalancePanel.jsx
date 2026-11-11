import { Table } from '@/components/ui/Table/Table.jsx';
import { Vault } from '@/components/ui/Vault/Vault.jsx';
import { HELD_STATUSES, REFUNDED_STATUSES } from '@/domain/catalog.js';
import { CampaignStatus } from '@/features/campaigns/index.js';
import { formatDay, formatFcfa } from '@/lib/format.js';
import { DashHeader } from '@/components/layout/DashHeader/DashHeader.jsx';

const COLUMNS = [
  { key: 'date', header: 'Date' },
  { key: 'ref', header: 'Campagne' },
  { key: 'status', header: 'Statut' },
  { key: 'amount', header: 'Montant' },
];

/** @param {{ balance: number, campaigns: any[] }} props */
export function BrandBalancePanel({ balance, campaigns }) {
  const active = campaigns.filter((c) => HELD_STATUSES.includes(c.status));
  const held = active.reduce((sum, c) => sum + c.amount, 0);
  const rows = campaigns.map((c) => ({
    id: c.id,
    date: formatDay(c.createdAt),
    ref: c.ref,
    status: <CampaignStatus status={c.status} />,
    amount: `${REFUNDED_STATUSES.includes(c.status) ? '+ ' : '− '}${formatFcfa(c.amount)}`,
  }));

  return (
    <>
      <DashHeader title="Solde PULLUP" subtitle="Remboursements disponibles et fonds sous séquestre." />
      <div className="grid2">
        <Vault title={<span className="small">Disponible pour vos prochaines campagnes</span>} icon={null} amount={formatFcfa(balance)}>
          <p className="small" style={{ opacity: 0.85, margin: '10px 0 0' }}>
            Les remboursements (annulation, refus, litige) arrivent ici et sont utilisés en priorité au prochain paiement.
          </p>
        </Vault>
        <div className="panel">
          <h3 className="h4">Sous séquestre</h3>
          <div className="amt" style={{ fontFamily: 'var(--font-d)', fontSize: '1.8rem' }}>{formatFcfa(held)}</div>
          <p className="small muted">{active.length} campagne(s) en attente de publication ou de validation.</p>
        </div>
      </div>
      <div className="panel" style={{ marginTop: 18 }}>
        <h3 className="h4">Mouvements</h3>
        <Table columns={COLUMNS} rows={rows} caption="Mouvements du solde" emptyText="Aucun mouvement pour le moment." />
      </div>
    </>
  );
}
