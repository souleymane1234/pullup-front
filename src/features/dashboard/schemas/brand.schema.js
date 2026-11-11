import { z } from 'zod';

export const brandProfileSchema = z.object({
  name: z.string().trim().min(1, 'Indiquez le nom de la marque.'),
  contact: z.string().trim().min(1, 'Indiquez le contact.'),
  sector: z.string().trim(),
});
