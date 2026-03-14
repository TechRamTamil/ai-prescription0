import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">SMART PRESCRIPTION | Admin Portal</h1>
        <button className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-medium transition-colors">Logout</button>
      </header>
      
      <main className="flex-grow p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Total Users</h2>
            <p className="text-3xl font-bold text-gray-800 mt-2">1,204</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Active Prescriptions</h2>
            <p className="text-3xl font-bold text-gray-800 mt-2">856</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">System Status</h2>
            <p className="text-xl font-bold text-green-600 mt-2 flex items-center">
              <span className="h-3 w-3 bg-green-500 rounded-full inline-block mr-2 animate-pulse"></span>
              All Systems Operational
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Recent User Activity</h2>
          <p className="text-gray-600 italic">User data table will be rendered here...</p>
        </div>
      </main>
    </div>
  );
}
