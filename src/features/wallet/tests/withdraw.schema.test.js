import { describe, expect, it } from 'vitest';
import { withdrawSchema } from '../schemas/withdraw.schema.js';

describe('schéma de retrait', () => {
  const schema = withdrawSchema(20000);

  it('accepte un multiple de 100 couvert par le solde', () => {
    expect(schema.safeParse({ amount: '15000', operator: 'om', phone: '07 00 00 00 00' }).success).toBe(true);
  });

  it('refuse les montants invalides ou supérieurs au solde', () => {
    expect(schema.safeParse({ amount: '1050', operator: 'om', phone: '0700000000' }).error.issues[0].message)
      .toBe('Saisissez un montant multiple de 100, minimum 1 000 FCFA.');
    expect(schema.safeParse({ amount: '25000', operator: 'om', phone: '0700000000' }).error.issues[0].message)
      .toBe('Montant supérieur à votre solde disponible.');
  });
});
