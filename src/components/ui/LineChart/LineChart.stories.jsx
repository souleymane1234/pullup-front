import { LineChart } from './LineChart.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof LineChart>} */
const meta = {
  title: 'UI/LineChart',
  component: LineChart,
  tags: ['autodocs'],
  args: {
    label: 'Visites de la vitrine sur 30 jours',
    values: Array.from({ length: 30 }, (_, d) => Math.round(300 * (0.65 + 0.5 * Math.abs(Math.sin(d * 1.7)) + d / 60))),
  },
};

export default meta;

export const Visites = {};
