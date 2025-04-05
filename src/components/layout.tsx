
import React from 'react';
import { Sidebar } from './ui/sidebar';
import { SidebarTrigger } from './ui/sidebar-trigger';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <SidebarTrigger />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
