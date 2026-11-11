import { EmptyState } from './EmptyState.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof EmptyState>} */
const meta = { title: 'Feedback/EmptyState', component: EmptyState, tags: ['autodocs'] };
export default meta;
export const Defaut = { args: { title: 'Aucun message', text: 'Les échanges de campagne apparaîtront ici.' } };
