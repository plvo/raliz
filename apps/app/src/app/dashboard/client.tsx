'use client';

import { useUser } from '@/lib/providers/user-provider';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import Link from 'next/link';

function DashboardClient() {
  const { user, walletAddress } = useUser();
  if (!user) {
    return (
      <div className='flex flex-col items-center justify-center h-screen gap-4'>
        <h1 className='text-3xl font-bold mb-2'>Please connect your wallet to continue</h1>
        <p className='text-muted-foreground'>You need to be connected to your wallet to access this page</p>
      </div>
    );
  }

  return (
    <section className='container mx-auto py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Welcome back, {user.firstName}!</h1>
        <p className='text-muted-foreground'>Manage your participation in raffles and view your profile</p>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>View and edit your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 text-sm'>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Name:</strong> {user.firstName} {user.lastName}
              </p>
              {user.walletAddress && (
                <p>
                  <strong>Wallet:</strong> {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                </p>
              )}
              <p>
                <strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Button className='w-full mt-4' variant='outline'>
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Raffles</CardTitle>
            <CardDescription>Participate in ongoing contests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground mb-4'>
              Discover and join exciting raffles from your favorite organizers
            </p>
            <Button className='w-full' asChild>
              <Link href='/raffles'>Browse Raffles</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Participations</CardTitle>
            <CardDescription>Track your entries and results</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground mb-4'>View all your raffle participations and check if you've won</p>
            <Button className='w-full' variant='outline' asChild>
              <Link href='/participations'>View History</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className='mt-8'>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-4'>
              <Button asChild>
                <Link href='/raffles'>Join a Raffle</Link>
              </Button>
              <Button variant='outline' asChild>
                <Link href='/profile'>Update Profile</Link>
              </Button>
              <Button variant='outline' asChild>
                <Link href='/notifications'>View Notifications</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default DashboardClient;
