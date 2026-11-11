import { describe, expect, it } from 'vitest';
import { canExportCampaignsCsv, downloadCampaignsCsv, getBrandSpace, getInfluencerSpace, updateBrandProfile } from './spaces.service.js';

describe('espaces perso via l’API', () => {
  it('GET /me/brand-space normalise campagnes et favoris', async () => {
    const space = await getBrandSpace();
    expect(space.brand.plan).toBe('pro');
    expect(space.campaigns).toHaveLength(1);
    expect(space.favorites[0].favorite).toBe(true);
  });

  it('GET /me/influencer-space complète les visites sur 30 jours', async () => {
    const space = await getInfluencerSpace();
    expect(space.influencer.handle).toBe('amakouassi');
    expect(space.influencer.views).toHaveLength(30);
    expect(space.wallet.available).toBe(142500);
    expect(space.escrow).toBe(182750);
    expect(space.requests[0].type).toBe('Partenariat');
  });

  it('PUT /me/brand enregistre la fiche', async () => {
    const result = await updateBrandProfile({ name: 'Savane Cosmetics', contact: 'Aïcha Diomandé', sector: 'Cosmétique' });
    expect(result.message).toBe('Profil enregistré.');
  });

  it('GET /me/campaigns.csv télécharge le fichier Business', async () => {
    expect(canExportCampaignsCsv('pro')).toBe(false);
    expect(canExportCampaignsCsv('business')).toBe(true);
    const blob = await downloadCampaignsCsv();
    expect(await blob.text()).toContain('PU-2409-125');
  });
});
