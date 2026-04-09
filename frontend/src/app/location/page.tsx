"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Map component to prevent SSR usage of 'window'
const LiveMap = dynamic(() => import('@/components/LiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-slate-100 rounded-3xl flex items-center justify-center border-4 border-white shadow-xl animate-pulse">
       <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Geographic Data...</p>
    </div>
  )
});

export default function LocationPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto animate-fadeIn">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Medical Map</h1>
          <p className="text-slate-500 font-medium">Real-time coordinates and nearby specialized centers</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Facilities</p>
              <p className="text-lg font-black text-slate-900">42</p>
           </div>
           <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Pharmacies</p>
              <p className="text-lg font-black text-emerald-600">18</p>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Map */}
        <div className="lg:col-span-12">
          <LiveMap />
        </div>

        {/* Feature Cards Below Map */}
        <div className="lg:col-span-4 enterprise-card p-6 flex items-start gap-4">
           <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-blue-100">🚑</div>
           <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase mb-1">Emergency Dispatch</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Direct connection to local emergency units via geo-coordinates.</p>
           </div>
        </div>

        <div className="lg:col-span-4 enterprise-card p-6 flex items-start gap-4">
           <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-emerald-100">💊</div>
           <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase mb-1">Pharmacy Delivery</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">AI-routed delivery from the closest available pharmacy station.</p>
           </div>
        </div>

        <div className="lg:col-span-4 enterprise-card p-6 flex items-start gap-4">
           <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-purple-100">🏢</div>
           <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase mb-1">Satellite Centers</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Primary care units accessible within a 5km radius of your location.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
