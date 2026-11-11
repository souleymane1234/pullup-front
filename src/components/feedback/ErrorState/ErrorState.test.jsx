import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErrorState } from './ErrorState.jsx';

describe('ErrorState', () => {
  it('propose de réessayer', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorState text="Réseau coupé." onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Réseau coupé.');
    await user.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
