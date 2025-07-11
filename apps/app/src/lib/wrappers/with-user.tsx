'use client';

import { getWeb3User } from '@/actions/web3auth';
import { useActionQuery } from '@/hooks/use-action';
import type { User } from '@repo/db';
import type * as React from 'react';
import { useAccount } from 'wagmi';

export interface NextPageProps {
  params?: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export interface WithUserProps extends NextPageProps {
  user: User | null;
  walletAddress: `0x${string}` | undefined;
}

export function withUser<P extends NextPageProps>(Page: React.ComponentType<P & WithUserProps>) {
  return async function WithUserWrapper(props: P) {
    const { address } = useAccount();

    const {
      data: user,
      isLoading,
      error,
    } = useActionQuery({
      actionFn: () => getWeb3User(address || ''),
      queryKey: ['user', address || ''],
    });

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div>Error: {error.toString()}</div>;
    }

    return <Page {...(props as P)} user={user} walletAddress={address} />;
  };
}
