'use client';

import { getOrgs } from '@/actions/org/get';
import { FanTokensList } from '@/components/profile/fan-tokens-list';
import { ParticipationsList } from '@/components/profile/participations-list';
import { ProfileForm } from '@/components/profile/profile-form';
import { useActionQuery } from '@/hooks/use-action';
import { useUser } from '@/lib/providers/user-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Skeleton } from '@repo/ui/components/skeleton';
import { AlertCircle, TrendingUp, Trophy, Users, Wallet } from 'lucide-react';

export default function ClientProfile() {
  const { user, walletAddress } = useUser();

  const {
    data: organizers,
    isLoading: isLoadingOrgs,
    error: orgError,
  } = useActionQuery({
    actionFn: () => getOrgs(),
    queryKey: ['organizers'],
  });

  if (!user) {
    return (
      <section className='container mx-auto py-8'>
        <div className='flex flex-col items-center justify-center gap-4 min-h-[50vh]'>
          <Wallet className='h-12 w-12 text-muted-foreground' />
          <h1 className='text-3xl font-bold'>Connect Your Wallet</h1>
          <p className='text-muted-foreground text-center max-w-md'>
            Please connect your wallet to access your profile and view your participations.
          </p>
        </div>
      </section>
    );
  }

  if (isLoadingOrgs) {
    return <ProfileLoading />;
  }

  if (orgError || !organizers) {
    return <ProfileError />;
  }

  return (
    <section className='container mx-auto py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Welcome back, {user.firstName || user.username}!</h1>
        <p className='text-muted-foreground'>
          Manage your profile, view your participations, and check your fan token holdings
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Points</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{user.totalPoints.toLocaleString()}</div>
            <p className='text-xs text-muted-foreground'>Points earned from participations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Participations</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{user.totalParticipations}</div>
            <p className='text-xs text-muted-foreground'>Raffles you've participated in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Member Since</CardTitle>
            <Trophy className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{new Date(user.createdAt).getFullYear()}</div>
            <p className='text-xs text-muted-foreground'>
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div className='space-y-8'>
          <ProfileForm user={user} organizers={organizers || []} />
          <FanTokensList walletAddress={walletAddress || ''} />
        </div>

        <div>
          <ParticipationsList userId={user.id} />
        </div>
      </div>
    </section>
  );
}

function ProfileLoading() {
  return (
    <section className='container mx-auto py-8'>
      <div className='mb-8'>
        <Skeleton className='h-8 w-64 mb-2' />
        <Skeleton className='h-4 w-96' />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-6 w-16 mb-1' />
              <Skeleton className='h-3 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div className='space-y-8'>
          <Card>
            <CardHeader>
              <Skeleton className='h-5 w-32' />
              <Skeleton className='h-4 w-48' />
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className='h-10 w-full' />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className='h-5 w-32' />
              <Skeleton className='h-4 w-48' />
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className='h-20 w-full' />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className='h-5 w-32' />
            <Skeleton className='h-4 w-48' />
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className='h-32 w-full' />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function ProfileError() {
  return (
    <section className='container mx-auto py-8'>
      <div className='flex flex-col items-center justify-center gap-4 min-h-[50vh]'>
        <AlertCircle className='h-12 w-12 text-destructive' />
        <h1 className='text-3xl font-bold'>Error Loading Profile</h1>
        <p className='text-muted-foreground text-center max-w-md'>
          There was an error loading your profile data. Please try refreshing the page.
        </p>
      </div>
    </section>
  );
}
