'use client';

import { loginWithWeb3Auth, logout } from '@/actions/auth/login';
import { useActionMutation } from '@/hooks/use-action';
import { Button } from '@repo/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from '@web3auth/modal/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

export function WalletButton() {
  const router = useRouter();
  const { connect, isConnected } = useWeb3AuthConnect();
  const { disconnect } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const { address } = useAccount();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Login mutation
  const { mutate: login, isPending: isLoggingIn } = useActionMutation({
    actionFn: (data: { token: string; walletAddress?: string }) => loginWithWeb3Auth(data),
    successEvent: {
      toast: {
        title: 'Welcome to Raliz!',
        description: 'You have been successfully logged in',
      },
      fn: (response: any) => {
        console.log('Login success:', response);
        if (response.ok && response.data) {
          setUser(response.data);
        }
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
    actionFn: () => logout(),
    successEvent: {
      toast: {
        title: 'Logged out',
        description: 'You have been successfully logged out',
      },
      fn: () => {
        setUser(null);
        disconnect();
        router.push('/');
      },
    },
    errorEvent: {
      toast: {
        title: 'Logout failed',
        description: 'Failed to logout',
      },
    },
  });

  useEffect(() => {
    if (isConnected && userInfo && address && !user && !isLoggingIn) {
      console.log('Auto-login with userInfo:', userInfo);
      setIsLoading(true);

      // Simple login with email or name as token
      const token = userInfo.email || userInfo.name || `user_${address}`;

      login({
        token,
        walletAddress: address,
      });

      setIsLoading(false);
    }
  }, [isConnected, userInfo, address, user, isLoggingIn, login]);

  // Handle connect button click
  const handleConnect = async () => {
    try {
      setIsLoading(true);
      await connect();
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading || isLoggingIn || isLoggingOut) {
    return (
      <Button disabled>
        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
        Loading...
      </Button>
    );
  }

  // Show connect button if not connected or no user
  if (!isConnected || !user) {
    return <Button onClick={handleConnect}>Connect Wallet</Button>;
  }

  // Show user dropdown when connected and authenticated
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' className='flex items-center gap-2'>
          <div className='w-2 h-2 bg-green-500 rounded-full' />
          <span className='hidden sm:inline'>
            {user.firstName || address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <span className='sm:hidden'>
            {address?.slice(0, 4)}...{address?.slice(-2)}
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
          <Link href={`https://etherscan.io/address/${address}`} target='_blank' className='cursor-pointer'>
            View on Etherscan
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => handleLogout()} className='cursor-pointer text-destructive'>
          Disconnect Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
