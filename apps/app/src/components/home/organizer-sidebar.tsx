'use client';

import type { OrgWithoutWallet } from '@/types/database';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar';
import { Badge } from '@repo/ui/components/badge';
import { Card, CardContent } from '@repo/ui/components/card';
import { Input } from '@repo/ui/components/input';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { cn } from '@repo/ui/lib/utils';
import { Search, Trophy, Users, Verified } from 'lucide-react';
import { useState } from 'react';

interface OrganizerSidebarProps {
  organizers: OrgWithoutWallet[];
  selectedOrganizer: OrgWithoutWallet | null;
  onSelectOrganizer: (organizer: OrgWithoutWallet | null) => void;
  className?: string;
}

export function OrganizerSidebar({
  organizers,
  selectedOrganizer,
  onSelectOrganizer,
  className,
}: OrganizerSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrganizers = organizers.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className={cn('w-full h-full', className)}>
      <Card className='h-full bg-muted backdrop-blur-sm'>
        <CardContent className='p-4'>
          <div className='space-y-4'>
            <div className='flex items-center gap-2 pb-2 border-b'>
              <Trophy className='h-5 w-5 text-primary' />
              <h2 className='font-semibold text-lg'>Organizations</h2>
              <Badge variant='secondary' className='ml-auto'>
                {organizers.length}
              </Badge>
            </div>

            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
              <Input
                placeholder='Search organizations...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>

            <div
              className={cn(
                'p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md',
                selectedOrganizer === null
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/50',
              )}
              onClick={() => onSelectOrganizer(null)}
            >
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center'>
                  <Users className='h-5 w-5 text-primary' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-medium text-sm'>All Organizations</h3>
                  <p className='text-xs text-muted-foreground'>View all available raffles</p>
                </div>
              </div>
            </div>

            <ScrollArea className='h-[calc(100vh-280px)]'>
              <div className='space-y-2'>
                {filteredOrganizers.map((org) => (
                  <OrganizerCard
                    key={org.id}
                    organizer={org}
                    isSelected={selectedOrganizer?.id === org.id}
                    onSelect={() => onSelectOrganizer(org)}
                  />
                ))}
              </div>
            </ScrollArea>

            {/* No Results */}
            {filteredOrganizers.length === 0 && searchTerm && (
              <div className='text-center py-8'>
                <Users className='h-12 w-12 text-muted-foreground mx-auto mb-2' />
                <p className='text-sm text-muted-foreground'>No organizations found</p>
                <p className='text-xs text-muted-foreground'>Try adjusting your search</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface OrganizerCardProps {
  organizer: OrgWithoutWallet;
  isSelected: boolean;
  onSelect: () => void;
}

function OrganizerCard({ organizer, isSelected, onSelect }: OrganizerCardProps) {
  return (
    <div
      className={cn(
        'p-3 rounded-lg bg-background border-2 cursor-pointer transition-all duration-200 hover:shadow-md backdrop-blur-sm',
        isSelected ? 'border-primary shadow-sm' : 'border-border hover:border-primary/50 backdrop-blur-sm',
      )}
      onClick={onSelect}
    >
      <div className='flex items-center gap-3'>
        <Avatar className='h-10 w-10'>
          <AvatarImage src={organizer.logoUrl || undefined} alt={organizer.name} />
          <AvatarFallback className='text-xs font-bold bg-gradient-to-br from-primary/20 to-primary/10'>
            {organizer.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <h3 className='font-medium text-sm truncate'>{organizer.name}</h3>
            {organizer.isVerified && <Verified className='size-3 text-blue-500 flex-shrink-0' />}
          </div>
          <div className='flex items-center gap-2 mt-1'>
            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
              <Trophy className='h-3 w-3' />
              <span>{organizer.totalCompletedRaffles} raffles</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
