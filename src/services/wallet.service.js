import { PAY, PLANS } from '@/domain/catalog.js';
import { formatFcfa } from '@/lib/format.js';
import { saveDb } from './demo/db.js';
import { findBrand, now, requireRole, walletOf } from './demo/model.js';
import { isRemote, request } from './remote.js';

function openRedirect(result) {
  const url = result?.redirectUrl;
  if (!url || typeof window === 'undefined' || typeof window.open !== 'function') return;
  window.open(url, '_blank', 'noopener');
}

function digits(value) {
  const phone = String(value ?? '').replace(/\D/g, '');
  return phone || undefined;
}

/**
 * Corps `PUT /billing/plan`. `setPlan('free')` reste accepté.
 * @param {string | { plan: string, pay?: string, phone?: string }} input
 */
export function toPlanBody(input) {
  if (typeof input === 'string') return { plan: input };
  const body = { plan: input?.plan };
  if (input?.pay) body.pay = input.pay;
  const phone = digits(input?.phone);
  if (phone && input?.pay !== 'card') body.phone = phone;
  return body;
}

const BOOST_BY_LABEL = {
  'influenceur pro': 'pro',
  certifie: 'certified',
  'certifié': 'certified',
  'analytics avancees': 'analytics',
  'analytics avancées': 'analytics',
};

/**
 * Corps `POST /billing/boosts` : toujours `key`, `pay` et `phone` quand ils sont connus.
 * @param {string | { key?: string, label?: string, pay?: string, phone?: string }} input
 */
export function toBoostBody(input) {
  if (typeof input === 'string') {
    const key = BOOST_BY_LABEL[input.trim().toLowerCase()];
    return key ? { key } : { label: input };
  }
  const body = {};
  const key = input?.key || BOOST_BY_LABEL[String(input?.label ?? '').trim().toLowerCase()];
  if (key) body.key = key;
  else if (input?.label) body.label = input.label;
  if (input?.pay) body.pay = input.pay;
  const phone = digits(input?.phone);
  if (phone && input?.pay !== 'card') body.phone = phone;
  return body;
}

function withCertifiedNotice(body, result) {
  if (body.key !== 'certified') return result;
  const notice = "La demande est transmise à l'équipe PULLUP, qui accorde le badge.";
  const message = String(result?.message ?? '');
  if (message.includes('équipe PULLUP')) return result;
  return { ...result, message: [message, notice].filter(Boolean).join(' ') };
}

/** @param {{ amount: number, operator: string, phone: string }} input */
export async function withdraw(input) {
  if (isRemote()) return request('post', '/wallet/withdrawals', input);
  const session = requireRole('influencer');
  const wallet = walletOf(session.id);
  const amount = Number(input.amount);
  if (!amount || amount < 1000 || amount % 100) throw new Error('Saisissez un montant multiple de 100, minimum 1 000 FCFA.');
  if (amount > wallet.available) throw new Error('Montant supérieur à votre solde disponible.');
  if (input.phone.replace(/\D/g, '').length < 8) throw new Error('Saisissez votre numéro mobile money.');
  const operator = PAY.find((p) => p.k === input.operator) ?? PAY[0];
  wallet.available -= amount;
  wallet.tx.unshift({ t: 'out', a: amount, l: `Retrait ${operator.l}`, at: now() });
  saveDb();
  return { message: `${formatFcfa(amount)} envoyés sur ${operator.l}.` };
}

/**
 * Change la formule annonceur.
 * @param {string | { plan: keyof typeof PLANS, pay?: string, phone?: string }} input
 */
export async function setPlan(input) {
  const plan = typeof input === 'string' ? input : input?.plan;
  if (isRemote()) {
    const result = await request('put', '/billing/plan', toPlanBody(input));
    openRedirect(result);
    return result;
  }
  const session = requireRole('brand');
  if (!PLANS[plan]) throw new Error('Formule inconnue.');
  findBrand(session.id).plan = plan;
  saveDb();
  return { message: `Formule ${PLANS[plan].l} activée.`, status: 'active' };
}

/** @param {string | { key?: string, label?: string, pay?: string, phone?: string }} input */
export async function purchaseBoost(input) {
  const body = toBoostBody(input);
  if (isRemote()) {
    const result = await request('post', '/billing/boosts', body);
    openRedirect(result);
    return withCertifiedNotice(body, result);
  }
  requireRole('influencer');
  if (body.key === 'certified') {
    return { message: "La demande est transmise à l'équipe PULLUP, qui accorde le badge.", status: 'awaiting_payment' };
  }
  const label = typeof input === 'string' ? input : input.label ?? input.key ?? 'option';
  return { message: `Option ${label} : paiement mobile money à confirmer (démo).` };
}
