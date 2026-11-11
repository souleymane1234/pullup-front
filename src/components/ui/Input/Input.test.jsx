import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './Input.jsx';

describe('Input', () => {
  it('relie le libellé, l’aide et l’erreur au champ', () => {
    render(<Input label="E-mail" hint="Professionnel" error="E-mail invalide" />);
    const field = screen.getByLabelText('E-mail');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription('Professionnel E-mail invalide');
    expect(screen.getByRole('alert')).toHaveTextContent('E-mail invalide');
  });

  it('transmet la ref et sait rendre une zone de texte', () => {
    const ref = createRef();
    render(<Input as="textarea" label="Message" ref={ref} />);
    expect(ref.current).toBe(screen.getByLabelText('Message'));
    expect(ref.current.tagName).toBe('TEXTAREA');
  });
});
