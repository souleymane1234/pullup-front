import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn.js';

/**
 * QR code dessiné dans un canvas. La bibliothèque est chargée à la demande pour rester hors du chemin critique.
 * @param {{ value: string, label: string, size?: number, className?: string, style?: import('react').CSSProperties,
 *   onReady?: (canvas: HTMLCanvasElement) => void }} props
 */
export function QrCode({ value, label, size = 240, className, style, onReady }) {
  const hostRef = useRef(/** @type {HTMLDivElement|null} */ (null));
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  useEffect(() => {
    let cancelled = false;
    import('qrcode')
      .then(({ default: QR }) => {
        const host = hostRef.current;
        if (cancelled || !host) return;
        const canvas = document.createElement('canvas');
        QR.toCanvas(canvas, value, { width: size, margin: 1, color: { dark: '#1A1730', light: '#ffffff' } }, (error) => {
          if (error || cancelled) return;
          host.replaceChildren(canvas);
          readyRef.current?.(canvas);
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return <div ref={hostRef} className={cn('qr', className)} style={style} role="img" aria-label={label} />;
}
