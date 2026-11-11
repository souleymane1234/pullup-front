import { PageSkeleton } from '@/components/feedback/Skeleton/Skeleton.jsx';
import { DashLayout } from '@/components/layout/DashLayout/DashLayout.jsx';
import { useTabParam } from '@/hooks/useTabParam.js';
import { AdminCatalog } from '../components/AdminCatalog.jsx';
import { AdminAudit, AdminBrands, AdminFinance, AdminWithdrawals } from '../components/AdminOpsPanels.jsx';
import { AdminCampaigns, AdminFlags, AdminOverview, AdminPhotos, AdminVerification } from '../components/AdminPanels.jsx';
import { useAdminDashboard } from '../hooks/useAdmin.js';

const TABS = ['apercu', 'flags', 'verif', 'photos', 'camps', 'brands', 'catalogue', 'finance', 'retraits', 'audit'];

export function AdminPage() {
  const { data, isPending, isError, refetch } = useAdminDashboard();
  const [tab, select] = useTabParam(TABS);

  if (isPending) return <PageSkeleton />;
  if (isError || !data) {
    return (
      <div className="wrap section empty">
        <h1 className="h4">Impossible de charger le back-office</h1>
        <button type="button" className="btn ghost sm" onClick={() => refetch()}>Réessayer</button>
      </div>
    );
  }

  const pending = data.influencers.filter((i) => i.status === 'pending').length;
  const disputes = data.campaigns.filter((c) => c.status === 'dispute').length;

  return (
    <DashLayout
      label="Administration"
      current={tab}
      onSelect={select}
      tabs={[
        { key: 'apercu', label: 'Aperçu' },
        { key: 'flags', label: 'Fonctionnalités' },
        { key: 'verif', label: 'Vérifications', count: pending },
        { key: 'photos', label: 'Photos des profils' },
        { key: 'camps', label: 'Campagnes', count: disputes },
        { key: 'brands', label: 'Annonceurs' },
        { key: 'catalogue', label: 'Catalogue' },
        { key: 'finance', label: 'Finance' },
        { key: 'retraits', label: 'Retraits' },
        { key: 'audit', label: 'Audit' },
      ]}
    >
      {tab === 'apercu' ? <AdminOverview data={data} onVerify={() => select('verif')} /> : null}
      {tab === 'flags' ? <AdminFlags flags={data.flags} /> : null}
      {tab === 'verif' ? <AdminVerification influencers={data.influencers} /> : null}
      {tab === 'photos' ? <AdminPhotos influencers={data.influencers} /> : null}
      {tab === 'camps' ? <AdminCampaigns campaigns={data.campaigns} /> : null}
      {tab === 'brands' ? <AdminBrands brands={data.brands} /> : null}
      {tab === 'catalogue' ? <AdminCatalog active /> : null}
      {tab === 'finance' ? <AdminFinance active /> : null}
      {tab === 'retraits' ? <AdminWithdrawals active /> : null}
      {tab === 'audit' ? <AdminAudit active /> : null}
    </DashLayout>
  );
}
