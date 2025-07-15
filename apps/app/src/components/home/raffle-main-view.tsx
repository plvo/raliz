'use client';

import { getUserParticipationsForRaffles } from '@/actions/participation/get';
import { ParticipateRaffleDialog } from '@/components/raffles/participate-raffle-dialog';
import { useActionQuery } from '@/hooks/use-action';
import { useWallet } from '@/hooks/use-wallet';
import { useUser } from '@/lib/providers/user-provider';
import type { OrgWithoutWallet } from '@/types/database';
import type { Raffle } from '@repo/db';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@repo/ui/components/hover-card';
import { cn } from '@repo/ui/lib/utils';
import { Calendar, Clock, Grid3X3, List, Target, Trophy, Users, Zap } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface RaffleMainViewProps {
  raffles: Raffle[];
  selectedOrganizer: OrgWithoutWallet | null;
  className?: string;
}

interface RaffleDisplayProps {
  raffles: Raffle[];
  viewMode: 'grid' | 'list';
  userParticipations?: Record<string, boolean>;
  selectedOrganizer: OrgWithoutWallet | null;
}

interface RaffleItemProps {
  raffle: Raffle;
  hasParticipated?: boolean;
}

export function RaffleMainView({ raffles, selectedOrganizer, className }: RaffleMainViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { user } = useUser();

  // Récupérer les participations de l'utilisateur pour les raffles affichées
  const raffleIds = raffles.map((raffle) => raffle.id);
  const { data: userParticipations } = useActionQuery({
    queryKey: ['user-participations', user?.id || '', ...raffleIds],
    actionFn: () => getUserParticipationsForRaffles(user?.id || '', raffleIds),
    queryOptions: {
      enabled: !!user?.id && raffleIds.length > 0,
    },
  });

  const getTitle = () => {
    if (selectedOrganizer) {
      return `${selectedOrganizer.name} Raffles`;
    }
    return 'All Raffles';
  };

  const getDescription = () => {
    if (selectedOrganizer) {
      return `Discover exclusive raffles from ${selectedOrganizer.name}`;
    }
    return 'Join raffles from your favorite teams and win amazing prizes';
  };

  return (
    <div className={cn('w-full h-full', className)}>
      <Card className='h-full bg-muted backdrop-blur-sm overflow-y-auto'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-2xl font-bold flex items-center gap-2'>
                <Trophy className='h-6 w-6 text-primary' />
                {getTitle()}
              </CardTitle>
              <CardDescription className='mt-1'>{getDescription()}</CardDescription>
            </div>
            <div className='flex items-center gap-4'>
              <Badge variant='secondary' className='text-sm'>
                {raffles.length} raffle{raffles.length !== 1 ? 's' : ''}
              </Badge>
              <div className='flex items-center bg-muted p-1 rounded-lg'>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setViewMode('list')}
                  className='h-8 w-8 p-0'
                >
                  <List className='h-4 w-4' />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setViewMode('grid')}
                  className='h-8 w-8 p-0'
                >
                  <Grid3X3 className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RaffleDisplay
            raffles={raffles}
            viewMode={viewMode}
            userParticipations={userParticipations || {}}
            selectedOrganizer={selectedOrganizer}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function RaffleDisplay({ raffles, viewMode, userParticipations, selectedOrganizer }: RaffleDisplayProps) {
  if (raffles.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4'>
          <Trophy className='w-10 h-10 text-primary' />
        </div>
        <h3 className='text-xl font-semibold mb-2'>No raffles available</h3>
        <p className='text-muted-foreground max-w-md'>
          Raffles will appear here once they are created by the organizers. Check back soon for new opportunities!
        </p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className='space-y-4'>
        {raffles
          .filter((raffle) => (selectedOrganizer ? raffle.organizerId === selectedOrganizer.id : true))
          .sort((a, b) => {
            const statusOrder = { ACTIVE: 0, DRAFT: 1, ENDED: 2 };
            const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
            const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
            return aOrder - bOrder;
          })
          .map((raffle) => (
            <RaffleListItem
              key={raffle.id}
              raffle={raffle}
              hasParticipated={userParticipations?.[raffle.id] || false}
            />
          ))}
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {raffles
        .slice()
        .sort((a, b) => {
          const statusOrder = { ACTIVE: 0, DRAFT: 1, ENDED: 2 };
          const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
          const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
          return aOrder - bOrder;
        })
        .map((raffle) => (
          <RaffleCard key={raffle.id} raffle={raffle} hasParticipated={userParticipations?.[raffle.id] || false} />
        ))}
    </div>
  );
}

