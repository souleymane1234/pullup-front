import { useState } from 'react';
import { Link, ScrollRestoration } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shell } from '@/components/layout/Shell/Shell.jsx';
import { Avatar } from '@/components/ui/Avatar/Avatar.jsx';
import { Icon } from '@/components/ui/Icon/Icon.jsx';
import { useSession } from '@/features/auth/index.js';
import { Footer } from '@/features/marketing/index.js';
import { NotificationsDialog, Onboarding, useFlags, useNotifications } from '@/features/platform/index.js';
import logo from '@/assets/logo.png';

function AccountActions({ session, role }) {
  const [open, setOpen] = useState(false);
  const { data: notifications = [] } = useNotifications(role !== 'visitor');
  const unread = notifications.filter((n) => !n.r).length;

  if (role === 'visitor') {
    return (
      <>
        <Link className="btn ghost sm hide-m" to="/rejoindre">Je suis influenceur</Link>
        <Link className="btn sm" to="/connexion">Se connecter</Link>
      </>
    );
  }
  return (
    <>
      <button
        type="button"
        className="bell"
        aria-label={unread ? `Notifications (${unread} non lues)` : 'Notifications'}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <Icon name="bell" />
        {unread ? <i /> : null}
      </button>
      <NotificationsDialog open={open} onClose={() => setOpen(false)} />
      <Link to={role === 'admin' ? '/admin' : '/espace'} className="row" style={{ gap: 8, color: 'var(--ink)' }} aria-label="Mon espace">
        <Avatar {...session.avatar} size={34} />
        <span className="hide-m small" style={{ fontWeight: 600 }}>{session.name}</span>
      </Link>
    </>
  );
}

export function AppShell() {
  const { t } = useTranslation();
  const flags = useFlags();
  const { session, role } = useSession();
  const space = role === 'admin' ? '/admin' : '/espace';

  const items = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/influenceurs', label: t('nav.influencers') },
    ...(flags.v3 ? [{ to: '/matching', label: <>{t('nav.matching')}<span className="tag">V3</span></> }] : []),
    { to: '/tarifs', label: t('nav.pricing') },
    ...(role !== 'visitor' ? [{ to: space, label: role === 'admin' ? t('nav.admin') : t('nav.space') }] : []),
  ];

  let spaceLabel = t('nav.campaigns');
  if (role === 'influencer') spaceLabel = t('nav.spaceShort');
  if (role === 'admin') spaceLabel = t('nav.adminShort');

  const tabs = [
    { to: '/', label: t('nav.home'), icon: <Icon name="home" />, end: true },
    { to: '/influenceurs', label: t('nav.explore'), icon: <Icon name="search" /> },
    flags.v3
      ? { to: '/matching', label: t('nav.matchingShort'), icon: <Icon name="spark" /> }
      : { to: '/tarifs', label: t('nav.pricing'), icon: <Icon name="tag" /> },
    { to: role === 'visitor' ? '/connexion' : space, label: spaceLabel, icon: <Icon name="grid" /> },
    role === 'visitor'
      ? { to: '/connexion', label: t('nav.login'), icon: <Icon name="user" /> }
      : { to: '/compte', label: t('nav.account'), icon: <Icon name="user" /> },
  ];

  return (
    <>
      <Shell
        navLabel={t('nav.main')}
        tabsLabel={t('nav.tabs')}
        skipLabel={t('nav.skip')}
        items={items}
        tabs={tabs}
        brand={(
          <Link to="/" className="brand" aria-label="PULLUP, accueil">
            <img src={logo} alt="" width={36} height={36} />
            <span className="wordmark">pullup</span>
          </Link>
        )}
        actions={<AccountActions session={session} role={role} />}
        footer={<Footer />}
      />
      <Onboarding />
      <ScrollRestoration />
    </>
  );
}
