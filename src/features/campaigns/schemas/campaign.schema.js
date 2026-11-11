import { z } from 'zod';

export const proofSchema = z.object({
  url: z.string().trim().regex(/^https?:\/\//, 'Collez le lien complet de votre publication.'),
  note: z.string().trim().max(300, '300 caractères maximum.'),
});

export const disputeSchema = z.object({
  reason: z.string().trim().min(10, 'Décrivez le problème en quelques mots (10 caractères minimum).'),
});

export const reviewSchema = z.object({
  stars: z.number().int().min(1).max(5),
  text: z.string().trim().min(10, 'Ajoutez quelques mots sur la collaboration.'),
});
