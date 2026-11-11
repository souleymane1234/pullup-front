import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './EmptyState.jsx';

describe('EmptyState', () => {
  it('affiche le titre fourni', () => {
    render(<EmptyState title="Aucune campagne" text="Créez-en une." />);
    expect(screen.getByRole('heading', { name: 'Aucune campagne' })).toBeInTheDocument();
  });
});
