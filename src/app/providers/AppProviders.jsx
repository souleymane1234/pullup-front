import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient.js';
import { ErrorBoundary } from '@/app/ErrorBoundary.jsx';
import { ToastViewport } from '@/components/ui/Toast/Toast.jsx';
import { useToastStore } from '@/lib/toast.js';

function ConnectedToasts() {
  const toasts = useToastStore((state) => state.toasts);
  return <ToastViewport toasts={toasts} />;
}

/** @param {{ children: import('react').ReactNode }} props */
export function AppProviders({ children }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
        <ConnectedToasts />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
