import { useState } from 'react';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Icon } from '@/components/ui/Icon/Icon.jsx';
import { Input } from '@/components/ui/Input/Input.jsx';
import { Modal } from '@/components/ui/Modal/Modal.jsx';
import { Pill } from '@/components/ui/Pill/Pill.jsx';
import { PAY, PLANS } from '@/domain/catalog.js';
import { cn } from '@/lib/cn.js';
import { formatNumber } from '@/lib/format.js';

/**
 * Moyen de paiement pour une formule payante, comme à l'étape de réservation.
 * @param {{ planKey: string, pending: boolean, onClose: () => void, onConfirm: (input: { plan: string, pay: string, phone: string }) => void }} props
 */
function PlanPaymentDialog({ planKey, pending, onClose, onConfirm }) {
  const plan = PLANS[planKey];
  const [pay, setPay] = useState('om');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const operator = PAY.find((item) => item.k === pay) ?? PAY[0];

  const submit = (event) => {
    event.preventDefault();
    if (pay !== 'card' && phone.replace(/\D/g, '').length < 8) {
      setError('Saisissez un numéro de téléphone valide.');
      return;
    }
    setError('');
    onConfirm({ plan: planKey, pay, phone });
  };

  return (
    <Modal open onClose={onClose} title={`Formule ${plan.l}`}>
      <form noValidate onSubmit={submit}>
        <p className="small muted" style={{ marginTop: 0 }}>
          {formatNumber(plan.p)} FCFA / mois. Le solde PULLUP est utilisé en priorité, le reste est encaissé par {pay === 'card' ? 'carte' : operator.l}.
        </p>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="f">Moyen de paiement</legend>
          <div className="pay-ops" role="radiogroup" aria-label="Moyen de paiement">
            {PAY.map((item) => (
              <button
                key={item.k}
                type="button"
                role="radio"
                aria-checked={pay === item.k}
                className={cn('pay-op', pay === item.k && 'on')}
                onClick={() => setPay(item.k)}
              >
                {item.l}
              </button>
            ))}
          </div>
        </fieldset>
        {pay === 'card' ? (
          <p className="hint">Vous serez redirigé pour confirmer le paiement par carte.</p>
        ) : (
          <div style={{ marginTop: 12 }}>
            <Input
              label={`Numéro ${operator.l}`}
              inputMode="tel"
              autoComplete="tel"
              placeholder="07 00 00 00 00"
              value={phone}
              error={error}
              onChange={(event) => setPhone(event.target.value)}
            />
            <p className="hint">Confirmez le paiement sur votre téléphone.</p>
          </div>
        )}
        <Modal.Footer>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={pending}><Icon name="lock" size={16} /> Activer {plan.l}</Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

/**
 * Grille des formules annonceur.
 * @param {{ current?: string|null, canPick?: boolean, onPick?: (input: string | { plan: string, pay: string, phone: string }) => void, pending?: boolean }} props
 */
export function PlansGrid({ current = null, canPick = false, onPick, pending = false }) {
  const [choice, setChoice] = useState(/** @type {string|null} */ (null));

  const choose = (key) => {
    if (!PLANS[key]?.p) {
      onPick?.(key);
      return;
    }
    setChoice(key);
  };

  return (
    <>
      <div className="roadmap">
        {Object.entries(PLANS).map(([key, plan]) => (
          <div key={key} className="rm" style={current === key ? { borderColor: 'var(--ink)', borderWidth: 2 } : undefined}>
            <h3 className="h4" style={{ margin: 0 }}>{plan.l}</h3>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.9rem', fontWeight: 600, margin: '6px 0' }}>
              {plan.p ? <>{formatNumber(plan.p)} <span className="small muted">FCFA / mois</span></> : 'Gratuit'}
            </div>
            <ul style={{ paddingLeft: 18, color: 'var(--muted)', fontSize: '.92rem' }}>
              {plan.feat.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            {canPick && current === key ? <Pill tone="ok" style={{ marginTop: 12 }}>Formule actuelle</Pill> : null}
            {canPick && current !== key ? (
              <Button size="sm" block style={{ marginTop: 12 }} disabled={pending} onClick={() => choose(key)}>Choisir {plan.l}</Button>
            ) : null}
          </div>
        ))}
      </div>
      {choice ? (
        <PlanPaymentDialog
          planKey={choice}
          pending={pending}
          onClose={() => setChoice(null)}
          onConfirm={(input) => {
            onPick?.(input);
            setChoice(null);
          }}
        />
      ) : null}
    </>
  );
}
