import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Pill } from './Pill.jsx';

describe('Pill', () => {
  it('applique la tonalité et le mode sans pastille', () => {
    render(<Pill tone="ok" dot={false}>Active</Pill>);
    expect(screen.getByText('Active')).toHaveClass('pill', 'p-ok', 'nodot');
  });
});
