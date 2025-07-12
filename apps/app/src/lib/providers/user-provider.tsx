'use client';

import { getWeb3User } from '@/actions/auth/web3auth';
import { useActionQuery } from '@/hooks/use-action';
import type { User } from '@repo/db';
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert';
import type * as React from 'react';
import { createContext, useContext } from 'react';
import { useAccount } from 'wagmi';

interface UserContextType {
  user: User | null;
  walletAddress: `0x${string}` | undefined;
  isLoading: boolean;
  error: unknown;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const { address } = useAccount();

  const {
    data: user,
    isLoading,
    error,
  } = useActionQuery({
    actionFn: () => getWeb3User(address || ''),
    queryKey: ['user', address || ''],
  });

  const contextValue: UserContextType = {
    user: user || null,
    walletAddress: address,
    isLoading,
    error,
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4' />
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Alert variant='destructive' className='max-w-md'>
          <AlertTitle>Error loading user data</AlertTitle>
          <AlertDescription>{error.toString()}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <UserContext.Provider value={contextValue}>
      {user && !user.email ? (
        <div className='space-y-4'>
          <Alert>
            <AlertTitle>Email not added</AlertTitle>
            <AlertDescription>Please add your email to continue.</AlertDescription>
          </Alert>
          {children}
        </div>
      ) : (
        children
      )}
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
