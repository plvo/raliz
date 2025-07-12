'use client';

import { getWeb3User } from '@/actions/auth/web3auth';
import { AddEmailDialog } from '@/components/shared/email-dialog';
import { useActionQuery } from '@/hooks/use-action';
import type { User } from '@repo/db';
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert';
import { useWeb3AuthConnect } from '@web3auth/modal/react';
import type * as React from 'react';
import { createContext, useContext } from 'react';
import { useAccount, useBalance } from 'wagmi';

interface UserContextType {
  user: User | null;
  walletAddress: `0x${string}` | undefined;
  chainId: number | undefined;
  balance:
    | {
        decimals: number;
        formatted: string;
        symbol: string;
        value: bigint;
      }
    | undefined;
  isConnected: boolean;
  refetchUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const { address, chainId } = useAccount();
  const { data: balance, isLoading: isLoadingBalance, error: errorBalance } = useBalance({ address });
  const { isConnected } = useWeb3AuthConnect();

  const {
    data: user,
    isLoading,
    error,
    refetch: refetchUser,
  } = useActionQuery({
    actionFn: () => getWeb3User(address || ''),
    queryKey: ['user', address || ''],
  });

  const contextValue: UserContextType = {
    user: user || null,
    balance,
    walletAddress: address,
    chainId,
    isConnected,
    refetchUser,
  };

  if (isLoading || isLoadingBalance) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4' />
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error || errorBalance) {
    return (
      <Alert variant='destructive' className='max-w-md'>
        <AlertTitle>Error loading user data</AlertTitle>
        <AlertDescription>{error?.toString() || errorBalance?.toString()}</AlertDescription>
      </Alert>
    );
  }

  return (
    <UserContext.Provider value={contextValue}>
      {user && !user.email && (
        <Alert
          className='max-w-lg mx-auto fixed left-1/2 -translate-x-1/2 bottom-6 z-50 bg-amber-300'
          variant={'default'}
        >
          <AlertDescription className='flex gap-2 items-center justify-between'>
            <div>
              <AlertTitle className='text-foreground'>Email not added</AlertTitle>
              <span>Please add your email to do some magic 🪄</span>
            </div>
            <AddEmailDialog walletAddress={address} />
          </AlertDescription>
        </Alert>
      )}
      <main className='mt-20'>{children}</main>
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
