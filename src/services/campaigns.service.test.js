import { describe, expect, it } from 'vitest';
import { sendMessage } from './messaging.service.js';
import { createBooking, getBookingContext, getCampaignPayment, toCreateCampaignBody } from './booking.service.js';
import { getCampaign, listCampaigns, runCampaignAction, submitReview } from './campaigns.service.js';

describe('campagnes via l’API', () => {
  it('GET /booking/:handle renvoie le profil et le solde', async () => {
    const ctx = await getBookingContext('amakouassi');
    expect(ctx.balance).toBe(35000);
    expect(ctx.influencer.handle).toBe('amakouassi');
    expect(await getBookingContext('inconnu')).toBeNull();
  });

  it('POST /campaigns n’envoie pas les champs vides', () => {
    const body = toCreateCampaignBody({
      infId: 'i1',
      rateId: 'i1r1',
      pay: 'om',
      phone: '07 00 00 00 00',
      brief: { title: 'Lancement', objective: 'notoriete', theme: 'beaute', text: 'Routine du matin.', link: '', date: '', file: '' },
    });
    expect(body.phone).toBe('0700000000');
    expect(body.brief.link).toBeUndefined();
    expect(body.brief.file).toBeUndefined();
  });

  it('POST /campaigns crée une campagne payée', async () => {
    const created = await createBooking({
      infId: 'i1',
      rateId: 'i1r1',
      pay: 'om',
      phone: '0700000000',
      brief: { title: 'Lancement', objective: 'notoriete', theme: 'beaute', text: 'Présenter le sérum dans une routine du matin.' },
    });
    expect(created.id).toBe('c-new');
    expect(created.status).toBe('paid');
  });

  it('GET /campaigns et GET /campaigns/:id', async () => {
    const list = await listCampaigns();
    expect(list[0].ref).toBe('PU-2410-137');
    expect((await getCampaign('c1')).access).toBe('ok');
    expect((await getCampaign('missing')).access).toBe('missing');
    expect((await getCampaign('forbidden')).access).toBe('forbidden');
  });

  it('GET /campaigns/:id/payment, messages, avis et accept', async () => {
    expect(await getCampaignPayment('c1')).toEqual({ status: 'paid' });
    expect(await sendMessage('c1', 'Le colis arrive demain.')).toEqual({ message: 'Message envoyé.' });
    expect(await submitReview('c3', { stars: 5, text: 'Sketch hilarant.' })).toEqual({
      message: 'Merci ! Votre avis est publié sur la vitrine.',
    });
    expect(await runCampaignAction('c1', 'accept')).toEqual({
      message: 'Campagne acceptée. Publiez à la date prévue.',
    });
  });
});
