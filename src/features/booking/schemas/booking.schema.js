import { z } from 'zod';
import { MAX_BRIEF_WORDS } from '@/domain/catalog.js';
import { wordCount } from '@/domain/metrics.js';

export const briefSchema = z.object({
  title: z.string().trim().min(1, 'Donnez un nom à la campagne.'),
  objective: z.enum(['notoriete', 'engagement', 'trafic', 'conversion']),
  text: z.string()
    .refine((text) => wordCount(text) >= 5, 'Ajoutez quelques consignes pour l\'influenceur.')
    .refine((text) => wordCount(text) <= MAX_BRIEF_WORDS, `${MAX_BRIEF_WORDS} mots maximum.`),
  link: z.union([z.literal(''), z.string().trim().regex(/^https?:\/\//, 'Le lien doit commencer par https://')]),
  date: z.string(),
  file: z.string(),
});

export const paymentSchema = z.object({
  pay: z.enum(['om', 'mtn', 'moov', 'wave', 'card']),
  phone: z.string(),
}).refine((value) => value.pay === 'card' || /^[0-9 ]{8,}$/.test(value.phone.trim()), {
  path: ['phone'],
  message: 'Saisissez un numéro de téléphone valide.',
});

export const MAX_FILE_SIZE = 9 * 1024 * 1024;
