import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Carousel } from './Carousel.jsx';

function Demo() {
  return (
    <Carousel>
      <Carousel.Arrows previousLabel="Précédents" nextLabel="Suivants" />
      <Carousel.Track label="Profils">
        <article>Un</article>
        <article>Deux</article>
      </Carousel.Track>
      <Carousel.Status />
    </Carousel>
  );
}

describe('Carousel', () => {
  it('expose une zone focusable et des flèches nommées', async () => {
    Element.prototype.scrollBy = vi.fn();
    Element.prototype.scrollTo = vi.fn();
    render(<Demo />);
    const track = screen.getByRole('tabpanel', { name: 'Profils' });
    expect(track).toHaveAttribute('tabindex', '0');
    await userEvent.click(screen.getByRole('button', { name: 'Suivants' }));
    expect(screen.getByText('⏸ En pause')).toBeInTheDocument();
  });

  it('refuse les sous-composants hors contexte', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Carousel.Status />)).toThrow();
  });
});
