import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof Header>} */
const meta = {
  title: 'Layout/Header',
  component: Header,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
};
export default meta;

export const Barre = {
  args: {
    label: 'Principal',
    brand: <strong>pullup</strong>,
    items: [
      { to: '/', label: 'Accueil', end: true },
      { to: '/influenceurs', label: 'Influenceurs' },
    ],
  },
};
