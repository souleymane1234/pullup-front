import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders.jsx';
import { router } from '@/app/router/router.jsx';
import { initTheme } from '@/app/store/ui.store.js';
import { Skeleton } from '@/components/feedback/Skeleton/Skeleton.jsx';
import '@/styles/fonts.css';
import '@/styles/tokens.css';
import '@/styles/global.css';
import '@/styles/components.css';
import '@/i18n/index.js';

initTheme();

function BootFallback() {
  return (
    <div className="wrap section" aria-busy="true" aria-live="polite">
      <Skeleton width="180px" height={28} />
      <Skeleton height={18} />
      <Skeleton height={18} />
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders>
      <Suspense fallback={<BootFallback />}>
        <RouterProvider router={router} />
      </Suspense>
    </AppProviders>
  </StrictMode>,
);

if (import.meta.env.PROD) {
  import('@/lib/vitals.js').then(({ reportWebVitals }) => reportWebVitals());
}
