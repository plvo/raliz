'use client';

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface QueryBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
}

function DefaultErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className='flex flex-col items-center justify-center p-6 bg-destructive/10 rounded-lg border border-destructive/20'>
      <h2 className='text-lg font-semibold text-destructive mb-2'>Something went wrong</h2>
      <p className='text-sm text-muted-foreground mb-4'>{error.message}</p>
      <button
        type='button'
        onClick={resetErrorBoundary}
        className='px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors'
      >
        Try again
      </button>
    </div>
  );
}

function DefaultLoadingFallback() {
  return (
    <div className='flex items-center justify-center p-6'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary' />
    </div>
  );
}

export function QueryBoundary({ children, fallback, errorFallback: ErrorFallback }: QueryBoundaryProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback || DefaultErrorFallback}>
      <Suspense fallback={fallback || <DefaultLoadingFallback />}>{children}</Suspense>
    </ErrorBoundary>
  );
}
