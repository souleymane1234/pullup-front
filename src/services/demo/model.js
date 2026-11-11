import { COMMISSION, HELD_STATUSES } from '@/domain/catalog.js';
import { avatarOf } from '@/domain/metrics.js';
import { formatFcfa } from '@/lib/format.js';
import { clone, getDb } from './db.js';

export const now = () => new Date().toISOString();

export const findInfluencer = (id) => getDb().influencers.find((i) => i.id === id);
export const findByHandle = (handle) => getDb().influencers.find((i) => i.handle === handle);
export const findBrand = (id) => getDb().brands.find((b) => b.id === id);
export const findCampaign = (id) => getDb().campaigns.find((c) => c.id === id);

export const currentSession = () => getDb().session;
export const currentRole = () => getDb().session?.role ?? 'visitor';

export function requireRole(...roles) {
  if (!roles.includes(currentRole())) throw new Error('Action non autorisée pour ce compte.');
  return getDb().session;
}

export function walletOf(id) {
  const S = getDb();
  if (!S.wallets[id]) S.wallets[id] = { available: 0, tx: [] };
  return S.wallets[id];
}

export function escrowOf(infId) {
  return getDb().campaigns
    .filter((c) => c.infId === infId && HELD_STATUSES.includes(c.status))
    .reduce((sum, c) => sum + c.payout, 0);
}

export function nextRef() {
  const S = getDb();
  S.seq += 1;
  const d = new Date();
  return `PU-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}-${S.seq}`;
}

export function notify(to, text, link) {
  getDb().notifs.unshift({ to, t: text, at: now(), r: false, link });
}

export function setStatus(campaign, status, note) {
  campaign.status = status;
  campaign.log.push({ s: status, at: now(), n: note });
}

/** Libère le séquestre : le net est crédité sur le portefeuille de l'influenceur. */
export function release(campaign) {
  const wallet = walletOf(campaign.infId);
  wallet.available += campaign.payout;
  wallet.tx.unshift({ t: 'in', a: campaign.payout, l: `Campagne ${campaign.ref} libérée`, at: now() });
  const influencer = findInfluencer(campaign.infId);
  if (influencer) influencer.done += 1;
  notify(campaign.infId, `${formatFcfa(campaign.payout)} ajoutés à votre solde disponible (${campaign.ref}).`, '/espace?tab=wallet');
}

export const commissionOf = (amount) => Math.round(amount * COMMISSION);

export function joinCampaign(campaign) {
  const influencer = findInfluencer(campaign.infId);
  const brand = findBrand(campaign.brandId);
  return {
    ...clone(campaign),
    influencer: influencer
      ? { id: influencer.id, handle: influencer.handle, ...avatarOf(influencer) }
      : { id: campaign.infId, handle: '', name: 'Influenceur', hue: 220, photo: null, verified: false },
    brand: brand ? { id: brand.id, name: brand.name } : { id: campaign.brandId, name: 'Annonceur' },
  };
}
