import React from 'react';

export default function DoctorDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-teal-700 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">SMART PRESCRIPTION | Doctor Portal</h1>
        <div className="flex items-center space-x-4">
          <span className="font-medium text-teal-100">Dr. Smith</span>
          <button className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-medium transition-colors">Logout</button>
        </div>
      </header>
      
      <main className="flex-grow p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Patient Queue */}
        <div className="bg-white rounded-xl shadow p-6 lg:col-span-1 border-t-4 border-teal-500">
          <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Today's Appointments</h2>
          <ul className="space-y-3">
            <li className="p-3 bg-teal-50 rounded border border-teal-100 flex justify-between items-center cursor-pointer hover:bg-teal-100 transition">
              <div>
                <p className="font-semibold text-gray-800">John Doe</p>
                <p className="text-xs text-gray-500">10:00 AM - Fever</p>
              </div>
              <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded-full">Next</span>
            </li>
            <li className="p-3 bg-gray-50 rounded border border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition">
              <div>
                <p className="font-semibold text-gray-800">Jane Smith</p>
                <p className="text-xs text-gray-500">11:30 AM - Checkup</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Right column: AI Prescription Tool */}
        <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">AI Prescription Generator</h2>
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              AI Powered
            </span>
          </div>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
              <input type="text" placeholder="E.g., Bacterial Pharyngitis" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
                <textarea rows={3} placeholder="Sore throat, fever, etc." className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Vitals/Notes (Optional)</label>
                <textarea rows={3} placeholder="Weight, BP, existing conditions..." className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"></textarea>
              </div>
            </div>

            <button type="button" className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded shadow-lg transform hover:-translate-y-0.5 transition-all">
              Generate Prescription Recommendations
            </button>
          </form>

          {/* Placeholder for results */}
          <div className="mt-8 p-4 bg-gray-50 rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
            Fill out the form and click generate to see AI medication recommendations.
          </div>
        </div>

      </main>
    </div>
  );
}
