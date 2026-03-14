"use client";

import React, { useState } from 'react';

export default function PatientDashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [digitalResult, setDigitalResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setDigitalResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/ai/upload_prescription`, {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        setDigitalResult(data);
      } else {
        console.error("Failed to process prescription");
        alert("Failed to process the image. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Network error. Is the backend running?");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col">
      <header className="bg-sky-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">HealthConnect | Patient</h1>
        <div className="flex items-center space-x-4">
          <button className="text-sky-100 hover:text-white transition">My Profile</button>
          <button className="bg-sky-800 hover:bg-sky-900 px-4 py-2 rounded text-sm font-medium transition-colors">Logout</button>
        </div>
      </header>
      
      <main className="flex-grow p-4 md:p-8 max-w-6xl mx-auto w-full">
        
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 border-b-4 border-sky-400">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Hello, Michael</h2>
            <p className="text-gray-500 mt-2">Here is a summary of your health activity.</p>
          </div>
          <button className="w-full md:w-auto bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-xl shadow transition transform hover:-translate-y-1">
            Book New Appointment
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Active Prescriptions */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 flex items-center">
              <span className="bg-yellow-100 text-yellow-600 p-2 rounded-lg mr-3">💊</span>
              Active Prescriptions
            </h3>
            
            <div className="space-y-4">
              <div className="border border-gray-100 bg-gray-50 p-4 rounded-xl hover:bg-sky-50 transition border-l-4 border-l-blue-400">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-800">Amoxicillin 500mg</h4>
                    <p className="text-sm text-gray-500">Take 1 pill three times a day</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Active</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-xs text-gray-400">Prescribed by Dr. Smith • 2 days ago</span>
                  <button className="text-sky-600 text-sm font-semibold hover:underline">Request Refill</button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Digitization Section */}
          <div className="bg-white rounded-2xl shadow p-6 border border-sky-100">
             <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 flex items-center">
              <span className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-3">📸</span>
              Digitize Handwritten Prescription
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Have a paper prescription? Upload a photo and our AI will convert the doctor's handwriting into a clean, digital format.
              </p>
              
              <div className="border-2 border-dashed border-sky-300 bg-sky-50 rounded-xl p-6 text-center hover:bg-sky-100 transition cursor-pointer relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <svg className="mx-auto h-12 w-12 text-sky-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {selectedFile ? (
                   <p className="text-sm font-semibold text-sky-700">{selectedFile.name}</p>
                ) : (
                  <p className="text-sm text-gray-500">Click or drag an image here to upload</p>
                )}
              </div>

              <button 
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className={`w-full font-bold py-3 px-4 rounded-xl shadow transition ${
                  !selectedFile 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : isUploading 
                      ? 'bg-sky-400 text-white cursor-wait'
                      : 'bg-sky-600 hover:bg-sky-700 text-white transform hover:-translate-y-1'
                }`}
              >
                {isUploading ? 'Analyzing Image...' : 'Digitize Prescription'}
              </button>
            </div>
            
            {/* Digital Result View */}
            {digitalResult && (
              <div className="mt-8 p-5 bg-green-50 rounded-xl border border-green-200 animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-green-800 text-lg">Digitization Success</h4>
                  <span className="bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded">
                    {(digitalResult.confidence_score * 100).toFixed(0)}% Confidence
                  </span>
                </div>
                
                <div className="bg-white rounded p-4 shadow-sm border border-green-100 mb-4">
                   <p className="text-sm"><span className="font-semibold text-gray-700">Doctor:</span> {digitalResult.doctor_name}</p>
                   <p className="text-sm"><span className="font-semibold text-gray-700">Diagnosis:</span> {digitalResult.diagnosis}</p>
                   <p className="text-sm"><span className="font-semibold text-gray-700">Date:</span> {digitalResult.date}</p>
                </div>

                <h5 className="font-bold text-gray-800 mb-2">Prescribed Medications:</h5>
                <ul className="space-y-3">
                  {digitalResult.medications.map((med: any, idx: number) => (
                    <li key={idx} className="bg-white p-3 rounded shadow-sm border-l-4 border-green-400">
                      <p className="font-bold text-gray-800">{med.name} <span className="text-sm font-normal text-gray-500">({med.dosage})</span></p>
                      <p className="text-sm text-gray-600 mt-1">{med.frequency}</p>
                      <p className="text-xs text-gray-400 mt-1 italic">Note: {med.notes}</p>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-xs text-gray-500"><strong>Raw Extracted Text:</strong> {digitalResult.raw_text_extracted}</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
