import { describe, expect, it } from 'vitest';
import { matchOne, rankMatches } from './matching.js';
import { badge, minPrice, pullupScore, totalFollowers } from './metrics.js';
import { buildUtm, trackingUrl } from './utm.js';

const influencer = (patch = {}) => ({
  id: 'x1',
  name: 'Test Créatrice',
  handle: 'test',
  verified: true,
  status: 'active',
  cats: ['beaute'],
  net: { ig: [100000, 5], tt: [200000, 7] },
  rates: [{ id: 'r1', net: 'ig', fmt: 'Story', price: 30000 }, { id: 'r2', net: 'tt', fmt: 'Vidéo', price: 60000 }],
  aud: { f: 70, ages: [10, 45, 35, 10], cities: [['Abidjan', 60], ['Bouaké', 10]] },
  auth: 92,
  rating: 4.6,
  reviews: 20,
  onTime: 95,
  creat: 4.5,
  brief: 92,
  done: 30,
  ...patch,
});

const brief = { theme: 'beaute', objective: 'notoriete', net: 'any', budget: 50000, age: '1', gender: 'f', city: 'Abidjan' };

describe('domaine', () => {
  it('calcule abonnés et prix d’entrée', () => {
    expect(totalFollowers(influencer())).toBe(300000);
    expect(minPrice(influencer())).toBe(30000);
    expect(minPrice(influencer(), 'tt')).toBe(60000);
  });

  it('borne le Score PULLUP entre 0 et 5', () => {
    const score = pullupScore(influencer());
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(5);
  });

  it('attribue un badge avec un libellé', () => {
    const result = badge(influencer());
    expect(result).toHaveProperty('k');
    expect(result).toHaveProperty('l');
  });

  it('note la compatibilité entre 3 et 5 et explique le choix', () => {
    const match = matchOne(influencer(), brief);
    expect(match.note).toBeGreaterThanOrEqual(3);
    expect(match.note).toBeLessThanOrEqual(5);
    expect(match.why[0]).toBe('Thématique alignée : Mode & beauté');
    expect(match.inBudget).toBe(true);
  });

  it('exclut un profil absent du réseau demandé et classe ceux du budget en premier', () => {
    expect(matchOne(influencer(), { ...brief, net: 'fb' })).toBeNull();
    const cheap = influencer({ id: 'a', cats: ['tech'] });
    const pricey = influencer({ id: 'b', rates: [{ id: 'r', net: 'ig', fmt: 'Post', price: 900000 }] });
    expect(rankMatches([pricey, cheap], brief).map((m) => m.influencer.id)).toEqual(['a', 'b']);
  });

  it('construit un lien UTM traçable', () => {
    const url = buildUtm({ ref: 'PU-2410-1', brief: { link: 'https://savane.ci' }, offer: { net: 'ig' } }, influencer());
    expect(url).toContain('utm_source');
    expect(trackingUrl('PU-2410-137')).toBe('http://localhost:3000/api/r/PU-2410-137');
  });
});
