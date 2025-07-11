'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type * as React from 'react';

/**
 * Providers:
 * React-query QueryClientProvider
 * Next-themes ThemeProvider
 * Toaster component shadcn/ui
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
