import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

/**
 * Liste virtualisée sans logique métier. Le parent fournit les éléments et le rendu.
 * @template T
 * @param {{
 *   items: T[],
 *   estimateSize?: number,
 *   renderItem: (item: T, index: number) => import('react').ReactNode,
 *   getKey?: (item: T, index: number) => string|number,
 *   footer?: import('react').ReactNode,
 * }} props
 */
export function VirtualList({ items, estimateSize = 88, renderItem, getKey, footer = null }) {
  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 8,
  });

  return (
    <div ref={parentRef} className="vlist">
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];
          return (
            <div
              key={getKey ? getKey(item, virtualRow.index) : virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
      {footer}
    </div>
  );
}
