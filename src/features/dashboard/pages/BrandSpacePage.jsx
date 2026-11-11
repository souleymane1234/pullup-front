import { Link } from 'react-router-dom';
import { PageSkeleton } from '@/components/feedback/Skeleton/Skeleton.jsx';
import { DashLayout } from '@/components/layout/DashLayout/DashLayout.jsx';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Icon } from '@/components/ui/Icon/Icon.jsx';
import { Kpi, KpiGrid } from '@/components/ui/Kpi/Kpi.jsx';
import { HELD_STATUSES, NET, PLANS, STATUS } from '@/domain/catalog.js';
import { firstName } from '@/domain/metrics.js';
import { AccountPanel } from '@/features/auth/index.js';
import { CampaignRow } from '@/features/campaigns/index.js';
import { PlansGrid } from '@/features/marketing/index.js';
import { useFlags } from '@/features/platform/index.js';
import { BrandBalancePanel, useSetPlan } from '@/features/wallet/index.js';
import { saveFile, toCsv } from '@/lib/browser.js';
import { formatCompact, formatFcfa } from '@/lib/format.js';
import { BrandProfile } from '../components/BrandProfile.jsx';
import { BrandSelection } from '../components/BrandSelection.jsx';
import { useTabParam } from '@/hooks/useTabParam.js';
import { useBrandSpace } from '../hooks/useSpaces.js';
import { DashHeader } from '@/components/layout/DashHeader/DashHeader.jsx';
import { canExportCampaignsCsv, downloadCampaignsCsv } from '../api/dashboard.api.js';
import { isRemote } from '@/services/remote.js';
import { toast } from '@/lib/toast.js';

const TABS = ['apercu', 'campagnes', 'selection', 'solde', 'plan', 'profil'];

async function exportCampaigns(campaigns, plan) {
  if (isRemote() && canExportCampaignsCsv(plan)) {
    try {
      const blob = await downloadCampaignsCsv();
      saveFile(`pullup-campagnes-${new Date().toISOString().slice(0, 10)}.csv`, blob);
      toast('Rapport CSV téléchargé.');
      return;
    } catch (error) {
      const status = /** @type {{ status?: number }} */ (error).status;
      toast(status === 403 ? 'L\'export CSV est réservé à la formule Business.' : (error instanceof Error ? error.message : 'Export impossible.'));
      return;
    }
  }
  const rows = [['Référence', 'Campagne', 'Influenceur', 'Réseau', 'Format', 'Montant FCFA', 'Statut', 'Vues', 'Interactions', 'Clics UTM', 'Créée le']];
  campaigns.forEach((c) => {
    const p = c.perf || {};
    rows.push([
      c.ref, c.brief.title, c.influencer.name, NET[c.offer.net].l, c.offer.fmt, c.amount, STATUS[c.status]?.l ?? c.status,
      p.views || 0, (p.likes || 0) + (p.comments || 0) + (p.shares || 0), p.clicks || 0,
      new Date(c.createdAt).toLocaleDateString('fr-FR'),
    ]);
  });
  saveFile(`pullup-campagnes-${new Date().toISOString().slice(0, 10)}.csv`, new Blob([toCsv(rows)], { type: 'text/csv' }));
}