function RaffleCard({ raffle, hasParticipated }: RaffleItemProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className='bg-green-500/10 text-green-700 border-green-500/20'>🔥 Active</Badge>;
      case 'ENDED':
        return <Badge variant='secondary'>🏁 Ended</Badge>;
      case 'DRAFT':
        return <Badge variant='outline'>⏳ Draft</Badge>;
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatPrice = (price: string) => {
    return `${price} ${raffle.tokenSymbol}`;
  };

  const isActive = raffle.status === 'ACTIVE';
  const isEnded = raffle.status === 'ENDED';
  const timeLeft = raffle.endDate ? new Date(raffle.endDate).getTime() - Date.now() : 0;
  const isEndingSoon = timeLeft > 0 && timeLeft < 24 * 60 * 60 * 1000;

  return (
    <Card
      className={cn(
        'group hover:shadow-lg transition-all duration-300 border-2 overflow-hidden',
        isActive && 'border-primary/20 hover:border-primary/40',
        isEnded && 'opacity-75',
        isEndingSoon && 'border-orange-500/20 hover:border-orange-500/40',
      )}
    >
      <div className='relative h-48 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden'>
        {raffle.imageUrl ? (
          <Image
            src={raffle.imageUrl}
            alt={raffle.title}
            fill
            className='object-cover group-hover:scale-105 transition-transform duration-300'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <Trophy className='w-16 h-16 text-primary/30' />
          </div>
        )}

        <div className='absolute top-3 right-3'>{getStatusBadge(raffle.status)}</div>

        {isEndingSoon && (
          <div className='absolute top-3 left-3'>
            <Badge className='bg-orange-500/90 text-white border-orange-500'>
              <Zap className='w-3 h-3 mr-1' />
              Ending soon!
            </Badge>
          </div>
        )}

        <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
      </div>

      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between gap-2'>
          <CardTitle className='text-lg font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors'>
            {raffle.title}
          </CardTitle>
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className='flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full shrink-0'>
                <Target className='w-3 h-3 text-primary' />
                <span className='text-xs font-medium text-primary'>{raffle.maxWinners}</span>
              </div>
            </HoverCardTrigger>
            <HoverCardContent>
              <p className='text-sm'>
                <strong>{raffle.maxWinners}</strong> maximum winner(s) for this raffle
              </p>
            </HoverCardContent>
          </HoverCard>
        </div>

        <CardDescription className='line-clamp-2 text-sm'>{raffle.description}</CardDescription>
      </CardHeader>

      <CardContent className='pt-0 space-y-4'>
        {/* Prize Description */}
        <div className='p-3 bg-primary/5 rounded-lg border border-primary/10'>
          <div className='flex items-center gap-2 mb-1'>
            <Trophy className='w-4 h-4 text-primary' />
            <span className='text-sm font-medium text-primary'>Prize</span>
          </div>
          <p className='text-sm text-foreground font-medium line-clamp-2'>{raffle.prizeDescription}</p>
        </div>

        {/* Participation Info */}
        <div className='grid grid-cols-2 gap-3 text-sm'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center'>
              <span className='text-xs font-bold text-green-700'>{raffle.tokenSymbol}</span>
            </div>
            <div>
              <p className='font-medium'>{formatPrice(raffle.participationPrice)}</p>
              <p className='text-xs text-muted-foreground'>Entry fee</p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Users className='w-4 h-4 text-muted-foreground' />
            <div>
              <p className='font-medium'>{raffle.maxParticipants || '∞'}</p>
              <p className='text-xs text-muted-foreground'>Max participants</p>
            </div>
          </div>
        </div>

        <div className='space-y-2 text-sm'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Calendar className='w-4 h-4' />
            <span>Start: {formatDate(raffle.startDate)}</span>
          </div>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Clock className='w-4 h-4' />
            <span>End: {formatDate(raffle.endDate)}</span>
          </div>
        </div>

        <div className='flex items-center gap-2 p-2 bg-muted/50 rounded-lg'>
          <div className='w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center'>
            <Target className='w-3 h-3 text-primary' />
          </div>
          <div className='text-xs'>
            <span className='text-muted-foreground'>Minimum required:</span>
            <span className='font-medium ml-1'>
              {raffle.minimumFanTokens} {raffle.tokenSymbol}
            </span>
          </div>
        </div>

        <div className='pt-2'>
          {isActive ? (
            hasParticipated ? (
              <Button variant='secondary' className='w-full' size='sm' disabled>
                <Trophy className='w-4 h-4 mr-2' />
                Already Joined
              </Button>
            ) : (
              <Button
                className='w-full bg-primary hover:bg-primary/90 text-white font-medium'
                size='sm'
                onClick={() => setDialogOpen(true)}
              >
                <Trophy className='w-4 h-4 mr-2' />
                Join Raffle
              </Button>
            )
          ) : isEnded ? (
            <Button variant='outline' className='w-full' size='sm' disabled>
              <Trophy className='w-4 h-4 mr-2' />
              Raffle Ended
            </Button>
          ) : (
            <Button variant='outline' className='w-full' size='sm' disabled>
              <Clock className='w-4 h-4 mr-2' />
              Coming Soon
            </Button>
          )}
        </div>
      </CardContent>

      <ParticipateRaffleDialog
        raffle={raffle}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          // Optionally refresh data or show success message
          console.log('Successfully joined raffle!');
        }}
      />
    </Card>
  );
}

