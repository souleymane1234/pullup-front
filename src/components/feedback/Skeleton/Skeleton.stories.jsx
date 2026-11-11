import { Skeleton, PageSkeleton } from './Skeleton.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof Skeleton>} */
const meta = { title: 'Feedback/Skeleton', component: Skeleton, tags: ['autodocs'] };
export default meta;
export const Ligne = { args: { width: 240, height: 20 } };
export const Page = { render: () => <PageSkeleton /> };
