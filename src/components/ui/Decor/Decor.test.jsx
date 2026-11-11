import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Floaters, Orbs } from './Decor.jsx';

describe('Decor', () => {
  it('reste invisible pour les technologies d’assistance', () => {
    const { container } = render(<><Orbs /><Floaters /></>);
    expect(container.querySelector('.orbs')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.floaters')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('.fl')).toHaveLength(14);
  });
});
