import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from './Avatar.jsx';

describe('Avatar', () => {
  it('affiche les initiales sans photo', () => {
    const { container } = render(<Avatar name="Ama Kouassi" />);
    expect(container.textContent).toBe('AK');
  });

  it('affiche la photo et le badge vérifié', () => {
    const { container } = render(<Avatar name="Ama Kouassi" photo="data:image/png;base64,AA" verified size={64} />);
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
    expect(container.querySelector('.vf')).not.toBeNull();
    expect(container.querySelector('.avatar').style.getPropertyValue('--s')).toBe('64px');
  });
});
