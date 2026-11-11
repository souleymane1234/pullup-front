import { Icon } from '@/components/ui/Icon/Icon.jsx';

/**
 * Pastille d'identité : photo, ou initiales sur un dégradé dérivé de `hue`.
 * @param {{ name: string, hue?: number, photo?: string|null, verified?: boolean, size?: number }} props
 */
export function Avatar({ name, hue = 220, photo = null, verified = false, size = 48 }) {
  const initials = name.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase();
  const background = photo
    ? 'var(--surface-2)'
    : `linear-gradient(140deg,hsl(${hue} 62% 46%),hsl(${(hue + 50) % 360} 55% 36%))`;
  return (
    <span className="avatar" style={{ '--s': `${size}px`, background }} aria-hidden="true">
      {photo ? <img src={photo} alt="" width={size} height={size} /> : initials}
      {verified ? <span className="vf"><Icon name="verified" /></span> : null}
    </span>
  );
}
