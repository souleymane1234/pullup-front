import { QrCode } from './QrCode.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof QrCode>} */
const meta = {
  title: 'UI/QrCode',
  component: QrCode,
  tags: ['autodocs'],
  args: {
    value: 'https://pullup.net/@amakouassi',
    label: 'QR code de la vitrine',
    style: { width: 150, height: 150, padding: 8, background: '#fff', borderRadius: 14 },
  },
};

export default meta;

export const Vitrine = {};
