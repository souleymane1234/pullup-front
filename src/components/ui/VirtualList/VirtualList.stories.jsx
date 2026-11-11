import { VirtualList } from './VirtualList.jsx';

const items = Array.from({ length: 40 }, (_, index) => `Profil ${index + 1}`);

/** @type {import('@storybook/react-vite').Meta<typeof VirtualList>} */
const meta = { title: 'UI/VirtualList', component: VirtualList };
export default meta;

export const Longue = {
  args: {
    items,
    estimateSize: 48,
    getKey: (item) => item,
    renderItem: (item) => <p style={{ margin: 0, padding: '12px 0', borderBottom: '1px solid var(--line)' }}>{item}</p>,
  },
};
