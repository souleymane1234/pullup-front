import { z } from 'zod';

/** @param {number} available */
export const withdrawSchema = (available) => z.object({
  amount: z.coerce.number()
    .refine((n) => n >= 1000 && n % 100 === 0, 'Saisissez un montant multiple de 100, minimum 1 000 FCFA.')
    .refine((n) => n <= available, 'Montant supérieur à votre solde disponible.'),
  operator: z.enum(['om', 'mtn', 'moov', 'wave']),
  phone: z.string().refine((v) => v.replace(/\D/g, '').length >= 8, 'Saisissez votre numéro mobile money.'),
});
