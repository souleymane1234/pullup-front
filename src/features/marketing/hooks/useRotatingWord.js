import { useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery.js';

/**
 * Fait défiler une liste de mots. `phase` vaut `out` pendant la sortie, `pre` juste avant l'entrée
 * du mot suivant (classe CSS sans transition), puis `idle`. Immobile si l'utilisateur réduit les animations.
 * @param {string[]} words
 * @param {{ interval?: number, transition?: number }} [options]
 * @returns {{ word: string, phase: 'idle'|'out'|'pre' }}
 */
export function useRotatingWord(words, { interval = 2800, transition = 450 } = {}) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState(/** @type {'idle'|'out'|'pre'} */ ('idle'));

  useEffect(() => {
    if (reduced || words.length < 2) return undefined;
    let swap;
    let frame;
    const tick = window.setInterval(() => {
      if (document.hidden) return;
      setPhase('out');
      swap = window.setTimeout(() => {
        setIndex((k) => (k + 1) % words.length);
        setPhase('pre');
        frame = window.requestAnimationFrame(() => {
          frame = window.requestAnimationFrame(() => setPhase('idle'));
        });
      }, transition);
    }, interval);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(swap);
      window.cancelAnimationFrame(frame);
    };
  }, [reduced, words.length, interval, transition]);

  return { word: words[index], phase };
}
