import { AppSidebar } from '@/components/shared/backoffice-sidebar';
import { SidebarProvider, SidebarTrigger } from '@repo/ui/components/sidebar';
import type React from 'react';

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SidebarProvider open={true}>
        <AppSidebar />
        {children}
        <footer className='py-8' />
      </SidebarProvider>
    </>
  );
}
