import { NET } from '@/domain/catalog.js';
import { formatFcfa } from '@/lib/format.js';
import { getDb, saveDb } from './demo/db.js';
import {
  currentSession, findBrand, findCampaign, findInfluencer, joinCampaign, notify, now, release, requireRole, setStatus,
} from './demo/model.js';
import { isRemote, request } from './remote.js';

/** @typedef {'accept'|'decline'|'proof'|'cancel'|'validate'|'dispute'|'release'|'refund'} CampaignAction */

/**
 * @param {string} id
 * @returns {Promise<{ access: 'ok'|'forbidden'|'missing', campaign?: any }>}
 */
export async function getCampaign(id) {
  if (isRemote()) {
    try {
      return await request('get', `/campaigns/${id}`);
    } catch (error) {
      const status = /** @type {{ status?: number }} */ (error).status;
      if (status === 404) return { access: 'missing' };
      if (status === 401 || status === 403) return { access: 'forbidden' };
      throw error;
    }
  }
  const campaign = findCampaign(id);
  if (!campaign) return { access: 'missing' };
  const session = currentSession();
  const allowed = session && (session.role === 'admin' || session.id === campaign.brandId || session.id === campaign.infId);
  if (!allowed) return { access: 'forbidden' };
  return { access: 'ok', campaign: joinCampaign(campaign) };
}

const refund = (c) => {
  const brand = findBrand(c.brandId);
  if (brand) brand.balance = (brand.balance || 0) + c.amount;
};

const link = (c) => `/c/${c.id}`;

