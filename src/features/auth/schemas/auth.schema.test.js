import { describe, expect, it } from 'vitest';
import { audienceSchema } from './auth.schema.js';

describe('audienceSchema', () => {
  it('accepte tous les réseaux renseignés', () => {
    const parsed = audienceSchema.parse({
      nets: { ig: 12000, tt: 8000, fb: 3000, sc: 1500 },
      cats: ['beaute'],
    });
    expect(parsed.nets).toEqual({ ig: 12000, tt: 8000, fb: 3000, sc: 1500 });
  });

  it('exige au moins un réseau avec des abonnés', () => {
    const result = audienceSchema.safeParse({
      nets: { ig: 0, tt: '', fb: 0, sc: '' },
      cats: ['beaute'],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === 'Indiquez au moins un réseau.')).toBe(true);
    }
  });
});
