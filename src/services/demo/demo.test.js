import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { env } from '@/lib/env.js';
import { getSession, loginAs, logout } from '@/services/auth.service.js';
import { createBooking, getBookingContext } from '@/services/booking.service.js';
import { getCampaign, runCampaignAction } from '@/services/campaigns.service.js';
import { getInfluencerProfile, listInfluencers, toggleFavorite } from '@/services/influencers.service.js';
import { matchInfluencers } from '@/services/matching.service.js';
import { getInfluencerSpace } from '@/services/spaces.service.js';
import { withdraw } from '@/services/wallet.service.js';
import { resetDb } from './db.js';

const brief = { title: 'Lancement sérum', objective: 'notoriete', theme: 'beaute', text: 'Montrez le sérum au réveil, mentionnez le code GLOW.', link: '', date: '', file: '' };

describe('services en mode démonstration', () => {
  const apiUrl = env.apiUrl;
  beforeAll(() => { env.apiUrl = ''; });
  afterAll(() => { env.apiUrl = apiUrl; });
  beforeEach(async () => {
    resetDb();
    await logout();
  });

  it('pagine l’annuaire par curseur et filtre par recherche', async () => {
    const first = await listInfluencers({ limit: 5 });
    expect(first.items).toHaveLength(5);
    expect(first.nextCursor).not.toBeNull();
    const next = await listInfluencers({ limit: 5, cursor: first.nextCursor });
    expect(next.items[0].id).not.toBe(first.items[0].id);
    const found = await listInfluencers({ s: 'ama' });
    expect(found.items.some((i) => i.name === 'Ama Kouassi')).toBe(true);
  });

  it('réserve les favoris aux annonceurs', async () => {
    await expect(toggleFavorite('i1')).rejects.toThrow();
    await loginAs({ role: 'brand', id: 'b1' });
    const { favorite } = await toggleFavorite('i2');
    expect(typeof favorite).toBe('boolean');
  });

  it('déroule une campagne de la réservation à la libération des fonds', async () => {
    await loginAs({ role: 'brand', id: 'b2' });
    const { influencer } = await getBookingContext('amakouassi');
    const rate = influencer.rates[0];
    const { id, message } = await createBooking({ infId: influencer.id, rateId: rate.id, pay: 'om', phone: '0700000000', brief });
    expect(message).toBe('Paiement reçu. Les fonds sont sous séquestre.');
    expect((await getCampaign(id)).campaign.status).toBe('paid');

    await expect(runCampaignAction(id, 'accept')).rejects.toThrow('Action non autorisée pour ce compte.');

    await loginAs({ role: 'influencer', id: influencer.id });
    const before = (await getInfluencerSpace()).wallet.available;
    await runCampaignAction(id, 'accept');
    await expect(runCampaignAction(id, 'proof', { url: 'pas-un-lien' })).rejects.toThrow('Collez le lien complet de votre publication.');
    await runCampaignAction(id, 'proof', { url: 'https://www.tiktok.com/@ama/video/1', note: '' });

    await loginAs({ role: 'brand', id: 'b2' });
    const published = (await getCampaign(id)).campaign;
    expect(published.status).toBe('published');
    expect(published.perf.views).toBeGreaterThan(0);
    await runCampaignAction(id, 'validate');

    await loginAs({ role: 'influencer', id: influencer.id });
    const after = (await getInfluencerSpace()).wallet.available;
    expect(after - before).toBe(published.payout);
  });

  it('interdit l’accès à la campagne d’un autre compte', async () => {
    await loginAs({ role: 'brand', id: 'b2' });
    expect((await getCampaign('c1')).access).toBe('forbidden');
    expect((await getCampaign('inconnue')).access).toBe('missing');
  });

  it('valide les retraits comme l’ancienne démo', async () => {
    await loginAs({ role: 'influencer', id: 'i1' });
    await expect(withdraw({ amount: 950, operator: 'om', phone: '0700000000' })).rejects.toThrow('Saisissez un montant multiple de 100, minimum 1 000 FCFA.');
    await expect(withdraw({ amount: 1000, operator: 'om', phone: '07' })).rejects.toThrow('Saisissez votre numéro mobile money.');
  });

  it('classe les profils pour un brief et expose la formule', async () => {
    await loginAs({ role: 'brand', id: 'b2' });
    const { results, plan } = await matchInfluencers({ theme: 'beaute', objective: 'notoriete', net: 'any', budget: 150000, age: '1', gender: 'all', city: 'Abidjan' });
    expect(plan).toBe('free');
    expect(results.length).toBeGreaterThan(3);
    expect(results[0].note).toBeGreaterThanOrEqual(results[results.length - 1].note - 2);
  });

  it('décrit la session et la vitrine publique', async () => {
    expect(await getSession()).toBeNull();
    await loginAs({ role: 'admin', id: 'admin' });
    expect((await getSession()).name).toBe('Admin PULLUP');
    const profile = await getInfluencerProfile('amakouassi');
    expect(profile.influencer.handle).toBe('amakouassi');
  });
});
