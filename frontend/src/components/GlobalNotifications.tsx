"use client";

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';

export default function GlobalNotifications() {
  const { socket } = useSocket();
  const [activeAlert, setActiveAlert] = useState<any>(null);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "MEDICINE_REMINDER" || message.type === "EMERGENCY_SOS") {
          setActiveAlert(message);
          // Auto-dismiss after 10 seconds
          setTimeout(() => setActiveAlert(null), 10000);
        }
      } catch (e) {
        console.error("Failed to parse socket message in GlobalNotifications:", e);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket]);

  if (!activeAlert) return null;

  const isSOS = activeAlert.type === "EMERGENCY_SOS";

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md animate-bounce`}>
      <div className={`p-6 rounded-2xl shadow-2xl border-4 ${isSOS ? 'bg-red-600 border-red-400 text-white' : 'bg-blue-600 border-blue-400 text-white'}`}>
        <div className="flex items-center gap-4">
          <span className="text-4xl">{isSOS ? '🚨' : '🔔'}</span>
          <div>
            <h4 className="font-black uppercase tracking-widest text-sm">
              {isSOS ? 'HIGH PRIORITY SOS' : 'MEDICINE REMINDER'}
            </h4>
            <p className="text-lg font-bold">
              {isSOS ? `${activeAlert.data.patient_name} needs help at ${activeAlert.data.location}!` : `Time to take ${activeAlert.data.medicine_name} (${activeAlert.data.dosage})`}
            </p>
            {!isSOS && <p className="text-xs opacity-80 mt-1">{activeAlert.data.instructions}</p>}
          </div>
          <button onClick={() => setActiveAlert(null)} className="ml-auto text-white p-2">✕</button>
        </div>
      </div>
    </div>
  );
}
