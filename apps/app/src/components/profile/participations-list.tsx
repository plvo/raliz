'use client';

import { getUserParticipations } from '@/actions/user/get';
import { useActionQuery } from '@/hooks/use-action';
import { Badge } from '@repo/ui/components/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Skeleton } from '@repo/ui/components/skeleton';
import { cn } from '@repo/ui/lib/utils';
import { AlertCircle, Calendar, Clock, Ticket, TrendingUp, Trophy, Users } from 'lucide-react';
import Link from 'next/link';

interface ParticipationsListProps {
  userId: string;
}

export function ParticipationsList({ userId }: ParticipationsListProps) {
  const {
    data: participations,
    isLoading,
    error,
  } = useActionQuery({
    actionFn: () => getUserParticipations(userId),
    queryKey: ['user-participations', userId],
  });

  if (isLoading) {
    return <ParticipationsLoading />;
  }

  if (error) {
    return <ParticipationsError />;
  }

  if (!participations?.length) {
    return <ParticipationsEmpty />;
  }

  return (
    <Card>
      <CardHeader className='space-y-1'>
        <CardTitle className='flex items-center gap-2'>
          <Ticket className='h-5 w-5' />
          My Participations
        </CardTitle>
        <CardDescription>Your recent raffle participations and results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {participations.map((participation: any) => (
            <ParticipationCard key={participation.id} participation={participation} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ParticipationCard({ participation }: { participation: any }) {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: string) => {
    const num = Number.parseFloat(amount);
    return `${num.toFixed(4)} CHZ`;
  };

  return (
    <div className='p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors'>
      {/* Header */}
      <div className='flex items-start justify-between mb-3'>
        <div className='flex-1'>
          <h4 className='font-medium text-sm mb-1'>{participation.raffle.title}</h4>
          <p className='text-xs text-muted-foreground mb-2'>by {participation.raffle.organizer.name}</p>

          {/* Status Badge */}
          <Badge
            variant={participation.isWinner ? 'default' : 'secondary'}
            className={cn(
              'text-xs',
              participation.isWinner && 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black',
            )}
          >
            {participation.isWinner ? (
              <>
                <Trophy className='w-3 h-3 mr-1' />
                Winner!
              </>
            ) : (
              'Participated'
            )}
          </Badge>
        </div>

        <div className='text-right'>
          <div className='text-xs text-muted-foreground'>Points Earned</div>
          <div className='font-medium text-sm flex items-center gap-1'>
            <TrendingUp className='w-3 h-3 text-green-500' />+{participation.pointsEarned}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className='grid grid-cols-2 gap-4 text-xs'>
        <div>
          <div className='text-muted-foreground'>Amount Paid</div>
          <div className='font-medium'>{formatAmount(participation.amountPaid)}</div>
        </div>

        <div>
          <div className='text-muted-foreground'>Token Used</div>
          <div className='font-medium'>{participation.tokenUsed}</div>
        </div>

        <div>
          <div className='text-muted-foreground'>Participated</div>
          <div className='font-medium flex items-center gap-1'>
            <Calendar className='w-3 h-3' />
            {formatDate(participation.participatedAt)}
          </div>
        </div>

        <div>
          <div className='text-muted-foreground'>Time</div>
          <div className='font-medium flex items-center gap-1'>
            <Clock className='w-3 h-3' />
            {formatTime(participation.participatedAt)}
          </div>
        </div>
      </div>

      {/* Transaction Hash (if available) */}
      {participation.transactionHash && (
        <div className='mt-3 pt-3 border-t'>
          <div className='text-xs text-muted-foreground mb-1'>Transaction</div>
          <Link
            href={`https://testnet.chiliscan.com/tx/${participation.transactionHash}`}
            target='_blank'
            rel='noopener noreferrer'
            className='text-xs font-mono text-primary hover:underline break-all'
          >
            {participation.transactionHash}
          </Link>
        </div>
      )}

      {/* Winner notification info */}
      {participation.isWinner && participation.notifiedAt && (
        <div className='mt-3 pt-3 border-t bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 p-2 rounded'>
          <div className='text-xs text-muted-foreground mb-1'>Winner Notification</div>
          <div className='text-xs'>
            Notified on {formatDate(participation.notifiedAt)} at {formatTime(participation.notifiedAt)}
          </div>
        </div>
      )}
    </div>
  );
}

function ParticipationsLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Ticket className='h-5 w-5' />
          My Participations
        </CardTitle>
        <CardDescription>Loading your participations...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='p-4 rounded-lg border'>
              <div className='flex justify-between mb-3'>
                <div className='flex-1'>
                  <Skeleton className='h-4 w-40 mb-2' />
                  <Skeleton className='h-3 w-24 mb-2' />
                  <Skeleton className='h-5 w-16' />
                </div>
                <div>
                  <Skeleton className='h-3 w-16 mb-1' />
                  <Skeleton className='h-4 w-12' />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <Skeleton className='h-8 w-full' />
                <Skeleton className='h-8 w-full' />
                <Skeleton className='h-8 w-full' />
                <Skeleton className='h-8 w-full' />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ParticipationsError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Ticket className='h-5 w-5' />
          My Participations
        </CardTitle>
        <CardDescription>Failed to load participations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-center py-8 text-muted-foreground'>
          <AlertCircle className='w-5 h-5 mr-2' />
          Unable to fetch your participations
        </div>
      </CardContent>
    </Card>
  );
}

function ParticipationsEmpty() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Ticket className='h-5 w-5' />
          My Participations
        </CardTitle>
        <CardDescription>No participations yet</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <Users className='w-12 h-12 text-muted-foreground mb-4' />
          <h3 className='font-medium mb-2'>No Participations Yet</h3>
          <p className='text-sm text-muted-foreground mb-4'>
            You haven't participated in any raffles yet. Start exploring available raffles!
          </p>
          <Link
            href='/'
            className='inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors'
          >
            Browse Raffles
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
