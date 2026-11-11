import { useState } from 'react';
import { Switch } from './Switch.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof Switch>} */
const meta = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: { label: 'Paiement sous séquestre', checked: true, onChange: () => {} },
};

export default meta;

export const Active = {};
export const Verrouille = { args: { disabled: true } };
function InteractiveSwitch(args) {
  const [on, setOn] = useState(false);
  return <Switch {...args} checked={on} onChange={setOn} />;
}

export const Interactif = { render: (args) => <InteractiveSwitch {...args} /> };
