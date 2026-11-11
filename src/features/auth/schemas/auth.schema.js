import { z } from 'zod';
import { MIN_RATE, NET } from '@/domain/catalog.js';

export const loginSchema = z.object({
  email: z.string().trim().email('Saisissez un e-mail valide.'),
  password: z.string().min(1, 'Saisissez votre mot de passe.'),
});

export const forgotSchema = z.object({
  email: z.string().trim().email('Saisissez un e-mail valide.'),
});

export const resetSchema = z.object({
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
});

export const signupBrandSchema = z.object({
  company: z.string().trim().min(1, 'Indiquez l\'entreprise ou la marque.'),
  contact: z.string().trim().min(1, 'Indiquez votre nom.'),
  email: z.string().trim().email('Saisissez un e-mail valide.'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
});

/** Nom d'utilisateur normalisé : minuscules, chiffres, point et tiret bas. */
export const normalizeHandle = (value) => value.toLowerCase().replace(/[^a-z0-9._]/g, '');

export const identitySchema = z.object({
  name: z.string().trim().min(1, 'Nom affiché requis.'),
  handle: z.string().transform(normalizeHandle).pipe(z.string().min(1, 'Nom d\'utilisateur requis.')),
  email: z.string().trim().email('Saisissez un e-mail valide.'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
  phone: z.string().trim(),
  city: z.string().min(1),
});

const followers = z.union([z.literal(''), z.coerce.number().min(0, 'Nombre positif.')]);
const netsShape = Object.fromEntries(Object.keys(NET).map((key) => [key, followers]));

export const audienceSchema = z.object({
  nets: z.object(netsShape)
    .refine((nets) => Object.values(nets).some((v) => Number(v) > 0), 'Indiquez au moins un réseau.'),
  cats: z.array(z.string()).min(1, 'Choisissez au moins une thématique.').max(3, '3 thématiques maximum.'),
});

export const offerSchema = z.object({
  pub: z.boolean(),
  part: z.boolean(),
  ded: z.boolean(),
  price: z.coerce.number({ invalid_type_error: 'Prix minimum 5 000 FCFA.' }).min(MIN_RATE, 'Prix minimum 5 000 FCFA.'),
  promo: z.string().optional(),
  cgu: z.literal(true, { errorMap: () => ({ message: 'Acceptez les conditions générales pour continuer.' }) }),
});
