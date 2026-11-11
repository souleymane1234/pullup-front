import { describe, expect, it } from 'vitest';
import { briefSchema, paymentSchema } from '../schemas/booking.schema.js';

const brief = { title: 'Lancement', objective: 'notoriete', text: 'Montrez le produit au réveil svp', link: '', date: '', file: '' };

describe('schémas de réservation', () => {
  it('exige un titre, au moins 5 mots et un lien https', () => {
    expect(briefSchema.safeParse(brief).success).toBe(true);
    expect(briefSchema.safeParse({ ...brief, title: ' ' }).error.issues[0].message).toBe('Donnez un nom à la campagne.');
    expect(briefSchema.safeParse({ ...brief, text: 'trop court' }).error.issues[0].message).toBe('Ajoutez quelques consignes pour l\'influenceur.');
    expect(briefSchema.safeParse({ ...brief, text: 'mot '.repeat(161) }).error.issues[0].message).toBe('160 mots maximum.');
    expect(briefSchema.safeParse({ ...brief, link: 'savane.ci' }).error.issues[0].message).toBe('Le lien doit commencer par https://');
  });

  it('demande un numéro sauf pour la carte', () => {
    expect(paymentSchema.safeParse({ pay: 'card', phone: '' }).success).toBe(true);
    expect(paymentSchema.safeParse({ pay: 'om', phone: '07 00 00 00' }).success).toBe(true);
    expect(paymentSchema.safeParse({ pay: 'wave', phone: '07' }).error.issues[0].message).toBe('Saisissez un numéro de téléphone valide.');
  });
});
