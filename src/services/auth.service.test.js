import { describe, expect, it } from 'vitest';
import {
  deleteMyAccount, exportMyData, forgotPassword, getSession, isHandleAvailable, login, loginAs, logout, resetPassword, signupBrand,
} from './auth.service.js';

describe('auth via l’API', () => {
  it('GET /auth/session renvoie null hors connexion', async () => {
    expect(await getSession()).toBeNull();
  });

  it('GET /auth/handle indique si le nom est libre', async () => {
    expect(await isHandleAvailable('amakouassi')).toBe(false);
    expect(await isHandleAvailable('nouveau.handle')).toBe(true);
  });

  it('POST /auth/login pose la session', async () => {
    const result = await login({ email: 'marketing@savane.ci', password: 'demo-pass' });
    expect(result.session.id).toBe('b1');
    expect(result.message).toBe('Connecté : Savane Cosmetics');
  });

  it('POST /auth/login remonte le 401 du serveur', async () => {
    await expect(login({ email: 'inconnu@exemple.ci', password: 'x' })).rejects.toThrow('Identifiants incorrects.');
  });

  it('POST /auth/password/forgot et /reset', async () => {
    const forgot = await forgotPassword('amakouassi@mail.ci');
    expect(forgot.message).toMatch(/e-mail vient d'être envoyé/);
    const reset = await resetPassword({ token: 'ok', password: 'nouveau-mot-de-passe' });
    expect(reset.message).toBe('Mot de passe modifié.');
    await expect(resetPassword({ token: 'expired', password: 'nouveau-mot-de-passe' })).rejects.toThrow('Ce lien n’est plus valable.');
  });

  it('POST /auth/signup/brand et /auth/logout', async () => {
    const created = await signupBrand({
      company: 'Boutique Test', contact: 'Awa Test', email: 'awa@marque.ci', password: 'au-moins-8',
    });
    expect(created.session.plan).toBe('free');
    expect(created.message).toBe('Bienvenue sur PULLUP, Awa !');
    expect(await logout()).toEqual({ message: 'Déconnecté.' });
  });

  it('POST /auth/demo et GET /me/export', async () => {
    const demo = await loginAs({ role: 'brand', id: 'b1' });
    expect(demo.session.role).toBe('brand');
    const exported = await exportMyData();
    expect(exported.brand.name).toBe('Savane Cosmetics');
    expect(exported.influencer).toBeNull();
  });

  it('DELETE /me exige le mot de passe', async () => {
    await expect(deleteMyAccount('')).rejects.toThrow('Saisissez votre mot de passe.');
    await expect(deleteMyAccount('mauvais')).rejects.toThrow('Identifiants incorrects.');
    expect(await deleteMyAccount('demo-pass')).toEqual({ message: 'Compte supprimé.' });
  });
});
