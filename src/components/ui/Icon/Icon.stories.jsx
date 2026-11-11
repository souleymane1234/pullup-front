import { Icon, ICON_NAMES } from './Icon.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof Icon>} */
const meta = {
  title: 'UI/Icon',
  component: Icon,
  tags: ['autodocs'],
  args: { name: 'spark', size: 32 },
  argTypes: { name: { control: 'select', options: ICON_NAMES } },
};

export default meta;

export const Unique = {};
export const Catalogue = {
  render: () => (
    <div className="row" style={{ gap: 18 }}>
      {ICON_NAMES.map((name) => (
        <span key={name} className="stack" style={{ alignItems: 'center', gap: 4 }}>
          <Icon name={name} size={28} />
          <span className="tiny muted">{name}</span>
        </span>
      ))}
    </div>
  ),
};
