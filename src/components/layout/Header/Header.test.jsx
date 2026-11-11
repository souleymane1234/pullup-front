import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Header } from './Header.jsx';

describe('Header', () => {
  it('expose la navigation', () => {
    render(
      <MemoryRouter>
        <Header
          label="Principal"
          brand={<span>pullup</span>}
          items={[{ to: '/influenceurs', label: 'Influenceurs' }]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Influenceurs' })).toHaveAttribute('href', '/influenceurs');
  });
});
