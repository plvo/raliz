'use client';

import { type FanTokenBalance, useFanTokenBalances } from '@/hooks/use-fan-tokens';
import { Badge } from '@repo/ui/components/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Skeleton } from '@repo/ui/components/skeleton';
import { cn } from '@repo/ui/lib/utils';
import { AlertCircle, CheckCircle, Coins, XCircle } from 'lucide-react';

interface FanTokensListProps {
  walletAddress: string;
}

export function FanTokensList({ walletAddress }: FanTokensListProps) {
  const { data: tokenBalances, isLoading, error } = useFanTokenBalances(walletAddress);

  if (isLoading) {
    return <FanTokensLoading />;
  }

  if (error) {
    return <FanTokensError />;
  }

  if (!tokenBalances?.length) {
    return <FanTokensEmpty />;
  }

  return (
    <Card>
      <CardHeader className='space-y-1'>
        <CardTitle className='flex items-center gap-2'>
          <Coins className='h-5 w-5' />
          Fan Tokens
        </CardTitle>
        <CardDescription>Your fan token holdings for raffle eligibility</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {tokenBalances.map((token: FanTokenBalance) => (
            <FanTokenCard key={token.symbol} token={token} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FanTokenCard({ token }: { token: FanTokenBalance }) {
  const balance = Number.parseFloat(token.balance);
  const minimumRequired = Number.parseFloat(token.minimumRequired);

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-colors',
        token.isEligible
          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
          : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
      )}
    >
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-3'>
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
              token.symbol === 'PSG' && 'bg-blue-500 text-white',
              token.symbol === 'BAR' && 'bg-red-500 text-white',
              token.symbol === 'CITY' && 'bg-sky-500 text-white',
              token.symbol === 'GAL' && 'bg-yellow-500 text-black',
            )}
          >
            {token.symbol}
          </div>
          <div>
            <h4 className='font-medium text-sm'>{token.name}</h4>
            {token.organizerName && <p className='text-xs text-muted-foreground'>{token.organizerName}</p>}
          </div>
        </div>

        <Badge variant={token.isEligible ? 'default' : 'destructive'} className='text-xs'>
          {token.isEligible ? <CheckCircle className='w-3 h-3 mr-1' /> : <XCircle className='w-3 h-3 mr-1' />}
          {token.isEligible ? 'Eligible' : 'Insufficient'}
        </Badge>
      </div>

      <div className='flex justify-between items-center text-sm'>
        <span className='text-muted-foreground'>
          Balance:{' '}
          <span className='font-medium text-foreground'>
            {balance.toLocaleString()} {token.symbol}
          </span>
        </span>
        <span className='text-muted-foreground'>
          Required:{' '}
          <span className='font-medium text-foreground'>
            {minimumRequired.toLocaleString()} {token.symbol}
          </span>
        </span>
      </div>

      {!token.isEligible && (
        <div className='mt-2 flex items-center gap-1 text-xs text-red-600 dark:text-red-400'>
          <AlertCircle className='w-3 h-3' />
          Need {(minimumRequired - balance).toLocaleString()} more {token.symbol} to participate in{' '}
          {token.organizerName} raffles
        </div>
      )}
    </div>
  );
}

function FanTokensLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Coins className='h-5 w-5' />
          Fan Tokens
        </CardTitle>
        <CardDescription>Loading your fan token holdings...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='p-4 rounded-lg border'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='w-8 h-8 rounded-full' />
                  <div>
                    <Skeleton className='h-4 w-32 mb-1' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                </div>
                <Skeleton className='h-6 w-16' />
              </div>
              <div className='flex justify-between'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-4 w-20' />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FanTokensError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Coins className='h-5 w-5' />
          Fan Tokens
        </CardTitle>
        <CardDescription>Failed to load fan token data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-center py-8 text-muted-foreground'>
          <AlertCircle className='w-5 h-5 mr-2' />
          Unable to fetch fan token balances
        </div>
      </CardContent>
    </Card>
  );
}

function FanTokensEmpty() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Coins className='h-5 w-5' />
          Fan Tokens
        </CardTitle>
        <CardDescription>No fan token data available</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-center py-8 text-muted-foreground'>
          <Coins className='w-5 h-5 mr-2' />
          No fan tokens found
        </div>
      </CardContent>
    </Card>
  );
}
