'use client';

import type { Raffle } from '@repo/db';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@repo/ui/components/hover-card';
import { cn } from '@repo/ui/lib/utils';
import { Calendar, Clock, Target, Trophy, Users, Zap } from 'lucide-react';
import Image from 'next/image';

interface RaffleListProps {
  raffles: Raffle[];
  className?: string;
}

export function RaffleList({ raffles, className }: RaffleListProps) {
  if (raffles.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
        <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4'>
          <Trophy className='w-8 h-8 text-primary' />
        </div>
        <h3 className='text-lg font-semibold mb-2'>No raffle available</h3>
        <p className='text-muted-foreground max-w-sm'>
          Raffles will appear here once they are created by the organizers.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {raffles.map((raffle) => (
        <RaffleCard key={raffle.id} raffle={raffle} />
      ))}
    </div>
  );
}

interface RaffleCardProps {
  raffle: Raffle;
}

function RaffleCard({ raffle }: RaffleCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className='bg-green-500/10 text-green-700 border-green-500/20'>🔥 Active</Badge>;
      case 'ENDED':
        return <Badge variant='secondary'>🏁 Terminée</Badge>;
      case 'DRAFT':
        return <Badge variant='outline'>⏳ Brouillon</Badge>;
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
  const isEndingSoon = timeLeft > 0 && timeLeft < 24 * 60 * 60 * 1000; // moins de 24h

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
              Se termine bientôt !
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
                <strong>{raffle.maxWinners}</strong> gagnant(s) maximum pour cette raffle
              </p>
            </HoverCardContent>
          </HoverCard>
        </div>

        <CardDescription className='line-clamp-2 text-sm'>{raffle.description}</CardDescription>
      </CardHeader>

      <CardContent className='pt-0 space-y-4'>
        {/* Prix du lot */}
        <div className='p-3 bg-primary/5 rounded-lg border border-primary/10'>
          <div className='flex items-center gap-2 mb-1'>
            <Trophy className='w-4 h-4 text-primary' />
            <span className='text-sm font-medium text-primary'>Prix à gagner</span>
          </div>
          <p className='text-sm text-foreground font-medium line-clamp-2'>{raffle.prizeDescription}</p>
        </div>

        {/* Informations de participation */}
        <div className='grid grid-cols-2 gap-3 text-sm'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center'>
              <span className='text-xs font-bold text-green-700'>{raffle.tokenSymbol}</span>
            </div>
            <div>
              <p className='font-medium'>{formatPrice(raffle.participationPrice)}</p>
              <p className='text-xs text-muted-foreground'>Prix participation</p>
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
            <span>Début: {formatDate(raffle.startDate)}</span>
          </div>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Clock className='w-4 h-4' />
            <span>Fin: {formatDate(raffle.endDate)}</span>
          </div>
        </div>

        <div className='flex items-center gap-2 p-2 bg-muted/50 rounded-lg'>
          <div className='w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center'>
            <Target className='w-3 h-3 text-primary' />
          </div>
          <div className='text-xs'>
            <span className='text-muted-foreground'>Minimum requis:</span>
            <span className='font-medium ml-1'>
              {raffle.minimumFanTokens} {raffle.tokenSymbol}
            </span>
          </div>
        </div>

        <div className='pt-2'>
          {isActive ? (
            <Button className='w-full bg-primary hover:bg-primary/90 text-white font-medium' size='sm'>
              <Trophy className='w-4 h-4 mr-2' />
              Participer à la raffle
            </Button>
          ) : isEnded ? (
            <Button variant='outline' className='w-full' size='sm' disabled>
              <Trophy className='w-4 h-4 mr-2' />
              Raffle terminée
            </Button>
          ) : (
            <Button variant='outline' className='w-full' size='sm' disabled>
              <Clock className='w-4 h-4 mr-2' />
              Bientôt disponible
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
