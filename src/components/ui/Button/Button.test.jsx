import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button.jsx';

describe('Button', () => {
  it('reste actionnable au clavier et à la souris', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Enregistrer</Button>);
    const button = screen.getByRole('button', { name: 'Enregistrer' });
    await user.click(button);
    button.focus();
    expect(button).toHaveFocus();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('expose l’état chargement et ignore le clic', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button loading onClick={onClick}>Enregistrer</Button>);
    const button = screen.getByRole('button', { name: 'Enregistrer' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
