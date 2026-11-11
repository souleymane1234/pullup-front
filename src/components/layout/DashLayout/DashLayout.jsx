import { cn } from '@/lib/cn.js';

/**
 * Tableau de bord à sections : navigation latérale (barre horizontale sur mobile) et contenu.
 * @param {{ tabs: { key: string, label: string, count?: number }[], current: string, onSelect: (key: string) => void,
 *   label?: string, children: import('react').ReactNode }} props
 */
export function DashLayout({ tabs, current, onSelect, label = 'Sections', children }) {
  return (
    <div className="wrap wrap-dash">
      <div className="dash">
        <nav className="dnav" aria-label={label}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={cn(current === tab.key && 'on')}
              aria-current={current === tab.key ? 'page' : undefined}
              onClick={() => onSelect(tab.key)}
            >
              {tab.label}
              {tab.count ? <>{' '}<span className="cnt">{tab.count}</span></> : null}
            </button>
          ))}
        </nav>
        <div className="dash-content">{children}</div>
      </div>
    </div>
  );
}
