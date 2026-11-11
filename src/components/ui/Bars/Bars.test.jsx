import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Bars } from './Bars.jsx';

describe('Bars', () => {
  it('borne la largeur à 100 %', () => {
    const { container } = render(<Bars items={[{ label: 'Abidjan', value: 64 }, { label: 'Erreur', value: 140 }]} />);
    expect(screen.getByText('64 %')).toBeInTheDocument();
    const fills = container.querySelectorAll('.t i');
    expect(fills[0].style.width).toBe('64%');
    expect(fills[1].style.width).toBe('100%');
  });
});
