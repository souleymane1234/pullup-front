import { describe, expect, it } from 'vitest';
import { formatDate, formatFcfa } from './format.js';

describe('format', () => {
  it('écrit un montant en francs CFA', () => {
    expect(formatFcfa(90000).replace(/\s/g, ' ')).toBe('90 000 FCFA');
  });

  it('formate une date en français', () => {
    expect(formatDate('2026-10-04T10:00:00.000Z')).toMatch(/2026/);
  });
});
