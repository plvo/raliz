'use client';

import type { OrganizerRankingData } from '@/actions/ranking/get';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar';
import { Badge } from '@repo/ui/components/badge';
import { Card, CardContent, CardHeader } from '@repo/ui/components/card';
import { cn } from '@repo/ui/lib/utils';
import { Award, ChevronRight, Medal, Trophy } from 'lucide-react';

interface RankingCardProps {
  data: OrganizerRankingData;
  showDetails?: boolean;
}

export function RankingCard({ data, showDetails = false }: RankingCardProps) {
  const { organizer, totalPoints, rank, totalChzEngaged } = data;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className='h-5 w-5 text-yellow-500' />;
      case 2:
        return <Medal className='h-5 w-5 text-gray-400' />;
      case 3:
        return <Award className='h-5 w-5 text-amber-600' />;
      default:
        return <span className='text-lg font-bold text-muted-foreground'>#{rank}</span>;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return 'default';
      case 2:
        return 'secondary';
      case 3:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatCHZ = (amount: string) => {
    const num = Number.parseFloat(amount);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(2);
  };

  const formatPoints = (points: number) => {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`;
    }
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`;
    }
    return points.toLocaleString();
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-lg',
        rank <= 3 && 'border-2',
        rank === 1 && 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20',
        rank === 2 && 'border-gray-400/50 bg-gray-50/50 dark:bg-gray-950/20',
        rank === 3 && 'border-amber-600/50 bg-amber-50/50 dark:bg-amber-950/20',
      )}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-10 h-10'>{getRankIcon(rank)}</div>
            <div className='flex items-center gap-3'>
              <Avatar className='h-10 w-10'>
                <AvatarImage src={organizer.logoUrl || undefined} alt={organizer.name} />
                <AvatarFallback>{organizer.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className='font-semibold text-lg'>{organizer.name}</h3>
                {organizer.description && (
                  <p className='text-sm text-muted-foreground line-clamp-1'>{organizer.description}</p>
                )}
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant={getRankBadgeVariant(rank)} className='text-xs'>
              Rank #{rank}
            </Badge>
            {organizer.isVerified && (
              <Badge variant='secondary' className='text-xs'>
                Verified
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-0'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-muted-foreground'>Total Points</p>
            <p className='text-2xl font-bold text-primary'>{formatPoints(totalPoints)}</p>
          </div>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-muted-foreground'>CHZ Engaged</p>
            <p className='text-2xl font-bold'>
              {formatCHZ(totalChzEngaged)}
              <span className='text-sm font-normal text-muted-foreground ml-1'>CHZ</span>
            </p>
          </div>
        </div>

        {showDetails && (
          <div className='mt-4 pt-4 border-t'>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <p className='text-muted-foreground'>Completed Raffles</p>
                <p className='font-medium'>{organizer.totalCompletedRaffles}</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Member Since</p>
                <p className='font-medium'>{new Date(organizer.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
