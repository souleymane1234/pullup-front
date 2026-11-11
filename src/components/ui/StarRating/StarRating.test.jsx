import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StarRating } from './StarRating.jsx';

describe('StarRating', () => {
  it('permet de choisir une note', async () => {
    const onChange = vi.fn();
    render(<StarRating value={5} onChange={onChange} label="Note" />);
    expect(screen.getByRole('radio', { name: '5 étoiles' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(screen.getByRole('radio', { name: '3 étoiles' }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('affiche une note en lecture seule', () => {
    render(<StarRating value={4} label="Note" />);
    expect(screen.getByRole('img', { name: '4 sur 5' })).toBeInTheDocument();
  });
});
