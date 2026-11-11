import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery.js';

const CarouselContext = createContext(/** @type {any} */ (null));

function useCarousel() {
  const context = useContext(CarouselContext);
  if (!context) throw new Error('Les sous-composants de Carousel doivent être placés dans <Carousel>.');
  return context;
}

const GAP = 16;

/**
 * Carrousel horizontal. Défile seul toutes les `interval` ms et se met en pause au survol, au focus clavier,
 * 8 s après un geste, hors écran ou onglet masqué. Aucun défilement automatique avec `prefers-reduced-motion`.
 * @param {{ children: import('react').ReactNode, interval?: number, resetKey?: unknown }} props
 */
export function Carousel({ children, interval = 3800, resetKey }) {
  const trackRef = useRef(/** @type {HTMLDivElement|null} */ (null));
  const pauseUntil = useRef(0);
  const [hover, setHover] = useState(false);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState({ width: 100, shift: 0 });
  const [, refresh] = useReducer((x) => x + 1, 0);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const next = useCallback(() => {
    const track = trackRef.current;
    const first = track?.firstElementChild;
    if (!track || !first) return;
    const width = first.getBoundingClientRect().width + GAP;
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 6) track.scrollTo({ left: 0 });
    else track.scrollBy({ left: width });
  }, []);

  const previous = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const width = (track.firstElementChild?.getBoundingClientRect().width ?? 300) + GAP;
    if (track.scrollLeft <= 4) track.scrollTo({ left: track.scrollWidth });
    else track.scrollBy({ left: -width });
  }, []);

  const pauseAfterGesture = useCallback(() => {
    pauseUntil.current = Date.now() + 8000;
    refresh();
  }, []);

  const canAutoplay = useCallback(() => {
    const track = trackRef.current;
    return Boolean(track)
      && !reduceMotion
      && visible
      && !hover
      && !document.hidden
      && Date.now() > pauseUntil.current
      && track.scrollWidth > track.clientWidth + 4;
  }, [reduceMotion, visible, hover]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (canAutoplay()) next();
      refresh();
    }, interval);
    return () => window.clearInterval(id);
  }, [canAutoplay, next, interval]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver((entries) => setVisible(entries[0].isIntersecting), { threshold: 0.3 });
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const update = () => {
      const fraction = Math.min(1, track.clientWidth / Math.max(track.scrollWidth, 1));
      const max = track.scrollWidth - track.clientWidth;
      setProgress({ width: fraction * 100, shift: max > 0 ? (track.scrollLeft / max) * (1 / fraction - 1) * 100 : 0 });
    };
    track.scrollLeft = 0;
    update();
    track.addEventListener('scroll', update, { passive: true });
    return () => track.removeEventListener('scroll', update);
  }, [resetKey]);

  const value = useMemo(() => ({
    trackRef, next, previous, pauseAfterGesture, setHover, canAutoplay, reduceMotion, progress,
  }), [next, previous, pauseAfterGesture, canAutoplay, reduceMotion, progress]);

  return <CarouselContext.Provider value={value}>{children}</CarouselContext.Provider>;
}

/**
 * Zone défilante. Les enfants directs sont les diapositives.
 * @param {{ children: import('react').ReactNode, label: string, id?: string, labelledBy?: string }} props
 */
function Track({ children, label, id, labelledBy }) {
  const { trackRef, next, previous, pauseAfterGesture, setHover } = useCarousel();
  const handlers = useRef({ next, previous, pauseAfterGesture, setHover });
  handlers.current = { next, previous, pauseAfterGesture, setHover };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const call = (name, ...args) => handlers.current[name](...args);
    const onKeyDown = (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      call('pauseAfterGesture');
      call(event.key === 'ArrowRight' ? 'next' : 'previous');
    };
    const onEnter = (event) => event.pointerType === 'mouse' && call('setHover', true);
    const onLeave = (event) => event.pointerType === 'mouse' && call('setHover', false);
    const onTouch = () => call('pauseAfterGesture');
    const onFocus = () => call('setHover', true);
    const onBlur = () => call('setHover', false);
    const events = [
      ['keydown', onKeyDown], ['pointerenter', onEnter], ['pointerleave', onLeave],
      ['touchstart', onTouch], ['focusin', onFocus], ['focusout', onBlur],
    ];
    events.forEach(([type, fn]) => track.addEventListener(type, fn, { passive: type === 'touchstart' }));
    return () => events.forEach(([type, fn]) => track.removeEventListener(type, fn));
  }, [trackRef]);

  return (
    <div className="car" aria-roledescription="carrousel">
      <div
        ref={trackRef}
        id={id}
        className="car-track"
        role="tabpanel"
        tabIndex={0}
        aria-label={labelledBy ? undefined : label}
        aria-labelledby={labelledBy}
      >
        {children}
      </div>
    </div>
  );
}

/** @param {{ previousLabel: string, nextLabel: string }} props */
function Arrows({ previousLabel, nextLabel }) {
  const { next, previous, pauseAfterGesture } = useCarousel();
  return (
    <div className="car-arrows">
      <button type="button" aria-label={previousLabel} onClick={() => { pauseAfterGesture(); previous(); }}>‹</button>
      <button type="button" aria-label={nextLabel} onClick={() => { pauseAfterGesture(); next(); }}>›</button>
    </div>
  );
}

/** @param {{ labels?: { manual: string, auto: string, paused: string } }} props */
function Status({ labels = { manual: 'Défilement manuel', auto: 'Défilement automatique', paused: '⏸ En pause' } }) {
  const { progress, canAutoplay, reduceMotion } = useCarousel();
  let state = <>{labels.paused}</>;
  if (reduceMotion) state = <>{labels.manual}</>;
  else if (canAutoplay()) state = <><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)' }} />{labels.auto}</>;
  return (
    <div className="row between" style={{ marginTop: 6 }}>
      <div className="car-progress"><i style={{ width: `${progress.width}%`, transform: `translateX(${progress.shift}%)` }} /></div>
      <div className="car-state">{state}</div>
    </div>
  );
}

Carousel.Track = Track;
Carousel.Arrows = Arrows;
Carousel.Status = Status;
