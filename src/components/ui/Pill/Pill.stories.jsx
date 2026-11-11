import { Pill } from './Pill.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof Pill>} */
const meta = {
  title: 'UI/Pill',
  component: Pill,
  tags: ['autodocs'],
  args: { children: 'Publiée · à valider', tone: 'orange' },
};

export default meta;

export const Defaut = {};
export const Tonalites = {
  render: () => (
    <div className="row">
      {['ok', 'warn', 'orange', 'danger', 'info', 'mute'].map((tone) => <Pill key={tone} tone={tone}>{tone}</Pill>)}
    </div>
  ),
};
