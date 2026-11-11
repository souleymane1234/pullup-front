import { Orbs } from '@/components/ui/Decor/Decor.jsx';
import { Icon } from '@/components/ui/Icon/Icon.jsx';

/**
 * Encart « coffre-fort » : montant mis en avant et détail ligne à ligne.
 * @param {{ title: import('react').ReactNode, amount: import('react').ReactNode, icon?: string|null,
 *   lines?: { label: import('react').ReactNode, value: import('react').ReactNode }[], children?: import('react').ReactNode }} props
 */
export function Vault({ title, amount, icon = 'lock', lines = [], children = null }) {
  return (
    <div className="vault">
      <Orbs />
      <div style={{ position: 'relative' }}>
        <div className="row" style={{ gap: 8, fontWeight: 600, fontSize: '.9rem', opacity: 0.9 }}>
          {icon ? <Icon name={icon} size={18} /> : null}
          {title}
        </div>
        <div className="amt" style={{ margin: '6px 0 12px' }}>{amount}</div>
        {lines.length ? (
          <div className="lines">
            {lines.map((line, index) => (
              <div key={index}><span>{line.label}</span><span>{line.value}</span></div>
            ))}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
