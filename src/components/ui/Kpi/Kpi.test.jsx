import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Kpi, KpiGrid } from './Kpi.jsx';

describe('Kpi', () => {
  it('affiche la valeur et son libellé', () => {
    render(<KpiGrid><Kpi value="96 K" label="vues" /></KpiGrid>);
    expect(screen.getByText('96 K').tagName).toBe('B');
    expect(screen.getByText('vues')).toBeInTheDocument();
  });
});
