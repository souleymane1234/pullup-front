import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Input } from '@/components/ui/Input/Input.jsx';
import { Table } from '@/components/ui/Table/Table.jsx';
import { Vault } from '@/components/ui/Vault/Vault.jsx';
import { PAY } from '@/domain/catalog.js';
import { formatDay, formatFcfa } from '@/lib/format.js';
import { useWithdraw } from '../hooks/useWallet.js';
import { withdrawSchema } from '../schemas/withdraw.schema.js';
import { DashHeader } from '@/components/layout/DashHeader/DashHeader.jsx';

const COLUMNS = [
  { key: 'date', header: 'Date' },
  { key: 'label', header: 'Libellé' },
  { key: 'amount', header: 'Montant' },
];

/** @param {{ wallet: { available: number, tx: any[] }, escrow: number }} props */
export function InfluencerWalletPanel({ wallet, escrow }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(withdrawSchema(wallet.available)),
    defaultValues: { amount: '', operator: 'om', phone: '' },
  });
  const { mutate, isPending } = useWithdraw(() => reset());

  const rows = wallet.tx.map((t, index) => ({
    id: `${t.at}-${index}`,
    date: formatDay(t.at),
    label: t.l,
    amount: <span style={{ color: t.t === 'in' ? 'var(--ok)' : 'var(--ink)' }}>{t.t === 'in' ? '+' : '−'} {formatFcfa(t.a)}</span>,
  }));

  return (
    <>
      <DashHeader title="Portefeuille" subtitle="Vos gains libérés et vos retraits vers le mobile money." />
      <div className="grid2">
        <Vault title="Disponible au retrait" icon={null} amount={formatFcfa(wallet.available)} lines={[{ label: 'Sous séquestre (à venir)', value: formatFcfa(escrow) }]} />
        <form className="panel" noValidate onSubmit={handleSubmit((values) => mutate(values))}>
          <h3 className="h4">Faire un retrait</h3>
          <Input label="Montant" type="number" min={1000} step={100} placeholder="Ex. 50 000" hint="Multiple de 100 FCFA, minimum 1 000 FCFA." error={errors.amount?.message} {...register('amount')} />
          <div className="grid2">
            <Input as="select" label="Opérateur" {...register('operator')}>
              {PAY.filter((p) => p.k !== 'card').map((p) => <option key={p.k} value={p.k}>{p.l}</option>)}
            </Input>
            <Input label="Numéro" inputMode="tel" placeholder="+225 07…" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
          </div>
          <Button type="submit" block loading={isPending}>Retirer vers mon mobile money</Button>
        </form>
      </div>
      <div className="panel" style={{ marginTop: 18 }}>
        <h3 className="h4">Historique des transactions</h3>
        <Table columns={COLUMNS} rows={rows} caption="Historique des transactions" emptyText="Vos gains apparaîtront ici après validation de vos campagnes." />
      </div>
    </>
  );
}
