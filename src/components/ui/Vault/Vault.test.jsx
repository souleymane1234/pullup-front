import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Vault } from './Vault.jsx';

describe('Vault', () => {
  it('affiche le montant et le détail', () => {
    render(<Vault title="Fonds sous séquestre" amount="90 000 FCFA" lines={[{ label: 'Commission', value: '13 500 FCFA' }]} />);
    expect(screen.getByText('Fonds sous séquestre')).toBeInTheDocument();
    expect(screen.getByText('90 000 FCFA')).toHaveClass('amt');
    expect(screen.getByText('13 500 FCFA')).toBeInTheDocument();
  });
});
