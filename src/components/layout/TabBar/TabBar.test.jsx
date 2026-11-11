import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TabBar } from './TabBar.jsx';

describe('TabBar', () => {
  it('liste les destinations', () => {
    render(
      <MemoryRouter>
        <TabBar label="Mobile" items={[{ to: '/messages', label: 'Messages' }]} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('navigation', { name: 'Mobile' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Messages' })).toBeInTheDocument();
  });
});
