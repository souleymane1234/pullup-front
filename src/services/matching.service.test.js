import { describe, expect, it } from 'vitest';
import { matchInfluencers, toMatchingBody } from './matching.service.js';

const brief = {
  theme: 'beaute',
  objective: 'notoriete',
  net: 'ig',
  budget: 100000,
  age: '1',
  gender: 'f',
  city: 'Abidjan',
  desc: '',
};

describe('matching via l’API', () => {
  it('POST /matching n’envoie pas les champs vides', () => {
    expect(toMatchingBody(brief)).toEqual({
      theme: 'beaute',
      objective: 'notoriete',
      net: 'ig',
      budget: 100000,
      gender: 'f',
      age: '1',
      city: 'Abidjan',
    });
    expect(toMatchingBody({ ...brief, age: '', city: '', net: '', gender: '' })).toEqual({
      theme: 'beaute',
      objective: 'notoriete',
      net: 'any',
      budget: 100000,
      gender: 'all',
    });
  });

  it('classe les profils et masque la suite pour un visiteur', async () => {
    const { results, plan } = await matchInfluencers(brief);
    expect(plan).toBeNull();
    expect(results).toHaveLength(4);
    expect(results[0].influencer.handle).toBe('amakouassi');
    expect(results[0].reach).toBeNull();
    expect(results[0].masked).toBe(false);
    expect(results[3].masked).toBe(true);
    expect(results[3].influencer).toMatchObject({ id: 'masked-4', name: 'Profil réservé' });
    expect(results[3].influencer.handle).toBeUndefined();
    expect(results[3].price).toBeNull();
  });

  it('refuse un brief incomplet', async () => {
    await expect(matchInfluencers({ theme: '', objective: '', net: 'ig', budget: 100000 })).rejects.toThrow('Required');
  });
});
