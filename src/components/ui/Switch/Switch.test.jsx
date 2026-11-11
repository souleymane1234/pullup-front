import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './Switch.jsx';

describe('Switch', () => {
  it('annonce son état et propose la valeur inverse', async () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} label="Activer la V2" />);
    const toggle = screen.getByRole('switch', { name: 'Activer la V2' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('reste inactif quand il est verrouillé', async () => {
    const onChange = vi.fn();
    render(<Switch checked onChange={onChange} label="V1" disabled />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
