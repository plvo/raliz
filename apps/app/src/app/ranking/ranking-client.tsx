'use client';

import { type OrganizerRankingData, type SeasonRankingData, getSeasonRanking } from '@/actions/ranking/get';
import { RankingList } from '@/components/ranking/ranking-list';
import { SeasonSelector } from '@/components/ranking/season-selector';
import { useActionQuery } from '@/hooks/use-action';
import type { Season } from '@repo/db';
import { Card, CardContent } from '@repo/ui/components/card';
import { Skeleton } from '@repo/ui/components/skeleton';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface RankingPageClientProps {
  initialOverallRanking: OrganizerRankingData[];
  seasons: Season[];
}

export function RankingPageClient({ initialOverallRanking, seasons }: RankingPageClientProps) {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);

  // Fetch season-specific data when a season is selected
  const {
    data: seasonData,
    isLoading: isSeasonLoading,
    error: seasonError,
  } = useActionQuery({
    queryKey: ['season-ranking', selectedSeasonId ?? 'null'],
    actionFn: () => (selectedSeasonId ? getSeasonRanking(selectedSeasonId) : Promise.resolve({ ok: true, data: null })),
    queryOptions: {
      enabled: !!selectedSeasonId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  });

  const handleSeasonChange = (seasonId: string | null) => {
    setSelectedSeasonId(seasonId);
  };

  const isSeasonView = selectedSeasonId !== null;
  const currentSeasonData = isSeasonView ? seasonData : null;

  return (
    <div className='space-y-8'>
      <SeasonSelector seasons={seasons} selectedSeasonId={selectedSeasonId} onSeasonChange={handleSeasonChange} />

      {isSeasonView && isSeasonLoading && (
        <div className='space-y-4'>
          <Card>
            <CardContent className='p-6'>
              <div className='space-y-4'>
                <Skeleton className='h-6 w-48' />
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-4 w-28' />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className='grid gap-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className='p-6'>
                  <div className='flex items-center gap-4'>
                    <Skeleton className='h-10 w-10 rounded-full' />
                    <div className='space-y-2 flex-1'>
                      <Skeleton className='h-4 w-32' />
                      <Skeleton className='h-3 w-48' />
                    </div>
                    <Skeleton className='h-6 w-16' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isSeasonView && !!seasonError && (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <AlertCircle className='h-12 w-12 text-destructive mb-4' />
            <h3 className='text-lg font-semibold mb-2'>Error Loading Season Data</h3>
            <p className='text-muted-foreground text-center max-w-md'>
              Failed to load season ranking data. Please try again later.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rankings Display */}
      {!isSeasonLoading && !seasonError && (
        <RankingList
          data={isSeasonView ? [] : initialOverallRanking}
          seasonData={currentSeasonData}
          isSeasonView={isSeasonView}
        />
      )}
    </div>
  );
}
