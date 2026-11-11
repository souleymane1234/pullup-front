import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PlansGrid } from './PlansGrid.jsx';

describe('PlansGrid', () => {
  it('active Découverte sans paiement et demande un numéro pour Pro', async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    render(<PlansGrid current="pro" canPick onPick={onPick} />);

    await user.click(screen.getByRole('button', { name: 'Choisir Découverte' }));
    expect(onPick).toHaveBeenCalledWith('free');

    await user.click(screen.getByRole('button', { name: 'Choisir Business' }));
    expect(screen.getByRole('dialog', { name: 'Formule Business' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Activer Business' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Saisissez un numéro de téléphone valide.');

    await user.type(screen.getByLabelText('Numéro Orange Money'), '07 00 00 00 00');
    await user.click(screen.getByRole('button', { name: 'Activer Business' }));
    expect(onPick).toHaveBeenCalledWith({ plan: 'business', pay: 'om', phone: '07 00 00 00 00' });
  });
});
