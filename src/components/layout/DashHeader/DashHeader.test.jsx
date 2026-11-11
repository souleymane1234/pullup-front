import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashHeader } from './DashHeader.jsx';

describe('DashHeader', () => {
  it('affiche le titre de section, le sous-titre et les actions', () => {
    render(<DashHeader title="Mes campagnes" subtitle="3 en cours" actions={<button type="button">Exporter</button>} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Mes campagnes' })).toBeInTheDocument();
    expect(screen.getByText('3 en cours')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exporter' })).toBeInTheDocument();
  });
});
