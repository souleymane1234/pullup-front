import { z } from 'zod';

export const CONTACT_TYPES = ['Publicité', 'Partenariat', 'Dédicace'];

export const contactSchema = z.object({
  type: z.string().trim().min(1, 'Type de demande inconnu.'),
  from: z.string().trim().min(1, 'Indiquez votre nom ou votre entreprise.'),
  contact: z.string().trim().min(1, 'Indiquez un téléphone ou un e-mail.'),
  msg: z.string().trim().min(10, 'Le message doit contenir entre 10 et 1 000 caractères.').max(1000, 'Le message doit contenir entre 10 et 1 000 caractères.'),
});

/** Filtres de l'annuaire lus depuis l'URL : toute valeur inconnue est ignorée. */
export const FILTER_KEYS = ['s', 'cat', 'net', 'badge', 'budget', 'sort'];
export const SORTS = { score: 'Meilleur score', plus: 'Plus d\'abonnés', moins: 'Moins d\'abonnés', eng: 'Meilleur engagement', prix: 'Prix le plus bas' };
export const BUDGETS = ['25000', '50000', '100000', '200000'];
export const LEVELS = { macro: 'Macro influenceurs', montee: 'En montée', normal: 'Influenceurs' };
