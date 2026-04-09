"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const role = user?.role || 'doctor';
  const name = user?.name || 'Guest Physician';

  const menuItems = [
    { name: 'Dashboard', path: `/${role}`, icon: '📊' },
    { name: 'Live Location', path: '/location', icon: '📍' },
    { name: 'Profile', path: '/profile', icon: '👤' },
    { name: 'Notifications', path: '/notifications', icon: '🔔' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-slate-100 mb-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black">P</div>
          <span className="font-bold text-slate-900 tracking-tight">PRESCRIPTION AI</span>
        </Link>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest text-center">Open Access Mode</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={pathname === item.path ? 'sidebar-item-active' : 'sidebar-item'}
          >
            <span>{item.icon}</span>
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold uppercase">
            {name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold">{role}</p>
          </div>
        </div>
        {user && (
          <button 
            onClick={logout}
            className="w-full btn-secondary text-xs flex items-center justify-center gap-2 py-2"
          >
            <span>🚪</span> Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
