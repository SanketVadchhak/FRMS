import { Suspense } from 'react';
import { Providers } from './providers';
import { Router } from './router';
import { useTheme } from '@/hooks/useTheme';
import { LoadingPage } from '@/components/feedback/LoadingPage';

export default function App() {
  useTheme(); // Initialize theme

  return (
    <Providers>
      <Suspense fallback={<LoadingPage />}>
        <Router />
      </Suspense>
    </Providers>
  );
}
