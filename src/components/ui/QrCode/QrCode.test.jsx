import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QrCode } from './QrCode.jsx';

describe('QrCode', () => {
  it('expose une image nommée même avant le chargement du canvas', () => {
    render(<QrCode value="https://pullup.net/@amakouassi" label="QR code de la vitrine" />);
    expect(screen.getByRole('img', { name: 'QR code de la vitrine' })).toHaveClass('qr');
  });
});
