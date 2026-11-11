import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Portrait } from './Portrait.jsx';

describe('Portrait', () => {
  it('affiche les initiales sans photo', () => {
    const { container } = render(<Portrait name="Ama Kouassi" />);
    expect(container.querySelector('.portrait-initials').textContent).toBe('AK');
    expect(container.querySelector('img')).toBeNull();
  });

  it('affiche la photo, le badge vérifié et le contenu superposé', () => {
    const { container, getByRole } = render(
      <Portrait name="Ama Kouassi" photo="data:image/png;base64,AA" verified>
        <button type="button">Favori</button>
      </Portrait>,
    );
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
    expect(container.querySelector('.portrait-vf')).not.toBeNull();
    expect(getByRole('button', { name: 'Favori' })).toBeInTheDocument();
  });
});
