import type * as React from 'react';

export interface NextPageProps {
  params?: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export function withParams<P extends NextPageProps>(Page: React.ComponentType<P & NextPageProps>) {
  return async function WithUserWrapper(props: P) {
    return <Page {...(props as P)} />;
  };
}