const HANDLERS = {
  accept: {
    roles: ['influencer'],
    from: ['paid'],
    run(c, i) {
      setStatus(c, 'accepted', `${i.name} a accepté la campagne`);
      notify(c.brandId, `${i.name} a accepté « ${c.brief.title} ».`, link(c));
      return 'Campagne acceptée. Publiez à la date prévue.';
    },
  },
  decline: {
    roles: ['influencer'],
    from: ['paid'],
    run(c, i) {
      setStatus(c, 'declined', 'Refusée par l\'influenceur · remboursement sur le solde annonceur');
      refund(c);
      notify(c.brandId, `${i.name} a refusé « ${c.brief.title} ». ${formatFcfa(c.amount)} recrédités sur votre solde.`, link(c));
      return 'Campagne refusée. L\'annonceur est remboursé.';
    },
  },
  proof: {
    roles: ['influencer'],
    from: ['accepted'],
    run(c, i, payload) {
      if (!/^https?:\/\//.test(payload.url || '')) throw new Error('Collez le lien complet de votre publication.');
      c.proof = { url: payload.url, note: payload.note || '', at: now() };
      const net = i.net[c.offer.net] || [10000, 5];
      const views = Math.round(net[0] * NET[c.offer.net].reach * (0.8 + Math.random() * 0.4));
      c.perf = {
        views,
        likes: Math.round(((views * net[1]) / 100) * 0.8),
        comments: Math.round(((views * net[1]) / 100) * 0.08),
        shares: Math.round(((views * net[1]) / 100) * 0.06),
        clicks: Math.round(views * 0.012),
      };
      setStatus(c, 'published', 'Preuve de publication envoyée');
      notify(c.brandId, `${i.name} a publié « ${c.brief.title} ». Validez pour libérer les fonds.`, link(c));
      return 'Preuve envoyée. Paiement à la validation.';
    },
  },
  cancel: {
    roles: ['brand'],
    from: ['paid', 'accepted'],
    run(c) {
      setStatus(c, 'cancelled', 'Annulée par l\'annonceur · remboursement sur le solde');
      refund(c);
      notify(c.infId, `La campagne « ${c.brief.title} » a été annulée par l'annonceur.`, link(c));
      return `${formatFcfa(c.amount)} recrédités sur votre solde PULLUP.`;
    },
  },
  validate: {
    roles: ['brand', 'admin'],
    from: ['published'],
    run(c, _i, _payload, role) {
      setStatus(c, 'completed', role === 'admin' ? 'Validation automatique après 72 h · fonds libérés' : 'Validée par l\'annonceur · fonds libérés');
      release(c);
      return 'Fonds libérés à l\'influenceur.';
    },
  },
  dispute: {
    roles: ['brand'],
    from: ['published'],
    run(c, _i, payload) {
      if (!payload.reason?.trim()) throw new Error('Décrivez le problème rencontré.');
      c.disputeReason = payload.reason.trim();
      setStatus(c, 'dispute', 'Litige ouvert par l\'annonceur');
      notify('admin', `Litige ouvert sur ${c.ref}.`, link(c));
      notify(c.infId, `Un litige a été ouvert sur « ${c.brief.title} ».`, link(c));
      return 'Litige transmis à l\'équipe PULLUP.';
    },
  },
  release: {
    roles: ['admin'],
    from: ['dispute'],
    run(c) {
      setStatus(c, 'completed', 'Litige tranché en faveur de l\'influenceur · fonds libérés');
      release(c);
      notify(c.brandId, `Litige ${c.ref} clos : fonds versés à l'influenceur.`, link(c));
      return 'Fonds versés à l\'influenceur.';
    },
  },
  refund: {
    roles: ['admin'],
    from: ['dispute'],
    run(c) {
      setStatus(c, 'refunded', 'Litige tranché en faveur de l\'annonceur · remboursement');
      refund(c);
      notify(c.brandId, `Litige ${c.ref} clos : ${formatFcfa(c.amount)} recrédités sur votre solde.`, link(c));
      notify(c.infId, `Litige ${c.ref} clos en faveur de l'annonceur.`, link(c));
      return 'Annonceur remboursé.';
    },
  },
};

/**
 * @param {string} id
 * @param {CampaignAction} action
 * @param {{ url?: string, note?: string, reason?: string }} [payload]
 * @returns {Promise<{ message: string }>}
 */
export async function runCampaignAction(id, action, payload = {}) {
  if (isRemote()) return request('post', `/campaigns/${id}/${action}`, payload);
  const handler = HANDLERS[action];
  const campaign = findCampaign(id);
  if (!handler || !campaign) throw new Error('Campagne introuvable.');
  const session = requireRole(...handler.roles);
  if (session.role !== 'admin' && session.id !== campaign.brandId && session.id !== campaign.infId) {
    throw new Error('Action non autorisée pour ce compte.');
  }
  if (!handler.from.includes(campaign.status)) throw new Error('Cette action n\'est plus disponible.');
  const message = handler.run(campaign, findInfluencer(campaign.infId), payload, session.role);
  saveDb();
  return { message };
}

/** Valide les publications restées sans réponse de l'annonceur (règle des 72 h). */
export async function autoValidatePublished() {
  if (isRemote()) return request('post', '/admin/campaigns/auto-validate');
  requireRole('admin');
  const pending = getDb().campaigns.filter((c) => c.status === 'published');
  pending.forEach((c) => {
    setStatus(c, 'completed', 'Validation automatique après 72 h · fonds libérés');
    release(c);
  });
  saveDb();
  return { message: pending.length ? `${pending.length} campagne(s) validée(s) automatiquement.` : 'Aucune publication en attente de validation.' };
}

/** @param {string} id @param {{ stars: number, text: string }} review */
export async function submitReview(id, review) {
  if (isRemote()) return request('post', `/campaigns/${id}/review`, review);
  const session = requireRole('brand');
  const campaign = findCampaign(id);
  if (!campaign || campaign.brandId !== session.id || campaign.status !== 'completed' || campaign.review) {
    throw new Error('Action non autorisée pour ce compte.');
  }
  campaign.review = { stars: review.stars, text: review.text.trim(), at: now() };
  const influencer = findInfluencer(campaign.infId);
  if (influencer) {
    influencer.rating = Math.round(((influencer.rating * influencer.reviews + review.stars) / (influencer.reviews + 1)) * 10) / 10;
    influencer.reviews += 1;
    notify(influencer.id, `${findBrand(campaign.brandId)?.name} vous a laissé un avis ${review.stars}/5.`, `/i/${influencer.handle}`);
  }
  saveDb();
  return { message: 'Merci ! Votre avis est publié sur la vitrine.' };
}

/** Campagnes visibles par la session courante, enrichies des noms. */
export async function listCampaigns() {
  if (isRemote()) return request('get', '/campaigns');
  const session = currentSession();
  if (!session) return [];
  return getDb().campaigns
    .filter((c) => session.role === 'admin' || c.brandId === session.id || c.infId === session.id)
    .map(joinCampaign);
}
