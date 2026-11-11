import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { VirtualList } from './VirtualList.jsx';

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get: () => 400 });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => 300 });
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});

describe('VirtualList', () => {
  it('rend les éléments visibles', () => {
    render(
      <VirtualList
        items={['Awa', 'Yao']}
        renderItem={(name) => <p>{name}</p>}
        getKey={(name) => name}
      />,
    );
    expect(screen.getByText('Awa')).toBeInTheDocument();
    expect(screen.getByText('Yao')).toBeInTheDocument();
  });
});
