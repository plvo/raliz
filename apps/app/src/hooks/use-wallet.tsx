'use client';

import { loginOrCreateWeb3User } from '@/actions/auth/web3auth';
import { useUser } from '@/lib/providers/user-provider';
import { CHILIZ_SPICY_TESTNET } from '@/lib/web3-config';
import { useWeb3Auth, useWeb3AuthConnect, useWeb3AuthDisconnect } from '@web3auth/modal/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import { useSwitchChain } from 'wagmi';
import { useActionMutation } from './use-action';

export function useWallet() {
  const router = useRouter();
  const [switchChainDialogOpen, setSwitchChainDialogOpen] = React.useState(false);

  const { user, chainId, walletAddress, refetchUser } = useUser();

  const { switchChain, error: switchChainError } = useSwitchChain();

  const { connect, isConnected } = useWeb3AuthConnect();
  const { disconnect } = useWeb3AuthDisconnect();
  const { web3Auth } = useWeb3Auth();

  const { mutate: login, isPending: isLoggingIn } = useActionMutation({
    invalidateQueries: [['user', walletAddress || '']],
    actionFn: async () => {
      const provider = await connect();

      router.refresh();

      console.log('login', { walletAddress, provider: provider?.chainId });

      if (!walletAddress) {
        throw new Error('Failed to connect to wallet');
      }

      return loginOrCreateWeb3User(walletAddress);
    },
    successEvent: {
      toast: {
        title: 'Welcome to Raliz!',
        description: 'You have been successfully logged in',
      },
    },
    errorEvent: {
      toast: {
        title: 'Login Failed',
        description: 'Failed to authenticate',
      },
      fn: (error) => {
        console.error('Login error:', error);
      },
    },
  });

  // Logout mutation
  const { mutate: logout, isPending: isLoggingOut } = useActionMutation({
    invalidateQueries: [['user', walletAddress || '']],
    actionFn: async () => {
      await disconnect();
      router.refresh();
      return { ok: true, data: null };
    },
    successEvent: {
      toast: {
        title: 'Logged out',
        description: 'You have been successfully logged out',
      },
    },
    errorEvent: {
      toast: {
        title: 'Logout failed',
        description: 'Failed to logout',
      },
    },
  });

  // On wallet change, log
  React.useEffect(() => {
    console.log('useEffect', { walletAddress, user });
    if (walletAddress && !user) {
      console.log('refetching user');
      refetchUser();
    }
  }, [walletAddress, user, refetchUser]);

  // On chain change, switch to the Chiliz Spicy Testnet chain
  React.useEffect(() => {
    if (isConnected && chainId !== CHILIZ_SPICY_TESTNET.id) {
      // if (isConnected && web3Auth?.currentChain?.chainId !== CHILIZ_SPICY_TESTNET.id.toString()) {
      try {
        switchChain({ chainId: CHILIZ_SPICY_TESTNET.id });
        toast.success('Switched to the Chiliz Spicy Testnet chain');
      } catch (error) {
        if (switchChainError) {
          toast.error(`Failed to switch to the Chiliz Spicy Testnet chain: ${switchChainError}`);
        } else {
          toast.error(`Failed to switch to the Chiliz Spicy Testnet chain: ${error}`);
        }
      }
    }
  }, [isConnected, chainId, switchChain, switchChainError]);

  return {
    isConnected,
    walletAddress,
    login,
    logout,
    isLoggingIn,
    isLoggingOut,
    switchChainDialogOpen,
    setSwitchChainDialogOpen,
    web3Auth,
    chainId,
  };
}
