import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn.js';
import { useCompleteOnboarding, usePlatform } from '../hooks/usePlatform.js';

const SLIDES = [
  ['📣', 'Boostez vos publicités auprès d\'influenceurs vérifiés.'],
  ['🤝', 'Faites des partenariats avec les influenceurs qui parlent à vos clients.'],
  ['🔒', 'Payez en toute sécurité : l\'influenceur est payé après la publication.'],
];

/** Présentation en 3 écrans, affichée une seule fois sur mobile (moins de 720 px). */
export function Onboarding() {
  const { data } = usePlatform();
  const { mutate: complete } = useCompleteOnboarding();
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const nextRef = useRef(/** @type {HTMLButtonElement|null} */ (null));
  const show = Boolean(data) && !data.onboarded && !dismissed && window.innerWidth < 720;

  useEffect(() => {
    if (show) nextRef.current?.focus();
  }, [show, index]);

  if (!show) return null;

  const finish = () => {
    setDismissed(true);
    complete();
  };
  const [art, text] = SLIDES[index];

  return createPortal(
    <div className="onb" role="dialog" aria-modal="true" aria-label="Bienvenue sur PULLUP">
      <div className="row" style={{ width: '100%', justifyContent: 'space-between' }}>
        <span className="wordmark" style={{ color: '#fff', background: 'none', WebkitTextFillColor: '#fff' }}>pullup</span>
        <button type="button" className="btn sm ghost" style={{ color: '#fff', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.6)' }} onClick={finish}>
          Ignorer
        </button>
      </div>
      <div>
        <div className="art" style={{ margin: '0 auto 28px' }} aria-hidden="true">{art}</div>
        <h2 style={{ color: '#fff', maxWidth: '18ch', margin: '0 auto' }} aria-live="polite">{text}</h2>
      </div>
      <div style={{ width: '100%', maxWidth: 340 }}>
        <div className="dots" aria-hidden="true">
          {SLIDES.map(([emoji], k) => <i key={emoji} className={cn(k === index && 'on')} />)}
        </div>
        <button
          ref={nextRef}
          type="button"
          className="btn light block"
          onClick={() => (index < SLIDES.length - 1 ? setIndex(index + 1) : finish())}
        >
          {index < SLIDES.length - 1 ? 'Suivant' : 'Commencer'}
        </button>
      </div>
    </div>,
    document.body,
  );
}
