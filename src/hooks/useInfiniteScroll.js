import { useEffect, useRef } from 'react';

/**
 * Déclenche `onLoadMore` quand l'élément renvoyé entre dans le viewport (ou dans `root`).
 * @param {{ enabled?: boolean, onLoadMore: () => void, root?: React.RefObject<Element|null> }} options
 */
export function useInfiniteScroll({ enabled = true, onLoadMore, root }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      },
      { root: root?.current ?? null, rootMargin: '240px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, onLoadMore, root]);

  return ref;
}
