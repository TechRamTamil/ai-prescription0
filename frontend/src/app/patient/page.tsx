"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ChatWidget from '@/components/ChatWidget';
import HealthChart from '@/components/HealthCharts';

export default function PatientDashboard() {
  const { user, token, logout } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [digitalResult, setDigitalResult] = useState<any>(null);
  const [healthData, setHealthData] = useState<any[]>([]);
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);
  const [newMetric, setNewMetric] = useState({ type: 'BP', value: '', unit: 'mmHg' });

  // Appointment Modal State
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("");
  const [apptEmail, setApptEmail] = useState("");
  const [apptReason, setApptReason] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(1);
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/patients/me/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const profile = await response.json();
          setPatientProfile(profile);
          fetchPrescriptions(profile.id);
        }
      } catch (error) {
        console.error("Failed to fetch patient profile", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    const fetchPrescriptions = async (patientId: number) => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/patients/${patientId}/prescriptions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPrescriptions(data);
        }
      } catch (error) {
        console.error("Failed to fetch prescriptions", error);
      }
    };

    const fetchHealthMetrics = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/health-metrics/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setHealthData(data);
        }
      } catch (error) {
        console.error("Failed to fetch health metrics", error);
      }
    };

    const fetchDoctors = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Extract doctors from recent_activity
          const doctorUsers = (data.recent_activity || []).filter((u: any) => u.role === 'doctor');
          setDoctors(doctorUsers);
          if (doctorUsers.length > 0) setSelectedDoctorId(doctorUsers[0].id);
        }
      } catch (e) {
        console.error("Failed to fetch doctors", e);
      }
    };

    fetchPatientProfile();
    fetchHealthMetrics();
    fetchDoctors();
  }, [token]);

  const handleAddMetric = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/health-metrics/`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
            ...newMetric,
            value: parseFloat(newMetric.value),
            patient_id: patientProfile?.id
        })
      });
      if (response.ok) {
        setIsMetricModalOpen(false);
        // Refresh
        const updated = await fetch(`${apiUrl}/health-metrics/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setHealthData(await updated.json());
      }
    } catch (error) {
      console.error("Failed to add metric", error);
    }
  };

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
        headers: {
          'Authorization': `Bearer ${token}`
        },
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

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/appointments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: patientProfile?.id || 1, 
          doctor_id: selectedDoctorId,
          patient_email: apptEmail,
          date: apptDate,
          time: apptTime,
          reason: apptReason
        }),
      });

      if (response.ok) {
        alert("Appointment booked successfully!");
        setIsApptModalOpen(false);
        setApptDate("");
        setApptTime("");
        setApptEmail("");
        setApptReason("");
      } else {
        alert("Failed to book appointment.");
      }
    } catch (error) {
      console.error(error);
      alert("Network error connecting to the API.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Health Central</h1>
          <p className="text-slate-500 font-medium">Welcome back, {user?.name || 'Patient'}</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={async () => {
               if (confirm("TRIGGER SOS ALERT? Nearby doctors will be notified!")) {
                 const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                 await fetch(`${apiUrl}/sos/trigger`, {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                   body: JSON.stringify({ location: "Room 302, Patient Ward B" })
                 });
                 alert("SOS ALERT BROADCASTED!");
               }
            }}
            className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-200"
          >
            🆘 TRIGGER SOS
          </button>
          <button 
            onClick={() => setIsApptModalOpen(true)}
            className="btn-primary flex items-center gap-2 group shadow-slate-200"
          >
            <span className="text-lg group-hover:rotate-12 transition-transform">📅</span>
            Book New Consultation
          </button>
          <button 
            onClick={() => {
              const room = `consultation-${patientProfile?.id || user?.id}`;
              window.open(`https://meet.jit.si/${room}`, '_blank');
            }}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2"
          >
            <span className="text-lg">📹</span>
            Video Call
          </button>
          <button 
            onClick={() => setIsMetricModalOpen(true)}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black shadow-lg shadow-slate-200 flex items-center gap-2"
          >
            <span className="text-lg">🏥</span>
            Log Vitals
          </button>
        </div>
      </header>

      {/* Health Trends Section */}
      <section className="mb-12 animate-fadeIn">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Health Trends & Analytics</h2>
          <div className="h-px flex-1 bg-slate-100"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Visualization</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <HealthChart data={healthData} type="BP" color="#ec4899" title="Blood Pressure" />
          <HealthChart data={healthData} type="Weight" color="#8b5cf6" title="Body Weight" />
          <HealthChart data={healthData} type="Sugar" color="#f59e0b" title="Blood Sugar" />
          <HealthChart data={healthData} type="HeartRate" color="#10b981" title="Heart Rate" />
        </div>
      </section>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Active Prescriptions (Left) */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
          <div className="enterprise-card p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
               <span>Active Medications</span>
               <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase px-2 py-1 rounded">1 Active</span>
            </h3>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {prescriptions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8 italic font-medium">No active medications found.</p>
              ) : (
                prescriptions.map((p, idx) => (
                  <div key={p.id} className="bg-slate-50 border border-slate-100 p-5 rounded-xl hover:bg-white hover:border-slate-200 transition-all group border-l-4 border-l-slate-900">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        {/* Display the first medication name for the card title */}
                        <h4 className="font-bold text-slate-900">{p.medications?.[0]?.name || "Prescription"}</h4>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                          {p.diagnosis}
                        </p>
                      </div>
                      <span className="bg-slate-900 text-white text-[8px] font-black uppercase px-1.5 py-1 rounded">
                        {p.status}
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                         {new Date(p.created_at).toLocaleDateString()}
                       </p>
                       <span className="text-[10px] text-emerald-600 font-black">ACTIVE</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="enterprise-card p-6 bg-slate-900 text-white overflow-hidden relative">
             <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
             <h4 className="font-bold text-sm mb-2 opacity-60 uppercase tracking-widest">Insurance Status</h4>
             <p className="text-2xl font-black tracking-tight">FULLY COVERED</p>
             <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                PREMIUM CORPORATE PLAN ACTIVE
             </div>
          </div>
        </div>

        {/* AI Digitization Section (Middle/Right) */}
        <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-8">
          
          <div className="enterprise-card p-8 bg-white border-t-8 border-slate-900">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-xl font-black text-slate-900 tracking-tight">Handwritten Digitization</h3>
                   <p className="text-xs text-slate-500 font-medium mt-1">AI-powered transcription for paper prescriptions</p>
                </div>
                <div className="bg-slate-50 text-slate-400 p-2 rounded-lg border border-slate-100">
                   📂 PNG / JPG / PDF
                </div>
             </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl p-8 text-center hover:bg-slate-100 transition-colors cursor-pointer relative group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                     <span className="text-xl">📤</span>
                  </div>
                  {selectedFile ? (
                     <p className="text-sm font-bold text-slate-900 truncate px-4">{selectedFile.name}</p>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-slate-900">Upload Script Image</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Drop file here</p>
                    </>
                  )}
                </div>

                <button 
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="w-full btn-primary text-base py-4"
                >
                  {isUploading ? 'Neural Processing...' : 'Start AI Digitization'}
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-center">
                 {!digitalResult ? (
                    <div className="text-center opacity-40">
                       <p className="text-xs font-black uppercase tracking-[0.2em]">Output Terminal</p>
                       <p className="text-[10px] mt-2">Waiting for file upload...</p>
                    </div>
                 ) : (
                   <div className="animate-fadeIn">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase tracking-tighter">Verified Result</span>
                        <span className="text-[10px] font-bold text-slate-400">Score: {(digitalResult.confidence_score * 100).toFixed(0)}%</span>
                      </div>
                      <div className="space-y-1 mb-6">
                        <p className="text-lg font-black text-slate-900 leading-tight">Dr. {digitalResult.doctor_name}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase">{digitalResult.diagnosis}</p>
                      </div>
                      <div className="space-y-3">
                        {digitalResult.medications.map((med: any, idx: number) => (
                          <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">{med.name}</span>
                            <span className="text-[10px] font-black text-slate-400">{med.dosage}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Booking Modal */}
      {isApptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-fadeIn border border-white">
            <div className="p-8 border-b border-slate-100">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Consultation Request</h3>
              <p className="text-slate-500 text-sm font-medium">Verify your details and choose a preferred slot</p>
            </div>
            
            <form onSubmit={handleBookAppointment} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialist</label>
                     <select 
                       className="w-full text-sm font-bold"
                       value={selectedDoctorId}
                       onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
                     >
                       {doctors.length > 0 ? (
                         doctors.map((d: any) => (
                           <option key={d.id} value={d.id}>Dr. {d.name}</option>
                         ))
                       ) : (
                         <option value={1}>Dr. (Available Doctor)</option>
                       )}
                     </select>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Email</label>
                    <input 
                      type="email" 
                      required
                      value={apptEmail}
                      onChange={(e) => setApptEmail(e.target.value)}
                      className="w-full text-sm font-bold"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preferred date</label>
                    <input type="date" required value={apptDate} onChange={(e) => setApptDate(e.target.value)} className="w-full text-sm font-bold" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interval</label>
                    <input type="time" required value={apptTime} onChange={(e) => setApptTime(e.target.value)} className="w-full text-sm font-bold" />
                 </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Reason</label>
                <textarea 
                  rows={2} required value={apptReason} onChange={(e) => setApptReason(e.target.value)}
                  placeholder="Summarize your symptoms..."
                  className="w-full text-sm font-bold resize-none"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsApptModalOpen(false)} className="btn-secondary">Dismiss</button>
                <button type="submit" disabled={isBooking} className="btn-primary">
                  {isBooking ? 'Registering...' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Chat Widget */}
      <ChatWidget />
      {/* Health Metric Modal */}
      {isMetricModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Log Daily Vitals</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Health Metric Entry</p>
              </div>
              <button onClick={() => setIsMetricModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-2xl font-black">&times;</button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metric Type</label>
                <select 
                  value={newMetric.type}
                  onChange={(e) => {
                    const type = e.target.value;
                    const unit = type === 'BP' ? 'mmHg' : type === 'Weight' ? 'kg' : type === 'Sugar' ? 'mg/dL' : 'bpm';
                    setNewMetric({ ...newMetric, type, unit });
                  }}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 transition-all"
                >
                  <option value="BP">Blood Pressure (mmHg)</option>
                  <option value="Weight">Body Weight (kg)</option>
                  <option value="Sugar">Blood Sugar (mg/dL)</option>
                  <option value="HeartRate">Heart Rate (bpm)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Measurement Value</label>
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="e.g. 120.5"
                  value={newMetric.value}
                  onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 transition-all"
                />
              </div>

              <button 
                onClick={handleAddMetric}
                disabled={!newMetric.value}
                className="w-full btn-primary py-4 mt-4 shadow-slate-200"
              >
                Save Clinical Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
