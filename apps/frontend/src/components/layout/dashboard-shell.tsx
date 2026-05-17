'use client';

import { Outlet } from 'react-router-dom';

import { RoleNavbar } from './role-navbar';

export function DashboardShell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <RoleNavbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
