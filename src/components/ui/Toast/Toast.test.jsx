import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ToastViewport } from './Toast.jsx';

describe('ToastViewport', () => {
  it('annonce le message aux technologies d’assistance', () => {
    render(<ToastViewport toasts={[{ id: 1, message: 'Lien copié.' }]} />);
    expect(screen.getByRole('status')).toHaveTextContent('Lien copié.');
  });

  it('n’affiche rien sans message', () => {
    const { container } = render(<ToastViewport />);
    expect(container).toBeEmptyDOMElement();
  });
});
