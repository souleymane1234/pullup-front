import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Table } from './Table.jsx';

const columns = [{ key: 'name', header: 'Nom' }];

describe('Table', () => {
  it('affiche l’état vide', () => {
    render(<Table columns={columns} rows={[]} caption="Campagnes" emptyTitle="Aucune campagne" />);
    expect(screen.getByRole('heading', { name: 'Aucune campagne' })).toBeInTheDocument();
  });

  it('affiche les lignes', () => {
    render(<Table columns={columns} rows={[{ id: '1', name: 'Karité Glow' }]} caption="Campagnes" />);
    expect(screen.getByRole('table', { name: 'Campagnes' })).toBeInTheDocument();
    expect(screen.getByText('Karité Glow')).toBeInTheDocument();
  });
});
