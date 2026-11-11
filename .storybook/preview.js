import '../src/styles/fonts.css';
import '../src/styles/tokens.css';
import '../src/styles/global.css';
import '../src/styles/components.css';

/** @type {import('@storybook/react-vite').Preview} */
const preview = {
  parameters: {
    a11y: { test: 'todo' },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};

export default preview;
