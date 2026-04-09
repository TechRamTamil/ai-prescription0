"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import GlobalNotifications from './GlobalNotifications';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  const pathname = usePathname();

  const isPublicPage = pathname === '/' || pathname === '/login';

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <GlobalNotifications />
      {!isPublicPage && <Sidebar />}
      <main className={`flex-1 transition-all duration-300 ${!isPublicPage ? 'ml-64' : ''}`}>
        {children}
      </main>
    </div>
  );
}
