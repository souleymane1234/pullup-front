import { ErrorState } from './ErrorState.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof ErrorState>} */
const meta = { title: 'Feedback/ErrorState', component: ErrorState, tags: ['autodocs'] };
export default meta;
export const AvecReessai = { args: { text: 'Le serveur n’a pas répondu.', onRetry: () => {} } };
