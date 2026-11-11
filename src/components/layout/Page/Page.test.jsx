import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Page } from './Page.jsx';

describe('Page', () => {
  it('affiche le titre', () => {
    render(<Page title="Influenceurs"><p>Liste</p></Page>);
    expect(screen.getByRole('heading', { level: 1, name: 'Influenceurs' })).toBeInTheDocument();
  });
});
