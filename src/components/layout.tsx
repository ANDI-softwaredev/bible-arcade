
import React from 'react';
import { Sidebar } from './ui/sidebar';
import { SidebarTrigger } from './ui/sidebar-trigger';
import { AppSidebar } from './app-sidebar';
import { SidebarProvider } from './ui/sidebar';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex-1">
          <SidebarTrigger />
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
