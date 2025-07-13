'use client';

import { StatsCard } from '@/components/shared/stats-card';
import { RaffleCard } from '@/components/raffles/raffle-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { 
  Ticket, 
  Users, 
  Trophy, 
  Activity, 
  Plus,
  ArrowRight,
  AlertTriangle,
  Copy
} from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/lib/providers/user-provider';
import { useActionQuery } from '@/hooks/use-action';
import { getRaffleStats, getOrganizerRaffles } from '@/actions/raffle/get';
import { Badge } from '@repo/ui/components/badge';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user } = useUser();
  const iframeUrl = `https://raliz.xyz/raffles/${user?.walletAddress}`;

  // Get statistics
  const { data: stats } = useActionQuery({
    actionFn: () => user ? getRaffleStats(user) : Promise.resolve({ ok: false, message: 'No user' }),
    queryKey: user ? ['raffle-stats', user.id] : [''],
    initialData: {
      totalRaffles: 0,
      activeRaffles: 0,
      endedRaffles: 0,
      draftRaffles: 0,
      totalParticipations: 0,
      totalWinners: 0,
    },
  });

  // Get recent raffles
  const { data: recentRaffles = [] } = useActionQuery({
    actionFn: () => user ? getOrganizerRaffles(user) : Promise.resolve({ ok: false, message: 'No user' }),
    queryKey: user ? ['organizer-raffles', user.id] : [''],
    initialData: [],
  });

  const rafflesList = Array.isArray(recentRaffles) ? recentRaffles.slice(0, 3) : [];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your raffles and engagement metrics.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-amber-600 border-amber-600">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Funds managed by super admin
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Raffles"
          value={stats?.totalRaffles || 0}
          description="All time raffles created"
          icon={Ticket}
        />
        <StatsCard
          title="Active Raffles"
          value={stats?.activeRaffles || 0}
          description="Currently running"
          icon={Activity}
        />
        <StatsCard
          title="Total Participants"
          value={stats?.totalParticipations || 0}
          description="Across all raffles"
          icon={Users}
        />
        <StatsCard
          title="Winners Selected"
          value={stats?.totalWinners || 0}
          description="Lucky winners so far"
          icon={Trophy}
        />
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Quick Stats */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Raffles Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="text-2xl font-bold text-green-600">
                  {stats?.activeRaffles || 0}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats?.draftRaffles || 0}
                </div>
                <div className="text-sm text-muted-foreground">Draft</div>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="text-2xl font-bold text-gray-600">
                  {stats?.endedRaffles || 0}
                </div>
                <div className="text-sm text-muted-foreground">Ended</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/raffles/create">
                <Plus className="w-4 h-4 mr-2" />
                Create New Raffle
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/raffles">
                <Ticket className="w-4 h-4 mr-2" />
                View All Raffles
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/participants">
                <Users className="w-4 h-4 mr-2" />
                View Participants
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/analytics">
                <Activity className="w-4 h-4 mr-2" />
                View Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Raffles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Raffles</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/raffles">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {rafflesList.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rafflesList.map((raffle) => (
                <RaffleCard
                  key={raffle.id}
                  raffle={raffle}
                  participationsCount={0} // This would need to be fetched separately
                  winnersCount={0} // This would need to be fetched separately
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No raffles yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first raffle.
              </p>
              <Button asChild>
                <Link href="/raffles/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Raffle
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Web Integration part  */}
      <Card>
        <CardHeader> 
          <CardTitle>Web Integration</CardTitle>
          <CardDescription>
            Integrate your raffle directly into your website. Copy and paste the following iframe into your website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {`<iframe src="${iframeUrl}" width="100%" height="500px"></iframe>`}
            </div>
            <div className="flex flex-row space-x-2">
              <Button variant="outline" size="sm" onClick={() => {
                navigator.clipboard.writeText(iframeUrl);
                toast.success('Copied to clipboard', {
                  description: 'You can now paste this link into your website ! For more information, check the documentation.',
                });
              }}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>
        </CardContent>
        </Card>
    </div>
  );
}
