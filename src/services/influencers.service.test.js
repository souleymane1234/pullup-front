import { describe, expect, it } from 'vitest';
import {
  getDirectory,
  getInfluencerProfile,
  listCarousel,
  listInfluencers,
  recordVisit,
  sendContactRequest,
  setInfluencerPhoto,
  toContactRequestBody,
  toListQuery,
  toPhotoBody,
  toVitrineBody,
  toggleFavorite,
  updateVitrine,
} from './influencers.service.js';

describe('influenceurs via l’API', () => {
  it('GET /influencers n’envoie que les filtres renseignés', () => {
    expect(toListQuery({ cursor: 0, limit: 12, sort: 'score', s: '', cat: '', badge: '' })).toEqual({
      cursor: 0,
      limit: 12,
      sort: 'score',
    });
    expect(toListQuery({ s: ' Ama ', cat: 'beaute', net: 'ig', badge: 'macro', budget: '50000', sort: 'eng' })).toMatchObject({
      s: 'Ama',
      cat: 'beaute',
      net: 'ig',
      badge: 'macro',
      budget: '50000',
      sort: 'eng',
    });
  });

  it('GET /influencers liste une page de profils', async () => {
    const page = await listInfluencers({ s: 'Ama', limit: 12 });
    expect(page.items).toHaveLength(1);
    expect(page.items[0].name).toBe('Ama Kouassi');
    expect(page.nextCursor).toBeNull();
  });

  it('GET /influencers/directory et /carousel', async () => {
    const directory = await getDirectory();
    expect(directory.verified).toBe(16);
    expect(directory.featured.handle).toBe('amakouassi');
    const carousel = await listCarousel('reco');
    expect(carousel[0].handle).toBe('amakouassi');
    expect(carousel[1].name).toBe('Yao Tech');
  });

  it('GET /influencers/:handle renvoie la fiche ou null', async () => {
    const profile = await getInfluencerProfile('amakouassi');
    expect(profile.influencer.handle).toBe('amakouassi');
    expect(profile.reviews[0].brand).toBe('Boutique Nana Wax');
    expect(profile.influencer.stats.audience.gender).toEqual({ women: 74, men: 26 });
    expect(profile.influencer.stats.score.bars.map((bar) => bar.label)).toEqual([
      'Engagement', 'Authenticité', 'Créativité', 'Briefs', 'Délais',
    ]);
    expect(await getInfluencerProfile('inconnu')).toBeNull();
  });

  it('POST /influencers/:id/favorite, /requests et /visits', async () => {
    await expect(toggleFavorite('guest')).rejects.toThrow("Connectez-vous en tant qu'annonceur pour créer votre sélection.");
    const added = await toggleFavorite('i3');
    expect(added).toEqual({ favorite: true, message: 'Ajouté à votre sélection.' });
    expect(await recordVisit('i1')).toBeNull();
    expect(await sendContactRequest({
      infId: 'i1',
      from: 'Boutique Nana Wax',
      contact: '+225 07 48 22 19 03',
      msg: 'Partenariat 3 mois pour la nouvelle collection.',
      type: 'Partenariat',
    })).toEqual({ message: 'Demande envoyée.' });
    await expect(sendContactRequest({
      infId: 'i1', from: 'A', contact: '07', msg: 'trop peu', type: 'Partenariat',
    })).rejects.toThrow('Le message doit contenir entre 10 et 1 000 caractères.');
  });

  it('POST /requests n’envoie pas infId dans le corps', () => {
    expect(toContactRequestBody({
      infId: 'i1',
      from: ' Boutique Nana Wax ',
      contact: ' 07 ',
      msg: ' Partenariat 3 mois. ',
      type: 'Partenariat',
    })).toEqual({
      from: 'Boutique Nana Wax',
      contact: '07',
      msg: 'Partenariat 3 mois.',
      type: 'Partenariat',
    });
  });

  it('PUT /influencers/:id/vitrine et /photo', async () => {
    const body = toVitrineBody({
      bio: ' Nouvelle bio ',
      cats: ['beaute', 'mode', 'food', 'sport'],
      days: ['Lun'],
      rates: [{ id: 'i1r0', net: 'ig', fmt: ' Story ', price: 35000.4 }],
    });
    expect(body.cats).toEqual(['beaute', 'mode', 'food']);
    expect(body.rates[0]).toEqual({ id: 'i1r0', net: 'ig', fmt: 'Story', price: 35000 });
    expect(toPhotoBody('data:image/jpeg;base64,abc', { consent: true })).toEqual({
      photo: 'data:image/jpeg;base64,abc',
      consent: true,
    });
    expect(toPhotoBody(null)).toEqual({ photo: null });
    expect(await updateVitrine('i1', body)).toEqual({ message: 'Vitrine enregistrée.' });
    expect(await setInfluencerPhoto('i1', 'data:image/jpeg;base64,abc')).toEqual({ message: 'Photo mise à jour.' });
    await expect(setInfluencerPhoto('i1', 'data:image/jpeg;base64,abc', { consent: false })).rejects.toThrow(
      "L'accord écrit de l'influenceur (droit à l'image) est obligatoire.",
    );
  });
});
