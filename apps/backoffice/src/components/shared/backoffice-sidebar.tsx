'use client';

import { signOut } from '@/lib/auth-client';
import { Button } from '@repo/ui/components/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@repo/ui/components/sidebar';
import { Book, Calendar, MessageCircle, Palette, Settings, Users } from 'lucide-react';

const items = [
  {
    title: 'Cycle et matières',
    url: '/cycles-subjects',
    icon: Calendar,
  },
  {
    title: 'Domaines',
    url: '/domains',
    icon: Settings,
  },
  {
    title: 'Classe Type',
    url: '/class-types',
    icon: Book,
  },
  {
    title: 'Couleurs',
    url: '/colors',
    icon: Palette,
  },
  {
    title: 'Groupes de travail',
    url: '/workgroups',
    icon: Users,
  },
  {
    title: "Motifs d'inscription",
    url: '/reasons',
    icon: MessageCircle,
  },
  {
    title: 'Événements',
    url: '/events',
    icon: Calendar,
  }
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Classyc</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button variant='destructive' onClick={() => signOut()} className='cursor-pointer'>
                    Se déconnecter
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
