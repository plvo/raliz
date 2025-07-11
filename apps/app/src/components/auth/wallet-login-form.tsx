'use client';

import { loginWithWeb3Auth } from '@/actions/auth/login';
import { useActionMutation } from '@/hooks/use-action';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { useWeb3AuthConnect, useWeb3AuthUser } from '@web3auth/modal/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

export function WalletLoginForm() {
  const router = useRouter();
  const { connect, isConnected, loading: connectLoading } = useWeb3AuthConnect();
  const { userInfo } = useWeb3AuthUser();
  const { address } = useAccount();

  const { mutate: login, isPending: isLogging } = useActionMutation({
    actionFn: (data: { token: string; walletAddress?: string }) => loginWithWeb3Auth(data),
    successEvent: {
      toast: {
        title: 'Welcome to Raliz!',
        description: 'You have been successfully logged in',
      },
    },
    errorEvent: {
      toast: {
        title: 'Login Failed',
        description: 'Failed to authenticate with Web3Auth',
      },
    },
  });

  // Effect to handle automatic login after Web3Auth connection
  useEffect(() => {
    if (isConnected && userInfo && address) {
      // Extract token from Web3Auth
      const web3AuthInstance = (window as any).web3auth;
      if (web3AuthInstance) {
        web3AuthInstance.provider
          ?.request({
            method: 'eth_getTokens',
          })
          .then((tokens: any) => {
            if (tokens?.idToken) {
              login({
                token: tokens.idToken,
                walletAddress: address,
              });
            }
          })
          .catch((error: any) => {
            console.error('Failed to get Web3Auth token:', error);
            // Fallback: try to login without explicit token
            login({
              token: userInfo.email || '',
              walletAddress: address,
            });
          });
      }
    }
  }, [isConnected, userInfo, address, login]);

  // Redirect if already connected and logged in
  useEffect(() => {
    if (isConnected && !isLogging) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isLogging, router]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Web3Auth connection failed:', error);
    }
  };

  return (
    <Card>
      <CardHeader className='text-center'>
        <CardTitle>Connect Your Wallet</CardTitle>
        <CardDescription>Sign in with your Web3 wallet to access exclusive raffles and contests</CardDescription>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <div className='space-y-4'>
            <Button onClick={handleConnect} disabled={connectLoading} className='w-full' size='lg'>
              {connectLoading ? 'Connecting...' : 'Connect Wallet'}
            </Button>

            <div className='text-center text-sm text-muted-foreground'>
              <p>Supported wallets:</p>
              <p className='mt-1'>MetaMask • Email Login</p>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  aria-label='Success checkmark'
                >
                  <title>Success checkmark</title>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
              </div>

              <h3 className='text-lg font-semibold text-green-600 mb-2'>Wallet Connected!</h3>
              <p className='text-sm text-muted-foreground mb-2'>Welcome, {userInfo?.name || 'User'}</p>
              <p className='text-xs font-mono text-muted-foreground break-all'>{address}</p>
            </div>

            {isLogging && (
              <div className='text-center'>
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2' />
                <p className='text-sm text-muted-foreground'>Authenticating...</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
