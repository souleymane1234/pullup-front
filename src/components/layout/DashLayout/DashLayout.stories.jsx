import { useState } from 'react';
import { DashLayout } from './DashLayout.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof DashLayout>} */
const meta = {
  title: 'Layout/DashLayout',
  component: DashLayout,
  tags: ['autodocs'],
};

export default meta;

const TABS = [
  { key: 'apercu', label: 'Aperçu' },
  { key: 'campagnes', label: 'Campagnes', count: 1 },
  { key: 'profil', label: 'Profil' },
];

function Interactive() {
  const [tab, setTab] = useState('apercu');
  return <DashLayout tabs={TABS} current={tab} onSelect={setTab}><h2>{tab}</h2></DashLayout>;
}

export const Annonceur = { render: () => <Interactive /> };
