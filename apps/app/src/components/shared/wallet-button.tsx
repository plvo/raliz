'use client';

import { getWeb3User, loginOrCreateWeb3User } from '@/actions/auth/web3auth';
import { useActionMutation, useActionQuery } from '@/hooks/use-action';
import { Button } from '@repo/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { useMounted } from '@repo/ui/hooks/use-mounted';
import { useWeb3AuthConnect, useWeb3AuthDisconnect } from '@web3auth/modal/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useAccount } from 'wagmi';
import { AddEmailDialog } from './email-dialog';

export function WalletButton() {
  const router = useRouter();
  const mounted = useMounted();
  const [open, setOpen] = React.useState(false);
  const { connect, isConnected } = useWeb3AuthConnect();
  const { disconnect } = useWeb3AuthDisconnect();
  const { address } = useAccount();

  const {
    data: user,
    isLoading,
    error,
  } = useActionQuery({
    actionFn: () => getWeb3User(address || ''),
    queryKey: ['user', address || ''],
    queryOptions: {
      enabled: !!address && isConnected,
    },
  });

  // Login mutation
  const { mutate: login, isPending: isLoggingIn } = useActionMutation({
    invalidateQueries: [['user', address || '']],
    actionFn: async () => {
      const provider = await connect();

      console.log({ address, provider: provider?.chainId });

      if (!address) {
        throw new Error('Failed to connect to wallet');
      }

      return loginOrCreateWeb3User(address);
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
  const { mutate: handleLogout, isPending: isLoggingOut } = useActionMutation({
    actionFn: async () => {
      await disconnect();
      return { ok: true, data: null };
    },
    successEvent: {
      toast: {
        title: 'Logged out',
        description: 'You have been successfully logged out',
      },
      fn: () => {
        disconnect();
        router.refresh();
      },
    },
    errorEvent: {
      toast: {
        title: 'Logout failed',
        description: 'Failed to logout',
      },
    },
  });

  React.useEffect(() => {
    if (user && !user.email && isConnected && mounted) {
      setOpen(true);
    }
  }, [user, isConnected, mounted]);

  if (isLoggingIn || isLoggingOut) {
    return (
      <Button disabled>
        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
        Loading...
      </Button>
    );
  }

  return (
    <>
      <AddEmailDialog open={open} setOpen={setOpen} walletAddress={address} />

      {!isConnected || !user ? (
        <Button onClick={() => login()}>Connect Wallet</Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full' />
              <span>
                {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='end' className='w-56'>
            <div className='px-2 py-1.5'>
              <p className='text-sm font-medium'>
                {user.firstName} {user.lastName}
              </p>
              <p className='text-xs text-muted-foreground'>{user.email}</p>
              <p className='text-xs text-muted-foreground font-mono'>
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href='/dashboard' className='cursor-pointer'>
                Dashboard
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href='/profile' className='cursor-pointer'>
                Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href='/participations' className='cursor-pointer'>
                My Participations
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href={`https://etherscan.io/address/${address}`}
                target='_blank'
                rel='noopener noreferrer'
                className='cursor-pointer'
              >
                View on Etherscan
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => handleLogout()} className='cursor-pointer text-destructive'>
              Disconnect Wallet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}
