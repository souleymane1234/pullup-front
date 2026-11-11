import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageSkeleton } from '@/components/feedback/Skeleton/Skeleton.jsx';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Icon } from '@/components/ui/Icon/Icon.jsx';
import { Modal } from '@/components/ui/Modal/Modal.jsx';
import { Vault } from '@/components/ui/Vault/Vault.jsx';
import { COMMISSION, NET } from '@/domain/catalog.js';
import { firstName } from '@/domain/metrics.js';
import { useSession } from '@/features/auth/index.js';
import { useFlags } from '@/features/platform/index.js';
import { cn } from '@/lib/cn.js';
import { formatCompact, formatFcfa } from '@/lib/format.js';
import { BriefStep } from '../components/BriefStep.jsx';
import { PaymentStep } from '../components/PaymentStep.jsx';
import { useBookingContext, useBookingDraft, useCreateBooking } from '../hooks/useBooking.js';

const STEPS = ['Offre', 'Brief', 'Paiement'];
const PROCESSING_MS = 1400;

export function EngagePage() {
  const { handle = '' } = useParams();
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const flags = useFlags();
  const { role, isPending: sessionPending } = useSession();
  const { data, isPending } = useBookingContext(handle);
  const { draft, start, update, clear } = useBookingDraft();
  const [processing, setProcessing] = useState(false);
  const create = useCreateBooking((id) => {
    clear();
    navigate(`/c/${id}`);
  });

  const influencer = data?.influencer;
  const fresh = Boolean(location.state?.fresh);

  useEffect(() => {
    if (!influencer) return;
    if (fresh || !draft || draft.infId !== influencer.id) {
      const wanted = params.get('r');
      const rate = influencer.rates.some((r) => r.id === wanted) ? wanted : influencer.rates[0].id;
      start(influencer.id, rate, influencer.cats[0]);
      if (fresh) navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [influencer?.id, fresh]);

  if (isPending || sessionPending) return <PageSkeleton />;
  if (!influencer) {
    return (
      <div className="wrap section empty">
        <h1 className="h4">Profil introuvable</h1>
        <Link className="btn" to="/influenceurs">Voir l'annuaire</Link>
      </div>
    );
  }
  if (!flags.v2) {
    return (
      <div className="wrap section empty">
        <h1 className="h4">Le paiement en ligne n'est pas encore activé</h1>
        <p>Utilisez la demande de devis depuis la vitrine.</p>
        <Link className="btn" to={`/i/${handle}`}>Retour à la vitrine</Link>
      </div>
    );
  }
  if (role !== 'brand') {
    return (
      <div className="wrap section" style={{ maxWidth: 560 }}>
        <div className="panel" style={{ textAlign: 'center' }}>
          <h1 className="h3">Connectez-vous en tant qu'annonceur</h1>
          <p className="muted">Pour engager {influencer.name} et payer sous séquestre, il faut un compte annonceur.</p>
          <Link className="btn" to={`/connexion?next=${encodeURIComponent(`/engager/${handle}`)}`}>Se connecter</Link>
        </div>
      </div>
    );
  }
  if (!draft || draft.infId !== influencer.id) return <PageSkeleton />;

  const rate = influencer.rates.find((r) => r.id === draft.rate) ?? influencer.rates[0];
  const fee = Math.round(rate.price * COMMISSION);
  const fromBalance = Math.min(data.balance || 0, rate.price);

  const pay = (values) => {
    update(values);
    setProcessing(true);
    window.setTimeout(() => {
      setProcessing(false);
      const { title, objective, theme, text, link, date, file } = { ...draft, ...values };
      create.mutate({
        infId: influencer.id,
        rateId: rate.id,
        pay: values.pay,
        phone: values.phone,
        brief: { title, objective, theme, text, link, date, file },
      });
    }, PROCESSING_MS);
  };

  return (
    <div className="wrap" style={{ padding: '30px 20px 60px' }}>
      <div className="crumbs muted small"><Link to={`/i/${influencer.handle}`}>← Vitrine de {influencer.name}</Link></div>
      <h1 style={{ fontSize: 'clamp(1.7rem,3.5vw,2.4rem)', margin: '10px 0 20px' }}>Engager {influencer.name}</h1>
      <div className="vlayout">
        <div className="panel">
          <div className="wizard" role="img" aria-label={`Étape ${draft.step} sur 3 : ${STEPS[draft.step - 1]}`}>
            {STEPS.map((label, k) => <span key={label} className={k < draft.step ? 'on' : undefined} title={label} />)}
          </div>
          {draft.step === 1 ? (
            <>
              <h2 className="h3">Choisissez l'offre</h2>
              <div className="ratelist" role="radiogroup" aria-label="Offre">
                {influencer.rates.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={r.id === rate.id}
                    className={cn('rate', r.id === rate.id && 'on')}
                    onClick={() => update({ rate: r.id })}
                  >
                    <Icon name={r.net} size={20} />
                    <span>
                      <b style={{ display: 'block' }}>{r.fmt}</b>
                      <span className="tiny muted">{NET[r.net].l} · {formatCompact(influencer.net[r.net]?.[0] ?? 0)} abonnés</span>
                    </span>
                    <span className="p">{formatFcfa(r.price)}</span>
                  </button>
                ))}
              </div>
              <div className="row" style={{ justifyContent: 'flex-end', marginTop: 20 }}>
                <Button onClick={() => update({ step: 2 })}>Continuer vers le brief</Button>
              </div>
            </>
          ) : null}
          {draft.step === 2 ? (
            <BriefStep
              draft={draft}
              influencer={influencer}
              onBack={(values) => update({ ...values, step: 1 })}
              onNext={(values) => update({ ...values, step: 3 })}
            />
          ) : null}
          {draft.step === 3 ? (
            <PaymentStep
              draft={draft}
              influencerName={influencer.name}
              price={rate.price}
              fromBalance={fromBalance}
              onBack={(values) => update({ ...values, step: 2 })}
              onPay={pay}
            />
          ) : null}
        </div>
        <aside className="vside stack">
          <Vault
            title="Montant mis sous séquestre"
            amount={formatFcfa(rate.price)}
            lines={[
              { label: `${rate.fmt} · ${NET[rate.net].l}`, value: formatFcfa(rate.price) },
              { label: `Reversé à ${firstName(influencer.name)} à la validation`, value: formatFcfa(rate.price - fee) },
              { label: 'Commission PULLUP (15 %)', value: formatFcfa(fee) },
              ...(fromBalance ? [{ label: 'Payé avec votre solde', value: `− ${formatFcfa(fromBalance)}` }] : []),
            ]}
          />
          <div className="panel small">
            <h2 className="h4">Vos garanties</h2>
            <ul style={{ paddingLeft: 18, margin: 0, color: 'var(--muted)' }}>
              <li>Remboursement intégral si l'influenceur refuse ou ne publie pas sous 72 h.</li>
              <li>Annulation gratuite tant que rien n'est publié.</li>
              <li>Litige examiné par l'équipe PULLUP sous 48 h.</li>
            </ul>
          </div>
        </aside>
      </div>
      <Modal open={processing || create.isPending} onClose={() => {}} title="Confirmation du paiement">
        <div style={{ textAlign: 'center', padding: '10px 0' }} role="status">
          <span className="think" aria-hidden="true"><i /><i /><i /></span>
          <p className="muted small">Paiement en cours. Si une confirmation mobile money est demandée, validez-la sur votre téléphone.</p>
        </div>
      </Modal>
    </div>
  );
}
