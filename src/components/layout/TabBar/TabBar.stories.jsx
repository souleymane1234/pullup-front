import { MemoryRouter } from 'react-router-dom';
import { TabBar } from './TabBar.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof TabBar>} */
const meta = {
  title: 'Layout/TabBar',
  component: TabBar,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
};
export default meta;

export const Mobile = {
  args: {
    label: 'Navigation principale',
    items: [
      { to: '/', label: 'Accueil', end: true },
      { to: '/influenceurs', label: 'Explorer' },
      { to: '/matching', label: 'Matching' },
      { to: '/campagnes', label: 'Campagnes' },
      { to: '/connexion', label: 'Compte' },
    ],
  },
};