function RaffleListItem({ raffle, hasParticipated }: RaffleItemProps) {
  const { walletAddress } = useWallet();
  const [dialogOpen, setDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className='bg-green-500/10 text-green-700 border-green-500/20'>🔥 Active</Badge>;
      case 'ENDED':
        return <Badge variant='secondary'>🏁 Ended</Badge>;
      case 'DRAFT':
        return <Badge variant='outline'>⏳ Draft</Badge>;
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatPrice = (price: string) => {
    return `${Number(price).toFixed(2)} ${raffle.tokenSymbol}`;
  };

  const isActive = raffle.status === 'ACTIVE';
  const isEnded = raffle.status === 'ENDED';
  const timeLeft = raffle.endDate ? new Date(raffle.endDate).getTime() - Date.now() : 0;
  const isEndingSoon = timeLeft > 0 && timeLeft < 24 * 60 * 60 * 1000;

  return (
    <Card
      className={cn(
        'group hover:shadow-lg transition-all duration-300 border-2',
        isActive && 'border-primary/20 hover:border-primary/40',
        isEnded && 'opacity-75',
        isEndingSoon && 'border-orange-500/20 hover:border-orange-500/40',
      )}
    >
      <CardContent className='p-6'>
        <div className='flex items-start gap-4'>
          <div className='relative w-24 h-24 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg overflow-hidden flex-shrink-0'>
            {raffle.imageUrl ? (
              <Image
                src={raffle.imageUrl}
                alt={raffle.title}
                fill
                className='object-cover group-hover:scale-105 transition-transform duration-300'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center'>
                <Trophy className='w-8 h-8 text-primary/30' />
              </div>
            )}
          </div>

          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between gap-2 mb-2'>
              <h3 className='font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors'>
                {raffle.title}
              </h3>
              <div className='flex items-center gap-2 flex-shrink-0'>
                {getStatusBadge(raffle.status)}
                {isEndingSoon && (
                  <Badge className='bg-orange-500/90 text-white border-orange-500'>
                    <Zap className='w-3 h-3 mr-1' />
                    Ending soon!
                  </Badge>
                )}
              </div>
            </div>

            <p className='text-sm text-muted-foreground line-clamp-2 mb-3'>{raffle.description}</p>

            <div className='flex items-center justify-between gap-2'>
              <div className='flex items-center gap-2'>
                <Clock className='w-4 h-4 text-muted-foreground' />
                <div>
                  <p className='font-medium'>{formatDate(raffle.endDate)}</p>
                  <p className='text-xs text-muted-foreground'>End date</p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Users className='w-4 h-4 text-muted-foreground' />
                <div>
                  <p className='font-medium'>{raffle.maxParticipants || '∞'}</p>
                  <p className='text-xs text-muted-foreground'>Max participants</p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Target className='w-4 h-4 text-muted-foreground' />
                <div>
                  <p className='font-medium'>{raffle.maxWinners}</p>
                  <p className='text-xs text-muted-foreground'>Winners</p>
                </div>
              </div>
            </div>
          </div>

          <div className='flex-shrink-0 flex flex-col gap-8'>
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center'>
                <span className='text-xs font-bold text-green-700'>{raffle.tokenSymbol}</span>
              </div>
              <div>
                <p className='font-medium'>{formatPrice(raffle.participationPrice)}</p>
                <p className='text-xs text-muted-foreground'>Entry fee</p>
              </div>
            </div>

            {isActive ? (
              hasParticipated ? (
                <Button variant='secondary' disabled>
                  <Trophy className='w-4 h-4 mr-2' />
                  Already Joined
                </Button>
              ) : (
                <Button disabled={!walletAddress} onClick={() => setDialogOpen(true)}>
                  <Trophy className='w-4 h-4 mr-2' />
                  Join Raffle
                </Button>
              )
            ) : isEnded ? (
              <Button variant='outline' disabled>
                <Trophy className='w-4 h-4 mr-2' />
                Raffle Ended
              </Button>
            ) : (
              <Button variant='outline' disabled>
                <Clock className='w-4 h-4 mr-2' />
                Coming Soon
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      <ParticipateRaffleDialog
        raffle={raffle}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          // Optionally refresh data or show success message
          console.log('Successfully joined raffle!');
        }}
      />
    </Card>
  );
}
