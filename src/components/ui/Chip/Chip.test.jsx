import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chip } from './Chip.jsx';

describe('Chip', () => {
  it('utilise aria-pressed par défaut', () => {
    render(<Chip selected>Notoriété</Chip>);
    expect(screen.getByRole('button', { name: 'Notoriété' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('utilise aria-selected dans un tablist', () => {
    render(<div role="tablist"><Chip role="tab">Humour</Chip></div>);
    expect(screen.getByRole('tab', { name: 'Humour' })).toHaveAttribute('aria-selected', 'false');
  });
});
