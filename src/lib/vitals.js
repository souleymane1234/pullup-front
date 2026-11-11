import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { env } from './env.js';

/**
 * Mesure les Web Vitals en production et les envoie vers un endpoint public si configuré.
 * @param {(metric: import('web-vitals').Metric) => void} [onReport]
 */
export function reportWebVitals(onReport) {
  const report = (metric) => {
    onReport?.(metric);
    if (!env.vitalsEndpoint) return;
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      navigationType: metric.navigationType,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(env.vitalsEndpoint, body);
      return;
    }
    fetch(env.vitalsEndpoint, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {});
  };

  onCLS(report);
  onFCP(report);
  onINP(report);
  onLCP(report);
  onTTFB(report);
}
