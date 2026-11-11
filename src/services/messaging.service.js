import { saveDb } from './demo/db.js';
import { findBrand, findCampaign, findInfluencer, notify, now, requireRole } from './demo/model.js';
import { isRemote, request } from './remote.js';

/** Message sur le fil d'une campagne. Les deux parties et l'équipe PULLUP y ont accès. @param {string} campaignId @param {string} text */
export async function sendMessage(campaignId, text) {
  if (isRemote()) return request('post', `/campaigns/${campaignId}/messages`, { text });
  const session = requireRole('brand', 'influencer', 'admin');
  const campaign = findCampaign(campaignId);
  if (!campaign) throw new Error('Campagne introuvable.');
  if (session.role !== 'admin' && session.id !== campaign.brandId && session.id !== campaign.infId) {
    throw new Error('Action non autorisée pour ce compte.');
  }
  const body = text.trim();
  if (!body) throw new Error('Écrivez un message.');
  campaign.msgs = campaign.msgs || [];
  campaign.msgs.push({ from: session.role, t: body, at: now() });
  const link = `/c/${campaign.id}`;
  if (session.role === 'brand') {
    notify(campaign.infId, `Nouveau message de ${findBrand(campaign.brandId)?.name} sur « ${campaign.brief.title} ».`, link);
  } else if (session.role === 'influencer') {
    notify(campaign.brandId, `Nouveau message de ${findInfluencer(campaign.infId)?.name} sur « ${campaign.brief.title} ».`, link);
  } else {
    notify(campaign.infId, `Message de l'équipe PULLUP sur ${campaign.ref}.`, link);
    notify(campaign.brandId, `Message de l'équipe PULLUP sur ${campaign.ref}.`, link);
  }
  saveDb();
  return { message: 'Message envoyé.' };
}
