import { PAY } from '@/domain/catalog.js';
import { isListed } from '@/domain/metrics.js';
import { buildUtm } from '@/domain/utm.js';
import { formatFcfa } from '@/lib/format.js';
import { clone, getDb, saveDb } from './demo/db.js';
import { commissionOf, findBrand, findByHandle, findInfluencer, nextRef, notify, now, requireRole } from './demo/model.js';
import { isRemote, request } from './remote.js';

/** Profil à réserver et solde disponible de l'annonceur connecté. @param {string} handle */
export async function getBookingContext(handle) {
  if (isRemote()) {
    try {
      return await request('get', `/booking/${handle}`);
    } catch (error) {
      const status = /** @type {{ status?: number }} */ (error).status;
      if (status === 404) return null;
      throw error;
    }
  }
  const influencer = findByHandle(handle);
  if (!influencer || !isListed(influencer)) return null;
  const session = getDb().session;
  const brand = session?.role === 'brand' ? findBrand(session.id) : null;
  return { influencer: clone(influencer), balance: brand?.balance ?? 0 };
}

/** Statut de paiement interrogé pendant la confirmation. @param {string} id */
export async function getCampaignPayment(id) {
  if (isRemote()) {
    try {
      return await request('get', `/campaigns/${id}/payment`);
    } catch (error) {
      const status = /** @type {{ status?: number }} */ (error).status;
      if (status === 404) return { status: 'cancelled' };
      throw error;
    }
  }
  const campaign = getDb().campaigns.find((item) => item.id === id);
  if (!campaign || campaign.status === 'cancelled' || campaign.status === 'refunded') return { status: 'cancelled' };
  if (campaign.status === 'awaiting_payment') return { status: 'awaiting_payment' };
  return { status: 'paid' };
}

/**
 * Corps attendu par `POST /campaigns` : pas de champs vides, téléphone sans espaces.
 * @param {{ infId: string, rateId: string, pay: string, phone?: string,
 *   brief: { title: string, objective: string, theme: string, text: string, link?: string, date?: string, file?: string } }} input
 */
export function toCreateCampaignBody(input) {
  const brief = {
    title: input.brief.title,
    objective: input.brief.objective,
    theme: input.brief.theme,
    text: input.brief.text,
  };
  if (input.brief.link) brief.link = input.brief.link;
  if (input.brief.date) brief.date = input.brief.date;
  if (input.brief.file) brief.file = input.brief.file;
  /** @type {{ infId: string, rateId: string, pay: string, phone?: string, brief: typeof brief }} */
  const body = { infId: input.infId, rateId: input.rateId, pay: input.pay, brief };
  if (input.pay !== 'card' && input.phone) body.phone = input.phone.replace(/\D/g, '');
  return body;
}

/**
 * Paie la campagne : le solde PULLUP est utilisé en priorité, puis le moyen de paiement choisi.
 * @param {{ infId: string, rateId: string, pay: string, phone?: string,
 *   brief: { title: string, objective: string, theme: string, text: string, link?: string, date?: string, file?: string } }} input
 * @returns {Promise<{ id: string, status?: string, message: string, redirectUrl?: string }>}
 */
export async function createBooking(input) {
  if (isRemote()) {
    const result = await request('post', '/campaigns', toCreateCampaignBody(input));
    if (result.redirectUrl && typeof window !== 'undefined') {
      window.open(result.redirectUrl, '_blank', 'noopener');
    }
    return result;
  }
  const session = requireRole('brand');
  const S = getDb();
  const brand = findBrand(session.id);
  const influencer = findInfluencer(input.infId);
  const rate = influencer?.rates.find((r) => r.id === input.rateId);
  if (!rate) throw new Error('Choisissez une offre.');
  const operator = PAY.find((p) => p.k === input.pay) ?? PAY[0];
  const fromBalance = Math.min(brand.balance || 0, rate.price);
  brand.balance = (brand.balance || 0) - fromBalance;
  const fee = commissionOf(rate.price);
  const campaign = {
    id: `c${Date.now()}`,
    ref: nextRef(),
    brandId: brand.id,
    infId: influencer.id,
    offer: { ...rate },
    amount: rate.price,
    fee,
    payout: rate.price - fee,
    status: 'paid',
    createdAt: now(),
    pay: operator.k,
    brief: {
      title: input.brief.title.trim(),
      objective: input.brief.objective,
      theme: input.brief.theme,
      text: input.brief.text.trim(),
      link: input.brief.link || 'https://votre-site.ci',
      date: input.brief.date ? new Date(input.brief.date).toISOString() : null,
      file: input.brief.file || null,
    },
    log: [{ s: 'paid', at: now(), n: `Paiement ${operator.l} reçu · ${formatFcfa(rate.price)} bloqués en séquestre` }],
    perf: null,
    proof: null,
    msgs: [],
  };
  campaign.utm = buildUtm(campaign, influencer);
  S.campaigns.unshift(campaign);
  notify(influencer.id, `Nouvelle campagne de ${brand.name} : ${formatFcfa(rate.price)} bloqués en séquestre. Acceptez-la sous 72 h.`, `/c/${campaign.id}`);
  saveDb();
  return { id: campaign.id, message: 'Paiement reçu. Les fonds sont sous séquestre.' };
}