function Overview({ brand, campaigns, v3 }) {
  const active = campaigns.filter((c) => HELD_STATUSES.includes(c.status));
  const toValidate = campaigns.filter((c) => c.status === 'published');
  const held = active.reduce((sum, c) => sum + c.amount, 0);
  const spent = campaigns.filter((c) => c.status === 'completed').reduce((sum, c) => sum + c.amount, 0);
  const reach = campaigns.reduce((sum, c) => sum + (c.perf?.views || 0), 0);
  const clicks = campaigns.reduce((sum, c) => sum + (c.perf?.clicks || 0), 0);
  return (
    <>
      <DashHeader title={`Bonjour ${firstName(brand.contact)}`} subtitle={`${brand.name} · formule ${PLANS[brand.plan].l}`} />
      {toValidate.length ? (
        <div className="banner" style={{ background: 'var(--orange-bg)', color: 'var(--orange)', marginBottom: 18 }}>
          <Icon name="bell" />
          <span>
            <b>{toValidate.length} publication{toValidate.length > 1 ? 's' : ''} à valider.</b> Sans réponse, les fonds sont libérés 72 h après la preuve.
          </span>
          <Link className="btn sm" style={{ marginLeft: 'auto' }} to={`/c/${toValidate[0].id}`}>Vérifier</Link>
        </div>
      ) : null}
      <KpiGrid>
        <Kpi value={active.length} label="campagnes en cours" />
        <Kpi value={formatFcfa(held)} label="sous séquestre" />
        <Kpi value={formatFcfa(spent)} label="dépensés" />
        <Kpi value={formatCompact(reach)} label="vues générées" />
        <Kpi value={formatCompact(clicks)} label="clics UTM" />
        <Kpi value={formatFcfa(brand.balance || 0)} label="solde PULLUP" />
      </KpiGrid>
      <div className="panel" style={{ marginTop: 20 }}>
        <div className="row between">
          <h3 style={{ margin: 0 }}>Campagnes récentes</h3>
          <Link className="btn sm" to={v3 ? '/matching' : '/influenceurs'}>Nouvelle campagne</Link>
        </div>
        {campaigns.length ? campaigns.slice(0, 5).map((c) => <CampaignRow key={c.id} campaign={c} perspective="brand" />) : (
          <div className="empty">
            <h4>Aucune campagne pour l'instant</h4>
            <p>Trouvez un influenceur et lancez votre première campagne dès 5 000 FCFA.</p>
          </div>
        )}
      </div>
    </>
  );
}

export function BrandSpacePage() {
  const flags = useFlags();
  const { data, isPending } = useBrandSpace();
  const [tab, select] = useTabParam(TABS);
  const setPlan = useSetPlan();

  if (isPending || !data) return <PageSkeleton />;
  const { brand, campaigns, favorites } = data;
  const toValidate = campaigns.filter((c) => c.status === 'published').length;

  let content = null;
  if (tab === 'apercu') content = <Overview brand={brand} campaigns={campaigns} v3={flags.v3} />;
  if (tab === 'campagnes') {
    content = (
      <>
        <DashHeader
          title="Mes campagnes"
          subtitle={`${campaigns.length} campagne${campaigns.length > 1 ? 's' : ''} au total`}
          actions={campaigns.length ? <Button size="sm" variant="ghost" onClick={() => exportCampaigns(campaigns, brand.plan)}>Exporter le rapport (CSV)</Button> : null}
        />
        <div className="panel">
          {campaigns.length
            ? campaigns.map((c) => <CampaignRow key={c.id} campaign={c} perspective="brand" />)
            : <div className="empty"><h3 className="h4">Aucune campagne</h3></div>}
        </div>
      </>
    );
  }
  if (tab === 'selection') content = <BrandSelection favorites={favorites} v2={flags.v2} />;
  if (tab === 'solde') content = <BrandBalancePanel balance={brand.balance || 0} campaigns={campaigns} />;
  if (tab === 'plan') {
    content = (
      <>
        <DashHeader title="Ma formule" subtitle={<>Formule actuelle : <b>{PLANS[brand.plan].l}</b>. Changez à tout moment, sans engagement.</>} />
        <PlansGrid current={brand.plan} canPick onPick={setPlan.mutate} pending={setPlan.isPending} />
      </>
    );
  }
  if (tab === 'profil') content = <><BrandProfile brand={brand} /><AccountPanel /></>;

  return (
    <DashLayout
      current={tab}
      onSelect={select}
      tabs={[
        { key: 'apercu', label: 'Aperçu' },
        { key: 'campagnes', label: 'Campagnes', count: toValidate },
        { key: 'selection', label: 'Ma sélection', count: favorites.length },
        { key: 'solde', label: 'Solde & séquestre' },
        { key: 'plan', label: 'Formule' },
        { key: 'profil', label: 'Profil' },
      ]}
    >
      {content}
    </DashLayout>
  );
}
