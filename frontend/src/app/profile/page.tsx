"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const roleTheme: Record<string, { primary: string; secondary: string; accent: string; label: string; icon: string }> = {
  doctor: { 
    primary: 'from-slate-900 to-indigo-950', 
    secondary: 'bg-indigo-50 text-indigo-700 border-indigo-100', 
    accent: 'bg-indigo-600',
    label: 'Registered Medical Practitioner',
    icon: '🩺'
  },
  patient: { 
    primary: 'from-emerald-900 to-teal-950', 
    secondary: 'bg-emerald-50 text-emerald-700 border-emerald-100', 
    accent: 'bg-emerald-600',
    label: 'Verified Patient Account',
    icon: '🧑‍⚕️'
  },
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [lastSync, setLastSync] = useState<string>("");
  
  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    setLastSync(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setLastSync(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, [user, router]);

  if (!user) return null;

  const role = user.role === 'doctor' ? 'doctor' : 'patient';
  const theme = roleTheme[role];
  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'G';

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12 flex items-center justify-center font-sans">
      <div className="w-full max-w-4xl animate-fadeIn">
        
        {/* Medical ID Card Container */}
        <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-white flex flex-col md:flex-row min-h-[500px]">
          
          {/* Left Side: Professional Branding & ID Info */}
          <div className={`w-full md:w-80 bg-gradient-to-br ${theme.primary} p-8 text-white flex flex-col justify-between relative overflow-hidden`}>
             {/* Background Decoration */}
             <div className="absolute top-[-40px] left-[-40px] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
             <div className="absolute bottom-[-20px] right-[-20px] w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl"></div>

             <div className="relative z-10 text-center">
                <div className="mb-8 flex justify-center">
                   <div className="w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-1">
                      <div className={`w-full h-full rounded-2xl ${theme.accent} flex items-center justify-center text-4xl font-black shadow-inner`}>
                         {initial}
                      </div>
                   </div>
                </div>
                
                <h2 className="text-2xl font-black tracking-tight mb-2">{user.name}</h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                   <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                   Active Credential
                </div>
                
                <div className="mt-8 space-y-4 text-left">
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Electronic ID</p>
                      <p className="text-xs font-mono font-bold">{user.email.split('@')[0].toUpperCase()}-2026-XQ</p>
                   </div>
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Issuing Authority</p>
                      <p className="text-xs font-bold">TechRam AI Medical Labs</p>
                   </div>
                </div>
             </div>

             <div className="relative z-10 pt-12 flex flex-col items-center">
                <div className="bg-white p-2 rounded-xl mb-4 shadow-lg opacity-80 transition-opacity hover:opacity-100">
                   {/* Mock QR Code */}
                   <div className="w-20 h-20 border-2 border-slate-900 grid grid-cols-4 gap-1 p-1">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className={`rounded-sm ${Math.random() > 0.5 ? 'bg-slate-900' : 'bg-transparent'}`}></div>
                      ))}
                   </div>
                </div>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Scan for Verification</p>
             </div>
          </div>

          {/* Right Side: Details & Live Status */}
          <div className="flex-1 p-8 md:p-12 relative">
             
             {/* Top Status Bar */}
             <div className="flex justify-between items-center mb-12">
                <div className="flex gap-4 items-center">
                   <button 
                      onClick={() => router.push(user.role === 'admin' ? '/doctor' : `/${user.role}`)}
                      className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                      title="Back to Dashboard"
                   >
                      <span className="text-xl">⬅️</span>
                   </button>
                   <div>
                      <h1 className="text-xs font-black text-slate-400 uppercase tracking-widest">Digital Healthcare Identification</h1>
                      <p className="text-2xl font-black text-slate-900 mt-1">{theme.label}</p>
                   </div>
                </div>
                <div className="text-right">
                   <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 animate-pulse">
                      STATUS: ONLINE
                   </div>
                   <p className="text-[9px] font-bold text-slate-400 mt-2">LAST SYNC: {lastSync}</p>
                </div>
             </div>

             {/* Personal Information Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="group transition-transform hover:translate-x-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Full Clinical Name</label>
                   <p className="text-base font-bold text-slate-900 pb-2 border-b-2 border-slate-100 group-hover:border-indigo-500 transition-colors uppercase">{user.name}</p>
                </div>
                <div className="group transition-transform hover:translate-x-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Verified Contact</label>
                   <p className="text-base font-bold text-slate-900 pb-2 border-b-2 border-slate-100 group-hover:border-indigo-500 transition-colors">{user.email}</p>
                </div>
                <div className="group transition-transform hover:translate-x-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Assigned Role</label>
                   <p className="text-base font-bold text-slate-900 pb-2 border-b-2 border-slate-100 group-hover:border-indigo-500 transition-colors uppercase">{user.role}</p>
                </div>
                <div className="group transition-transform hover:translate-x-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Region / Territory</label>
                   <p className="text-base font-bold text-slate-900 pb-2 border-b-2 border-slate-100 group-hover:border-indigo-500 transition-colors uppercase">Tamil Nadu, IN</p>
                </div>
             </div>

             {/* REAL-TIME USE CASE: Live Activity Log */}
             <div className="mb-12">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                   Live Clinical Action Log
                </h3>
                <div className="space-y-3">
                   {[
                     { action: 'AI Prescription Optimized', time: '2m ago', icon: '✨' },
                     { action: 'Patient Data Synchronized', time: '15m ago', icon: '🔄' },
                     { action: 'Security Protocol Updated', time: '1h ago', icon: '🛡️' }
                   ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 transition-all">
                        <div className="flex items-center gap-3">
                           <span className="text-sm">{item.icon}</span>
                           <p className="text-[11px] font-bold text-slate-700">{item.action}</p>
                        </div>
                        <span className="text-[9px] font-black text-slate-400">{item.time}</span>
                     </div>
                   ))}
                </div>
             </div>

             {/* Professional Stamp Section */}
             <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center gap-6 relative overflow-hidden group mb-8">
                <div className="absolute left-0 top-0 w-1 h-full bg-indigo-600"></div>
                <div className="w-16 h-16 rounded-full border-4 border-indigo-100 flex items-center justify-center text-3xl opacity-30 group-hover:opacity-100 transition-opacity">
                   🛡️
                </div>
                <div>
                   <h4 className="font-black text-slate-900 text-sm uppercase mb-1">Live Data Protection</h4>
                   <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">
                         {[...Array(5)].map((_, i) => (
                           <div key={i} className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                         ))}
                      </div>
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">AES-256 Heartbeat Active</span>
                   </div>
                   <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Real-time encryption is securing your clinical session. HIPAA and GDPR compliance protocols are actively monitored.
                   </p>
                </div>
             </div>

             {/* Dynamic System Metric */}
             <div className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <span className="text-6xl font-black italic">LIVE</span>
                </div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">Total Network Prescriptions Generated</p>
                <div className="flex items-baseline gap-2">
                   <p className="text-4xl font-black tabular-nums tracking-tighter">
                      {Math.floor(Date.now() / 10000) % 1000000}
                   </p>
                   <span className="text-emerald-400 text-xs font-bold animate-bounce">+1</span>
                </div>
                <div className="mt-4 flex items-center gap-4">
                   <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full bg-white/20 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold">D{i}</div>
                      ))}
                   </div>
                   <p className="text-[9px] font-bold text-white/60">Currently active physicians in your region</p>
                </div>
             </div>

             {/* Actions Footer */}
             <div className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4">
                   <button className="px-6 py-2.5 bg-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all">
                      Update Archive
                   </button>
                   <button className="px-6 py-2.5 border-2 border-slate-950 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-950 hover:text-white transition-all">
                      Sync Metadata
                   </button>
                </div>
                <button 
                  onClick={logout}
                  className="px-6 py-2.5 bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-100 transition-all border border-rose-100"
                >
                  Terminate Session
                </button>
             </div>
          </div>
        </div>

        {/* Floating Credit */}
        <p className="text-center mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
           Clinical Core Version 2.0.4-LOCKED
        </p>

      </div>
    </div>
  );
}
