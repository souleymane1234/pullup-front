import { z } from 'zod';

export const messageSchema = z.object({
  text: z.string().trim().min(1, 'Écrivez un message.').max(1000, '1 000 caractères maximum.'),
});
