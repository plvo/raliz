'use client';

import { useWallet } from '@/hooks/use-wallet';
import { useUser } from '@/lib/providers/user-provider';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Button } from '@repo/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { ThemeButton } from '@repo/ui/components/shuip/theme-button';
import { LogOutIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { MetamaskPendingAlert } from './metamask-pending-alert';

export function WalletButton() {
  const { user, walletAddress } = useUser();
  const { login, logout, isLoggingIn, isLoggingOut, isConnected, showPendingAlert, setShowPendingAlert } = useWallet();

  if (isLoggingIn || isLoggingOut) {
    return (
      <Button disabled>
        <ReloadIcon className='mr-2 size-4 animate-spin' /> Loading
      </Button>
    );
  }

  if (!isConnected || !user) {
    return (
      <Button onClick={() => login()} disabled={isLoggingIn}>
        Connect Wallet
      </Button>
    );
  }

  return (
    <>
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
              {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
            </p>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href='/profile' className='cursor-pointer'>
              My Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href={`https://testnet.chiliscan.com/address/${walletAddress}`}
              target='_blank'
              rel='noopener noreferrer'
              className='cursor-pointer'
            >
              View on ChilizScan
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <div className='flex items-center gap-2'>
            <Button
              onClick={() => logout()}
              size={'icon'}
              variant={'outline'}
              className='cursor-pointer text-destructive'
            >
              <LogOutIcon />
            </Button>
            <ThemeButton />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {showPendingAlert && (
        <MetamaskPendingAlert 
          onRetry={() => {
            setShowPendingAlert(false);
            login();
          }}
        />
      )}
    </>
  );
}
