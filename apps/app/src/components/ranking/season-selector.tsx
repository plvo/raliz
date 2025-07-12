'use client';

import type { Season } from '@repo/db';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent } from '@repo/ui/components/card';
import { cn } from '@repo/ui/lib/utils';
import { Calendar, Clock, TrendingUp } from 'lucide-react';

interface SeasonSelectorProps {
  seasons: Season[];
  selectedSeasonId: string | null;
  onSeasonChange: (seasonId: string | null) => void;
}

export function SeasonSelector({ seasons, selectedSeasonId, onSeasonChange }: SeasonSelectorProps) {
  return (
    <Card>
      <CardContent className='p-6'>
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            <h3 className='text-lg font-semibold'>Select Period</h3>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'>
            {/* Overall Option */}
            <Button
              variant={selectedSeasonId === null ? 'default' : 'outline'}
              className={cn(
                'h-auto p-4 flex flex-col items-start gap-2',
                selectedSeasonId === null && 'ring-2 ring-primary',
              )}
              onClick={() => onSeasonChange(null)}
            >
              <div className='flex items-center gap-2'>
                <TrendingUp className='h-4 w-4' />
                <span className='font-medium'>Overall</span>
              </div>
              <span className='text-xs text-muted-foreground'>All-time rankings</span>
            </Button>

            {/* Season Options */}
            {seasons.map((season) => (
              <Button
                key={season.id}
                variant={selectedSeasonId === season.id ? 'default' : 'outline'}
                className={cn(
                  'h-auto p-4 flex flex-col items-start gap-2',
                  selectedSeasonId === season.id && 'ring-2 ring-primary',
                )}
                onClick={() => onSeasonChange(season.id)}
              >
                <div className='flex items-center gap-2'>
                  <Clock className='h-4 w-4' />
                  <span className='font-medium'>{season.name}</span>
                  {season.isActive && (
                    <Badge variant='secondary' className='text-xs'>
                      Active
                    </Badge>
                  )}
                </div>
                <div className='text-xs text-muted-foreground text-left'>
                  {new Date(season.startDate).toLocaleDateString()} - {new Date(season.endDate).toLocaleDateString()}
                </div>
              </Button>
            ))}
          </div>

          {/* Info */}
          <div className='pt-4 border-t'>
            <p className='text-sm text-muted-foreground'>
              Rankings are calculated based on CHZ tokens engaged in raffles.
              <span className='font-medium'> 1 CHZ = 10 points</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
