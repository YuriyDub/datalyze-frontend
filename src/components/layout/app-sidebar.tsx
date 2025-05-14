import * as React from 'react';
import { Database, Home, MessageSquare } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import logoIcon from '@/assets/logo_icon.png';
import { useGetProfileQuery } from '@/services/api/profile';

const data = {
  navMain: [
    {
      title: 'Home',
      url: '/',
      icon: Home,
    },
    {
      title: 'Your Data',
      url: '/your-data',
      icon: Database,
    },
    {
      title: 'AI Chat',
      url: '/chats',
      icon: MessageSquare,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user, isLoading } = useGetProfileQuery();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <img src={logoIcon} className="rounded-sm" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Datalyze Inc</span>
                  <span className="truncate text-xs">ecommerce</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>{user && !isLoading && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
