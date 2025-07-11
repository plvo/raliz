import { HoverCard, HoverCardContent, HoverCardTrigger } from '@repo/ui/components/hover-card';
import type * as React from 'react';

export interface HoverRevealProps extends React.RefAttributes<HTMLDivElement> {
  children: React.ReactNode;
  content: React.ReactNode;
}

export function HoverReveal({ children, content, ...props }: HoverRevealProps) {
  return (
    <HoverCard {...props}>
      <HoverCardTrigger className='cursor-pointer'>{children}</HoverCardTrigger>
      <HoverCardContent className='text-sm w-full'>{content}</HoverCardContent>
    </HoverCard>
  );
}
