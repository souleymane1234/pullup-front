import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LineChart } from './LineChart.jsx';

describe('LineChart', () => {
  it('rend une image nommée avec une courbe', () => {
    const { container } = render(<LineChart values={[1, 4, 2, 8]} label="Visites sur 30 jours" />);
    expect(screen.getByRole('img', { name: 'Visites sur 30 jours' })).toBeInTheDocument();
    expect(container.querySelectorAll('path')).toHaveLength(2);
  });

  it('supporte une série nulle', () => {
    const { container } = render(<LineChart values={[0, 0, 0]} label="Vide" />);
    expect(container.querySelector('path').getAttribute('d')).not.toContain('NaN');
  });
});
