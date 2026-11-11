import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDebounce } from './useDebounce.js';

describe('useDebounce', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('attend le délai avant de publier la valeur', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'abidjan' });
    expect(result.current).toBe('a');
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('abidjan');
  });
});
