import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Icon } from '@/components/ui/Icon/Icon.jsx';
import { Input } from '@/components/ui/Input/Input.jsx';
import { PAY } from '@/domain/catalog.js';
import { cn } from '@/lib/cn.js';
import { formatFcfa } from '@/lib/format.js';
import { paymentSchema } from '../schemas/booking.schema.js';

/**
 * @param {{ draft: any, influencerName: string, price: number, fromBalance: number,
 *   onBack: (values: any) => void, onPay: (values: any) => void }} props
 */
export function PaymentStep({ draft, influencerName, price, fromBalance, onBack, onPay }) {
  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: { pay: draft.pay, phone: draft.phone },
  });
  const pay = watch('pay');
  const operator = PAY.find((p) => p.k === pay) ?? PAY[0];

  return (
    <form noValidate onSubmit={handleSubmit(onPay)}>
      <h2 className="h3">Paiement sécurisé</h2>
      <p className="muted small">Le montant est bloqué chez PULLUP. {influencerName} ne le reçoit qu'après la preuve de publication et votre validation.</p>
      {fromBalance ? (
        <div className="banner" style={{ background: 'var(--ok-bg)', color: 'var(--ok)', marginBottom: 14 }}>
          <Icon name="coin" />
          <span>{formatFcfa(fromBalance)} de votre solde PULLUP seront utilisés en priorité.</span>
        </div>
      ) : null}
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="f">Moyen de paiement</legend>
        <div className="pay-ops" role="radiogroup" aria-label="Moyen de paiement">
          {PAY.map((p) => (
            <button
              key={p.k}
              type="button"
              role="radio"
              aria-checked={pay === p.k}
              className={cn('pay-op', pay === p.k && 'on')}
              onClick={() => setValue('pay', p.k)}
            >
              {p.logo ? (
                <span className="pay-logo" style={{ background: p.bg }} aria-hidden="true">
                  <img src={p.logo} alt="" width="72" height="48" loading="lazy" decoding="async" />
                </span>
              ) : (
                <span className="pay-logo" style={{ background: p.c, color: p.ink || '#fff' }} aria-hidden="true">
                  <Icon name="card" size={22} />
                </span>
              )}
              {p.l}
            </button>
          ))}
        </div>
      </fieldset>
      {pay === 'card' ? (
        <div className="grid2" style={{ marginTop: 16 }}>
          <Input label="Numéro de carte" inputMode="numeric" placeholder="4242 4242 4242 4242" autoComplete="cc-number" />
          <div className="grid2">
            <Input label="Expiration" placeholder="MM/AA" autoComplete="cc-exp" />
            <Input label="CVC" inputMode="numeric" placeholder="123" autoComplete="cc-csc" />
          </div>
        </div>
      ) : (
        <div className="field" style={{ marginTop: 16 }}>
          <label className="f" htmlFor="bk-phone">Numéro {operator.l}</label>
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <select className="inp" style={{ width: 110 }} aria-label="Indicatif">
              <option>+225</option><option>+223</option><option>+226</option><option>+221</option>
            </select>
            <input
              id="bk-phone"
              className="inp"
              inputMode="tel"
              placeholder="07 00 00 00 00"
              autoComplete="tel-national"
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby="bk-phone-hint"
              {...register('phone')}
            />
          </div>
          <div className="hint" id="bk-phone-hint">Vous recevrez une demande de confirmation sur votre téléphone.</div>
          {errors.phone ? <p className="field-error" role="alert">{errors.phone.message}</p> : null}
        </div>
      )}
      <div className="row between" style={{ marginTop: 8 }}>
        <Button variant="ghost" onClick={() => onBack(getValues())}>Retour</Button>
        <Button type="submit" variant="gold"><Icon name="lock" size={18} /> Payer {formatFcfa(price - fromBalance)}</Button>
      </div>
    </form>
  );
}
