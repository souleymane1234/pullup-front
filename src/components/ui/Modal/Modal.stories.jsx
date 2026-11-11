import { useState } from 'react';
import { Modal } from './Modal.jsx';
import { Button } from '../Button/Button.jsx';

function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Ouvrir</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Confirmer la libération">
        <Modal.Body>
          <p>Les fonds bloqués seront versés à l'influenceur.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={() => setOpen(false)}>Confirmer</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

/** @type {import('@storybook/react-vite').Meta<typeof Demo>} */
const meta = {
  title: 'UI/Modal',
  component: Demo,
  tags: ['autodocs'],
};

export default meta;

export const Dialogue = {};
