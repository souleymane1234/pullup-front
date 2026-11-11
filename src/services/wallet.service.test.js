import { describe, expect, it, vi } from 'vitest';
import { purchaseBoost, setPlan, toBoostBody, toPlanBody } from './wallet.service.js';

describe('facturation via l’API', () => {
  it('construit les corps formule et option', () => {
    expect(toPlanBody('free')).toEqual({ plan: 'free' });
    expect(toPlanBody({ plan: 'pro', pay: 'om', phone: '07 00 00 00 00' })).toEqual({
      plan: 'pro', pay: 'om', phone: '0700000000',
    });
    expect(toPlanBody({ plan: 'business', pay: 'card', phone: '4242' })).toEqual({ plan: 'business', pay: 'card' });
    expect(toBoostBody({ key: 'certified', pay: 'wave', phone: '07 11 22 33 44' })).toEqual({
      key: 'certified', pay: 'wave', phone: '0711223344',
    });
    expect(toBoostBody('Influenceur Pro')).toEqual({ key: 'pro' });
  });

  it('PUT /billing/plan et POST /billing/boosts', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    expect(await setPlan('free')).toMatchObject({ status: 'cancelled' });
    await expect(setPlan({ plan: 'pro', pay: 'om' })).rejects.toThrow('numéro mobile money');
    const paid = await setPlan({ plan: 'business', pay: 'om', phone: '0700000000' });
    expect(paid).toMatchObject({ status: 'awaiting_payment', message: 'Confirmez le paiement sur votre téléphone.' });
    expect(open).toHaveBeenCalledWith('https://pay.example/plan', '_blank', 'noopener');

    const boost = await purchaseBoost({ key: 'certified', pay: 'mtn', phone: '0700000000' });
    expect(boost.message).toMatch(/équipe PULLUP/);
    expect(open).toHaveBeenCalledWith('https://pay.example/boost', '_blank', 'noopener');
    open.mockRestore();
  });
});
