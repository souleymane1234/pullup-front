import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DashLayout } from './DashLayout.jsx';

describe('DashLayout', () => {
  it('signale la section courante et change de section', async () => {
    const onSelect = vi.fn();
    render(
      <DashLayout tabs={[{ key: 'apercu', label: 'Aperçu' }, { key: 'campagnes', label: 'Campagnes', count: 2 }]} current="apercu" onSelect={onSelect}>
        <p>Contenu</p>
      </DashLayout>,
    );
    expect(screen.getByRole('button', { name: 'Aperçu' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', { name: 'Campagnes 2' }));
    expect(onSelect).toHaveBeenCalledWith('campagnes');
  });
});
