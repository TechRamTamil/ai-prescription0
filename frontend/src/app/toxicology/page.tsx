"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ToxicologyDashboard() {
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'CRITICAL', substance: 'Arsenic Trioxide', patient: 'ID-8821', time: '12:05 PM', status: 'UNSTABLE' },
    { id: 2, type: 'STABLE', substance: 'Digitalis Glycoside', patient: 'ID-4429', time: '11:45 AM', status: 'MONITORING' },
    { id: 3, type: 'WARNING', substance: 'Ethylene Glycol', patient: 'ID-9910', time: '12:12 PM', status: 'INTERVENTION' },
  ]);

  const [scanlines, setScanlines] = useState(true);

  return (
    <div className="min-h-screen bg-black text-white venom-theme font-mono p-4 selection:bg-green-500 selection:text-black">
      {/* Scanline Overlay */}
      {scanlines && <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20"></div>}

      {/* Header */}
      <header className="flex justify-between items-center border-b border-venom-green pb-4 mb-6 venom-glow-green">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-venom-green rounded-full flex items-center justify-center animate-pulse">
             <span className="text-black font-black text-2xl">V</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter venom-text-glow">TOXICOLOGY CONTROL</h1>
            <p className="text-[10px] text-venom-green opacity-70 tracking-widest uppercase">Smart Response System v.2.0</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-venom-purple font-mono neon-purple">12:22:45</div>
          <p className="text-[10px] text-venom-purple uppercase tracking-[0.2em]">System Normal / 98% Efficiency</p>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        
        {/* Rapid Response Panel (Left) */}
        <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
          <h2 className="text-xs font-bold text-venom-green mb-2 racking-tighter flex items-center gap-2">
            <span className="w-2 h-2 bg-venom-green rounded-full animate-ping"></span>
            RAPID RESPONSE QUEUE
          </h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {alerts.map(alert => (
              <div key={alert.id} className={`p-4 border ${alert.type === 'CRITICAL' ? 'border-red-500 bg-red-950/20' : 'border-venom-green/30 bg-venom-green/5'} venom-card relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${alert.type === 'CRITICAL' ? 'bg-red-500 block' : 'bg-venom-green'}`}></div>
                <div className="flex justify-between text-[10px] mb-1 font-bold">
                  <span className={alert.type === 'CRITICAL' ? 'text-red-400' : 'text-venom-green'}>{alert.type}</span>
                  <span className="text-white/40">{alert.time}</span>
                </div>
                <h3 className="text-sm font-bold truncate">{alert.substance}</h3>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-xs text-white/60">{alert.patient}</span>
                  <span className={`text-[10px] px-1 py-0.5 rounded ${alert.status === 'UNSTABLE' ? 'bg-red-600' : 'bg-venom-green/20 text-venom-green'}`}>{alert.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tactical View (Middle) */}
        <div className="col-span-6 flex flex-col gap-4">
          <div className="flex-1 border border-venom-green/20 venom-card relative group">
             <div className="absolute top-2 left-2 text-[8px] text-venom-green opacity-50 font-mono">MAP_COORD: 10.43.21 / 09.82.11</div>
             
             {/* Chemical Pulse Visualization */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg viewBox="0 0 400 200" className="w-full h-1/2 overflow-visible">
                  <path 
                    d="M 0 100 Q 50 100 70 20 Q 90 180 110 100 L 150 100 Q 180 100 200 150 Q 220 50 240 100 L 400 100" 
                    fill="none" 
                    stroke="#39ff14" 
                    strokeWidth="2"
                    className="animate-dash"
                    style={{ strokeDasharray: '400', strokeDashoffset: '400' }}
                  />
                   <path 
                    d="M 0 110 Q 50 110 70 30 Q 90 190 110 110 L 150 110 Q 180 110 200 160 Q 220 60 240 110 L 400 110" 
                    fill="none" 
                    stroke="#bc13fe" 
                    strokeWidth="1"
                    opacity="0.3"
                  />
                </svg>
             </div>

             {/* Center HUD Overlay */}
             <div className="absolute inset-0 border-[30px] border-transparent border-t-venom-green/5 border-b-venom-purple/5 pointer-events-none"></div>

             <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                <div className="space-y-1">
                   <div className="text-[10px] text-venom-green font-bold">BIO_SYST_OK: 94%</div>
                   <div className="flex gap-1">
                      {[1,2,3,4,5,6].map(i => <div key={i} className={`w-3 h-1 ${i < 5 ? 'bg-venom-green' : 'bg-venom-green/20'}`}></div>)}
                   </div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] text-venom-purple font-bold">DECRYPTING ENZYMES...</div>
                   <div className="text-[8px] opacity-40">SEQUENCE_A110.02.XX</div>
                </div>
             </div>
          </div>

          {/* System Control Interface */}
          <div className="h-32 border border-venom-purple/20 bg-venom-purple/5 venom-card p-4 flex gap-6">
             <div className="flex-1 border-r border-white/5 space-y-2">
                <h4 className="text-[10px] font-bold text-white/50 uppercase">Analysis Engine</h4>
                <div className="flex gap-2">
                   <button className="bg-venom-green/20 border border-venom-green text-venom-green text-xs font-bold py-1 px-3 hover:bg-venom-green hover:text-black transition-colors">SEQ_INIT</button>
                   <button className="bg-white/5 border border-white/20 text-white/40 text-xs font-bold py-1 px-3">PURGE_FLUIDS</button>
                </div>
             </div>
             <div className="flex-1 space-y-1 overflow-hidden">
                <p className="text-[9px] text-venom-green underline uppercase">Telemetry Feed</p>
                <div className="text-[8px] space-y-0.5 opacity-60">
                   <p className="text-venom-green">[12:22:11] ENGINE_START: Successful</p>
                   <p>[12:22:12] Sub_Id_4429: Heart rate elevated</p>
                   <p className="text-red-400 font-bold">[12:22:15] ALARM: Arsenic levels exceeding safety threshold</p>
                   <p>[12:22:19] Attempting automated neutralizer injection...</p>
                </div>
             </div>
          </div>
        </div>

        {/* AI Control Center (Right) */}
        <div className="col-span-3 flex flex-col gap-4">
           <div className="flex-1 border border-venom-purple/30 bg-venom-purple/10 venom-glow-purple venom-card flex flex-col">
              <div className="bg-venom-purple/20 p-2 border-b border-venom-purple/30 flex justify-between items-center">
                 <span className="text-xs font-black tracking-widest text-venom-purple">VENOM_AI_01</span>
                 <span className="w-2 h-2 bg-venom-purple rounded-full animate-pulse"></span>
              </div>
              <div className="flex-1 p-4 space-y-4 text-xs font-medium overflow-y-auto">
                 <div className="bg-white/5 p-3 rounded rounded-tl-none border border-white/10">
                    Hello Team. I am monitoring the Toxicology feed. Patient ID-8821 is showing critical Arsenic toxicity symptoms.
                 </div>
                 <div className="bg-venom-green/10 p-3 rounded rounded-tr-none border border-venom-green/30 self-end text-venom-green">
                    VENOM: Suggest neutralizing protocols immediately.
                 </div>
                 <div className="bg-white/5 p-3 rounded rounded-tl-none border border-white/10 italic opacity-60">
                    Searching database... DIMERCAPROL suggested for acute Arsenic poisoning. Monitor renal function.
                 </div>
              </div>
              <div className="p-3 border-t border-white/10">
                 <input 
                   type="text" 
                   className="w-full bg-black/50 border border-venom-purple/40 text-venom-purple p-2 text-xs focus:outline-none focus:border-venom-purple venom-glow-purple" 
                   placeholder="COMMAND THE AI..."
                 />
              </div>
           </div>
        </div>

      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #39ff1488; border-radius: 10px; }
        .neon-purple { text-shadow: 0 0 10px #bc13fe88; }
        @keyframes dash { to { stroke-dashoffset: 0; } }
        .animate-dash { animation: dash 2s ease-in-out infinite alternate; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}
