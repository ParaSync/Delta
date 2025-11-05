import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { LayoutDashboard, FileText, MessageSquareMore, Users, Settings, User } from 'lucide-react';
import { DeltaLogo } from '@/components/delta-logo';
import { useAuth } from '@/contexts/auth-context';

const adminItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Forms', url: '/forms', icon: FileText },
  { title: 'Responses', url: '/responses', icon: MessageSquareMore },
  { title: 'Users', url: '/users', icon: Users },
  { title: 'Settings', url: '/settings', icon: Settings },
];

const employeeItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Forms', url: '/forms', icon: FileText },
  { title: 'My Responses', url: '/responses', icon: MessageSquareMore },
  { title: 'Profile', url: '/profile', icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const items = user?.role === 'admin' ? adminItems : employeeItems;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary'
      : 'hover:bg-muted/50';

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarContent className="border-r">
        {/* Logo */}
        <div className="p-4 border-b">
          {collapsed ? (
            <div className="flex justify-center">
              <DeltaLogo size="sm" className="[&>span]:hidden" />
            </div>
          ) : (
            <DeltaLogo size="md" />
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>
            {user?.role === 'admin' ? 'Administration' : 'Navigation'}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
