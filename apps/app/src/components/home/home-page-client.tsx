'use client';

import { getRaffles } from '@/actions/raffles/get';
import { useActionQuery } from '@/hooks/use-action';
import type { OrgWithoutWallet } from '@/types/database';
import { Card, CardContent } from '@repo/ui/components/card';
import { Skeleton } from '@repo/ui/components/skeleton';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { OrganizerSidebar } from './organizer-sidebar';
import { RaffleMainView } from './raffle-main-view';

interface HomePageClientProps {
  organizers: OrgWithoutWallet[];
}

export function HomePageClient({ organizers }: HomePageClientProps) {
  const [selectedOrganizer, setSelectedOrganizer] = useState<OrgWithoutWallet | null>(null);

  const {
    data: raffles,
    isLoading,
    error,
  } = useActionQuery({
    queryKey: ['raffles', selectedOrganizer?.id ?? 'all'],
    actionFn: () => getRaffles({ orgId: selectedOrganizer?.id }),
    queryOptions: {
      staleTime: 60 * 1000, // 1 minute
    },
  });

  const handleSelectOrganizer = (organizer: OrgWithoutWallet | null) => {
    setSelectedOrganizer(organizer);
  };

  if (error) {
    return (
      <div className='container mx-auto py-8'>
        <Card className='bg-background/90 backdrop-blur-sm'>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <AlertCircle className='h-12 w-12 text-destructive mb-4' />
            <h3 className='text-lg font-semibold mb-2'>Error Loading Data</h3>
            <p className='text-muted-foreground text-center max-w-md'>
              Failed to load raffles. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <section className='container mx-auto py-8'>
      <div className='flex gap-6 h-[calc(100vh-6rem)]'>
        <div className='w-1/4'>
          <OrganizerSidebar
            organizers={organizers}
            selectedOrganizer={selectedOrganizer}
            onSelectOrganizer={handleSelectOrganizer}
          />
        </div>

        {/* Main Content - 3/4 width */}
        <div className='flex-1'>
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <RaffleMainView raffles={raffles || []} selectedOrganizer={selectedOrganizer} />
          )}
        </div>
      </div>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <Card className='h-full'>
      <CardContent className='p-6'>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <Skeleton className='h-8 w-48' />
            <div className='flex items-center gap-4'>
              <Skeleton className='h-6 w-20' />
              <Skeleton className='h-8 w-16' />
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className='overflow-hidden'>
                <Skeleton className='h-48 w-full' />
                <div className='p-4 space-y-3'>
                  <Skeleton className='h-6 w-3/4' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-2/3' />
                  <div className='flex gap-2'>
                    <Skeleton className='h-8 w-20' />
                    <Skeleton className='h-8 w-20' />
                  </div>
                  <Skeleton className='h-10 w-full' />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
