"use client";

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';

export default function AdminDashboard() {
  const { socket } = useSocket();
  const [stats, setStats] = useState<any>({
    total_users: 0,
    active_prescriptions: 0,
    total_appointments: 0,
    active_users: 0,
    recent_activity: []
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/admin/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch admin stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        console.log("WS Message received in Admin:", message);
        
        if (message.type === "NEW_APPOINTMENT" || message.type === "NEW_PRESCRIPTION") {
          fetchStats();
        }
      } catch (e) {
        console.error("Failed to parse socket message", e);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col uppercase-none">
      <header className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">SMART PRESCRIPTION | Admin Portal</h1>
        <button className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-medium transition-colors">Logout</button>
      </header>
      
      <main className="flex-grow p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Total Users</h2>
            <p className="text-3xl font-bold text-gray-800 mt-2">{loading ? '...' : stats.total_users}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Active Prescriptions</h2>
            <p className="text-3xl font-bold text-gray-800 mt-2">{loading ? '...' : stats.active_prescriptions}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-indigo-500 hover:shadow-lg transition-shadow">
            <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Appointments</h2>
            <p className="text-3xl font-bold text-gray-800 mt-2">{loading ? '...' : stats.total_appointments}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Server Status</h2>
            <p className="text-xl font-bold text-green-600 mt-2 flex items-center">
              <span className="h-3 w-3 bg-green-500 rounded-full inline-block mr-2 animate-pulse"></span>
              Operational
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <h2 className="text-xl font-bold text-gray-800">Recent User Registrations</h2>
               <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded">LIVE</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recent_activity.length > 0 ? (
                    stats.recent_activity.map((user: any) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                            user.role === 'doctor' ? 'bg-blue-100 text-blue-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-6 py-10 text-center text-gray-500 italic">No activity</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <h2 className="text-xl font-bold text-gray-800">New Appointments</h2>
               <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded">REAL-TIME</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recent_appointments && stats.recent_appointments.length > 0 ? (
                    stats.recent_appointments.map((appt: any) => (
                      <tr key={appt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          #{appt.id} (P:{appt.patient_id})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {appt.date} <br/> <span className="text-xs text-gray-400">{appt.time}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {appt.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-gray-500 italic">No new appointments</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
