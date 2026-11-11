import { Page } from './Page.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof Page>} */
const meta = { title: 'Layout/Page', component: Page, tags: ['autodocs'] };
export default meta;
export const Titre = { args: { title: 'Influenceurs', intro: 'Annuaire vérifié.', children: 'Contenu' } };
