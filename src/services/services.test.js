import { describe, expect, it } from 'vitest';
import { login } from '@/services/auth.service.js';
import { runCampaignAction } from '@/services/campaigns.service.js';
import { listInfluencers } from '@/services/influencers.service.js';

describe('services en mode API', () => {
  it('liste les influenceurs via l’API', async () => {
    const page = await listInfluencers({ s: 'Ama', limit: 12 });
    expect(page.items).toHaveLength(1);
    expect(page.items[0].name).toBe('Ama Kouassi');
    expect(page.nextCursor).toBeNull();
  });

  it('renvoie la session et le message du serveur', async () => {
    const result = await login({ email: 'marketing@savane.ci', password: 'demo-pass' });
    expect(result.session.role).toBe('brand');
    expect(result.message).toBe('Connecté : Savane Cosmetics');
  });

  it('remonte le message d’erreur du serveur', async () => {
    await expect(login({ email: 'inconnu@exemple.ci', password: 'demo-pass' })).rejects.toThrow('Identifiants incorrects.');
    await expect(runCampaignAction('c1', 'refund')).rejects.toThrow('Action non autorisée pour ce compte.');
  });
});
