import React from 'react';

export default function PharmacyDashboard() {
  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col">
      <header className="bg-emerald-800 text-white p-4 shadow-lg flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wider">RX CONNECT | Pharmacy</h1>
        <button className="bg-emerald-600 hover:bg-emerald-700 px-5 py-2 rounded text-sm font-bold transition shadow">Log Out</button>
      </header>
      
      <main className="flex-grow p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-3xl font-extrabold text-gray-800">Prescription Queue</h2>
          <input 
            type="text" 
            placeholder="Search Patient or RX ID..." 
            className="w-72 p-2 border border-emerald-200 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-emerald-100">
          <table className="min-w-full divide-y divide-emerald-200">
            <thead className="bg-emerald-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Patient Name</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Medication</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Doctor Info</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-emerald-800 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-emerald-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-semibold text-gray-900">Michael Scott</div>
                  <div className="text-sm text-gray-500">ID: RX-883920</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 font-medium">Amoxicillin 500mg</div>
                  <div className="text-sm text-gray-500">Qty: 21 | Sig: 1 PO TID x7d</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Dr. Sarah Smith</div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    <svg className="mr-1 h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Verified Signature
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                    Pending Fulfillment
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-white bg-emerald-500 hover:bg-emerald-600 font-bold py-2 px-4 rounded shadow">
                    Mark Ready
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
