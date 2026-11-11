import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Icon, ICON_NAMES } from './Icon.jsx';

describe('Icon', () => {
  it('est décorative et masquée aux lecteurs d’écran', () => {
    const { container } = render(<Icon name="lock" size={18} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('width', '18');
  });

  it('retombe sur une icône par défaut si le nom est inconnu', () => {
    const { container } = render(<Icon name="inconnue" />);
    expect(container.querySelector('svg path')).not.toBeNull();
    expect(ICON_NAMES).toContain('spark');
  });
});
