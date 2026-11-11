import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Shell } from './Shell.jsx';

describe('Shell', () => {
  it('offre un lien d’évitement vers le contenu', () => {
    render(
      <MemoryRouter initialEntries={['/influenceurs']}>
        <Routes>
          <Route
            element={(
              <Shell
                brand={<span>pullup</span>}
                items={[]}
                tabs={[]}
                navLabel="Principal"
                skipLabel="Aller au contenu"
              />
            )}
          >
            <Route path="/influenceurs" element={<p>Liste</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Aller au contenu' })).toHaveAttribute('href', '#contenu');
    expect(screen.getByRole('main')).toHaveTextContent('Liste');
  });
});
