import { useState } from 'react';
import { StarRating } from './StarRating.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof StarRating>} */
const meta = {
  title: 'UI/StarRating',
  component: StarRating,
  tags: ['autodocs'],
  args: { value: 4, label: 'Note de la collaboration' },
};

export default meta;

export const LectureSeule = {};

function EditableRating(args) {
  const [value, setValue] = useState(5);
  return <StarRating {...args} value={value} onChange={setValue} />;
}

export const Editable = { render: (args) => <EditableRating {...args} /> };
