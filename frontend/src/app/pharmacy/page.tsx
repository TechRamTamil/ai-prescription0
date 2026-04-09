"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function PharmacyDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="p-8">
      {/* Page Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pharmacy Operations</h1>
          <p className="text-slate-500 font-medium">Fulfillment and Prescription Management Center</p>
        </div>
        <div className="flex gap-3">
           <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm flex items-center gap-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Inventory Linked</span>
           </div>
        </div>
      </header>
      
      <main className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Pending Fulfillment Queue</h2>
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Filter by RX-ID or Patient..." 
              className="w-80 pl-10 h-11 text-sm font-medium"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity">🔍</span>
          </div>
        </div>

        <div className="enterprise-card overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient Details</th>
                <th scope="col" className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clinical Specifications</th>
                <th scope="col" className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authorization</th>
                <th scope="col" className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th scope="col" className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Control</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="font-bold text-slate-900 text-sm">Michael Scott</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: RX-883920</div>
                </td>
                <td className="px-8 py-6">
                  <div className="text-sm text-slate-900 font-bold">Amoxicillin 500mg</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-tight">Quantity: 21 | Sig: 1 PO TID x7d</div>
                </td>
                <td className="px-8 py-6">
                  <div className="text-sm text-slate-900 font-bold">Dr. Sarah Smith</div>
                  <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-tighter border border-emerald-100">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                    Verified Signature
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                    Pending
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="btn-primary text-[10px] font-black uppercase py-2 px-4 shadow-slate-100">
                    Fulfill Request
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div className="bg-slate-50/30 p-4 text-center border-t border-slate-100">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">End of authorized queue</p>
          </div>
        </div>
      </main>
    </div>
  );
}
