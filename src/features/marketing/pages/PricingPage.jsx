import { Orbs } from '@/components/ui/Decor/Decor.jsx';
import { Pill } from '@/components/ui/Pill/Pill.jsx';
import { BOOSTS } from '@/domain/catalog.js';
import { useSession } from '@/features/auth/index.js';
import { formatFcfa } from '@/lib/format.js';
import { PlansGrid } from '../components/PlansGrid.jsx';
import { usePickPlan } from '../hooks/usePickPlan.js';

const BOOST_LABELS = {
  'Influenceur Pro': 'Influenceur Pro · visibilité + publicité',
  Certifié: 'Certifié · badge + priorité',
  'Analytics avancées': 'Analytics avancées',
};

export function PricingPage() {
  const { session, role } = useSession();
  const pick = usePickPlan();
  const isBrand = role === 'brand';

  return (
    <>
      <section className="vhead">
        <Orbs />
        <div className="wrap" style={{ paddingBottom: 46 }}>
          <h1 style={{ fontSize: 'clamp(1.9rem,4vw,2.8rem)' }}>Des tarifs simples</h1>
          <p style={{ opacity: 0.9, margin: 0, maxWidth: '58ch' }}>
            Commencez gratuitement. Vous ne payez une campagne qu'au prix affiché par l'influenceur ; PULLUP se rémunère par une commission et des options.
          </p>
        </div>
      </section>
      <div className="wrap" style={{ padding: '30px 20px 60px' }}>
        <h2>Pour les annonceurs</h2>
        <PlansGrid current={isBrand ? session?.plan : null} canPick={isBrand} onPick={pick.mutate} pending={pick.isPending} />
        <div className="grid2" style={{ marginTop: 40, gap: 30 }}>
          <div>
            <h2>Commission sur les campagnes</h2>
            <div className="panel">
              <table className="table">
                <caption className="sr">Commission PULLUP</caption>
                <tbody>
                  <tr><td>Campagne standard</td><td style={{ textAlign: 'right' }}><b>15 %</b></td></tr>
                  <tr>
                    <td>Campagne premium <Pill tone="mute" dot={false}>Bientôt, sur devis</Pill></td>
                    <td style={{ textAlign: 'right' }}><b>20 %</b></td>
                  </tr>
                </tbody>
              </table>
              <p className="small muted" style={{ margin: '12px 0 0' }}>
                L'annonceur paie le prix de la vitrine. PULLUP encaisse, garde la commission et reverse le reste à l'influenceur à la validation.
              </p>
            </div>
          </div>
          <div>
            <h2>Pour les influenceurs</h2>
            <div className="panel">
              <p className="small muted" style={{ marginTop: 0 }}>Inscription et vitrine gratuites. Options mensuelles :</p>
              <table className="table">
                <caption className="sr">Options influenceurs</caption>
                <tbody>
                  {BOOSTS.map((boost) => (
                    <tr key={boost.k}>
                      <td>{BOOST_LABELS[boost.l] ?? boost.l}</td>
                      <td style={{ textAlign: 'right' }}>{formatFcfa(boost.p)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
