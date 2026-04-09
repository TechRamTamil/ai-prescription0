"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

type NotifType = 'appointment' | 'prescription' | 'alert' | 'system' | 'message';

interface Notification {
  id: number;
  type: NotifType;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const typeConfig: Record<NotifType, { icon: string; color: string; bg: string; border: string }> = {
  appointment: { icon: '🗓️', color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200' },
  prescription:{ icon: '💊', color: 'text-purple-700', bg: 'bg-purple-50',  border: 'border-purple-200' },
  alert:       { icon: '⚠️', color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200' },
  system:      { icon: '🔧', color: 'text-slate-700',  bg: 'bg-slate-50',   border: 'border-slate-200' },
  message:     { icon: '💬', color: 'text-emerald-700',bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 1,  type: 'appointment',  title: 'New Appointment Booked',       description: 'Patient Raj Kumar has booked an appointment for 10:30 AM tomorrow.',                  time: '2 min ago',   read: false },
  { id: 2,  type: 'prescription', title: 'Prescription Ready',           description: 'Prescription #RX-2045 for patient Priya has been approved and sent to pharmacy.',       time: '15 min ago',  read: false },
  { id: 3,  type: 'alert',        title: 'Drug Interaction Warning',     description: 'AI detected a potential interaction between Metformin and Ibuprofen for patient #34.', time: '1 hr ago',    read: false },
  { id: 4,  type: 'message',      title: 'Message from Dr. Anita',      description: 'Can you review the lab report for patient Suresh before 4 PM today?',                  time: '2 hrs ago',   read: false },
  { id: 5,  type: 'system',       title: 'System Update Available',      description: 'Prescription AI v2.4 is now available with improved AI predictions.',                  time: '5 hrs ago',   read: true  },
  { id: 6,  type: 'appointment',  title: 'Appointment Rescheduled',      description: 'Patient Meena Devi has rescheduled her appointment to 3:00 PM on March 23.',           time: 'Yesterday',   read: true  },
  { id: 7,  type: 'prescription', title: 'Prescription Dispensed',       description: 'Pharmacy confirmed prescription #RX-2041 was dispensed to patient at 11:45 AM.',       time: 'Yesterday',   read: true  },
  { id: 8,  type: 'alert',        title: 'High Blood Pressure Alert',    description: 'Patient Arjun reported BP of 160/100. Immediate review recommended.',                  time: '2 days ago',  read: true  },
  { id: 9,  type: 'message',      title: 'Patient Feedback Received',    description: 'Patient Kavya left a 5-star rating for your consultation on March 19.',                time: '2 days ago',  read: true  },
  { id: 10, type: 'system',       title: 'Backup Completed Successfully','description': 'All patient data has been backed up securely to cloud storage.',                     time: '3 days ago',  read: true  },
];

const FILTERS = ['All', 'Unread', 'Appointment', 'Prescription', 'Alert', 'Message', 'System'] as const;
type Filter = typeof FILTERS[number];

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<Filter>('All');

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return !n.read;
    return n.type === activeFilter.toLowerCase();
  });

  const markRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotif = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications(prev => prev.filter(n => !n.read));
  };

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fadeIn">
      {/* Header */}
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-slate-900 text-white text-xs font-black px-2.5 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-slate-500 font-medium">Stay updated with your latest activity</p>
        </div>
        <div className="flex gap-2 mt-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              ✅ Mark all read
            </button>
          )}
          <button
            onClick={clearAll}
            className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors px-3 py-2"
          >
            🗑 Clear read
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 custom-scrollbar">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              activeFilter === f
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="enterprise-card p-12 text-center">
          <span className="text-5xl block mb-4">🎉</span>
          <p className="font-bold text-slate-900">All caught up!</p>
          <p className="text-sm text-slate-400 font-medium mt-1">No notifications here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(notif => {
            const cfg = typeConfig[notif.type];
            return (
              <div
                key={notif.id}
                onClick={() => markRead(notif.id)}
                className={`enterprise-card p-4 flex gap-4 cursor-pointer transition-all hover:shadow-md group ${
                  !notif.read ? 'border-l-4 border-l-slate-900' : 'opacity-70 hover:opacity-100'
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xl ${cfg.bg} ${cfg.border} border`}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm font-bold ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5 leading-relaxed">
                        {notif.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notif.read && (
                        <span className="w-2 h-2 bg-slate-900 rounded-full flex-shrink-0" />
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all text-xs font-bold"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.color}`}>
                      {notif.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{notif.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
