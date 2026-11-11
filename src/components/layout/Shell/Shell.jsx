import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header/Header.jsx';
import { TabBar } from '@/components/layout/TabBar/TabBar.jsx';
import { PageSkeleton } from '@/components/feedback/Skeleton/Skeleton.jsx';

/**
 * Coquille de page. La navigation et le pied de page sont fournis par le parent.
 * @param {{
 *   brand: import('react').ReactNode,
 *   items: { to: string, label: import('react').ReactNode, end?: boolean }[],
 *   tabs: { to: string, label: string, icon?: import('react').ReactNode, end?: boolean }[],
 *   actions?: import('react').ReactNode,
 *   footer?: import('react').ReactNode,
 *   navLabel: string,
 *   tabsLabel?: string,
 *   skipLabel: string,
 * }} props
 */
export function Shell({ brand, items, tabs, actions, footer = null, navLabel, tabsLabel, skipLabel }) {
  return (
    <>
      <a className="skip" href="#contenu">{skipLabel}</a>
      <Header brand={brand} items={items} actions={actions} label={navLabel} />
      <main id="contenu" tabIndex={-1}>
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
        {footer}
      </main>
      <TabBar items={tabs} label={tabsLabel ?? navLabel} />
    </>
  );
}
