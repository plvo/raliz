'use client';

import { getOrganizerProfile } from '@/actions/organizer/get';
import { useActionQuery } from '@/hooks/use-action';
import type { Organizer } from '@repo/db';
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert';
import { useWeb3AuthConnect } from '@web3auth/modal/react';
import type * as React from 'react';
import { createContext, useContext } from 'react';
import { useAccount, useBalance } from 'wagmi';

interface UserContextType {
  user: Organizer | null;
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
    data: organizer = null,
    isLoading,
    error,
    refetch: refetchUser,
  } = useActionQuery<Organizer | null>({
    actionFn: async () => {
      if (!address) {  // If the user is not connected, return null
        return { ok: true, data: null };
      }

      return getOrganizerProfile(address);
    },
    queryKey: ['organizer', address || ''],
  });

  const contextValue: UserContextType = {
    user: organizer || null,
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
        </div>
      </div>
    );
  }

  if (error || errorBalance) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Alert variant='destructive' className='max-w-md'>
          <AlertTitle>Error loading user data</AlertTitle>
          <AlertDescription>{error?.toString() || errorBalance?.toString()}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
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
