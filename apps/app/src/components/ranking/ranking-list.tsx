'use client';

import type { OrganizerRankingData, SeasonRankingData } from '@/actions/ranking/get';
import { Badge } from '@repo/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import { CalendarDays, TrendingUp, Users } from 'lucide-react';
import { RankingCard } from './ranking-card';

interface RankingListProps {
  data: OrganizerRankingData[];
  seasonData?: SeasonRankingData | null;
  isSeasonView?: boolean;
}

export function RankingList({ data, seasonData, isSeasonView = false }: RankingListProps) {
  if (isSeasonView && seasonData) {
    return (
      <div className='space-y-6'>
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            <h3 className='text-lg font-semibold'>Season Rankings</h3>
          </div>
          <div className='grid gap-4'>
            {seasonData.organizerStats.map((item) => (
              <RankingCard
                key={item.organizer.id}
                data={{
                  organizer: item.organizer,
                  totalChzEngaged: item.stats.totalChzEngaged,
                  totalPoints: item.points,
                  rank: item.rank,
                }}
                showDetails={false}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Overall Rankings Header */}
      <div className='flex items-center gap-2'>
        <TrendingUp className='h-5 w-5' />
        <h3 className='text-lg font-semibold'>Overall Rankings</h3>
        <Badge variant='secondary' className='ml-2'>
          All Time
        </Badge>
      </div>

      {/* Top 3 Podium */}
      {data.length >= 3 && (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
          {data.slice(0, 3).map((item) => (
            <RankingCard key={item.organizer.id} data={item} showDetails={true} />
          ))}
        </div>
      )}

      {/* Rest of the rankings */}
      {data.length > 3 && (
        <div className='space-y-4'>
          <h4 className='text-md font-medium text-muted-foreground'>Other Organizations</h4>
          <div className='grid gap-4'>
            {data.slice(3).map((item) => (
              <RankingCard key={item.organizer.id} data={item} showDetails={false} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {data.length === 0 && (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <TrendingUp className='h-12 w-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No Rankings Available</h3>
            <p className='text-muted-foreground text-center max-w-md'>
              There are no organization rankings to display at this time. Rankings will appear once organizations start
              engaging with raffles.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
