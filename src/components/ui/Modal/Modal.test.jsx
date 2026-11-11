import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Modal } from './Modal.jsx';
import { Button } from '../Button/Button.jsx';

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Ouvrir</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Confirmer">
        <Modal.Body><p>Libérer les fonds ?</p></Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setOpen(false)}>Fermer</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

describe('Modal', () => {
  it('s’ouvre, piège le focus et se ferme avec Échap', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Ouvrir' }));
    const dialog = screen.getByRole('dialog', { name: 'Confirmer' });
    expect(dialog).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
