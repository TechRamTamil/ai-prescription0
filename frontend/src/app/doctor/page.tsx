"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

export default function DoctorDashboard() {
  const { user, token, logout } = useAuth();
  const { socket } = useSocket();
  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [vitals, setVitals] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [visionResult, setVisionResult] = useState<any>(null);
  const [isVisionAnalyzing, setIsVisionAnalyzing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); 

  const handleVisionAnalysis = async (file: File) => {
    setIsVisionAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/ai/analyze-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        setVisionResult(data);
      }
    } catch (error) {
      console.error("Vision analysis failed", error);
    } finally {
      setIsVisionAnalyzing(false);
    }
  };
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoadingAppts, setIsLoadingAppts] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fetchAppointments = async (doctorId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/doctors/${doctorId}/appointments`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
        if (data.length > 0 && !selectedPatient) setSelectedPatient(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch appointments", error);
    } finally {
      setIsLoadingAppts(false);
    }
  };

  const fetchDoctorProfile = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/doctors/me/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const profile = await response.json();
        setDoctorProfile(profile);
        fetchAppointments(profile.id);
      }
    } catch (error) {
      console.error("Failed to fetch doctor profile", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDoctorProfile();
    }
  }, [token]);

  useEffect(() => {
    if (!socket || !token) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "NEW_APPOINTMENT") {
          if (doctorProfile?.id) {
            fetchAppointments(doctorProfile.id);
          } else {
            fetchDoctorProfile();
          }
        }
      } catch (e) {
        console.error("Failed to parse socket message in Doctor:", e);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, token, doctorProfile?.id]);

  const handleGenerate = async () => {
    if (!diagnosis || !symptoms) {
      alert("Please enter at least a diagnosis and symptoms.");
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/ai/generate_prescription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          diagnosis,
          symptoms,
          patient_age: 35, // Mocked for now
          allergies: vitals // Can be parsed further
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        throw new Error("Failed to generate");
      }
    } catch (error) {
      console.error("Failed to generate prescription", error);
      alert("AI Service error. Ensure GEMINI_API_KEY is set in backend .env");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePredict = async () => {
    if (!symptoms) {
      alert("Please enter symptoms first.");
      return;
    }

    setIsPredicting(true);
    setPredictions(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/ai/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ symptoms })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.error) {
          console.warn("AI Prediction error:", data.error);
          setPredictions(null);
        } else {
          setPredictions(data);
          if (data.predictions && data.predictions.length > 0) {
            setDiagnosis(data.predictions[0].disease);
          }
        }
      }
    } catch (error) {
      console.error("Prediction error", error);
    } finally {
      setIsPredicting(false);
    }
  };

  // Debounced auto-prediction for real-time analysis
  useEffect(() => {
    if (symptoms.trim().length > 10 && !isPredicting && !isGenerating) {
      const timer = setTimeout(() => {
        handlePredict();
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [symptoms]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto-trigger analysis for "real-time" feel
      handleAnalyzeSlip(file);
    }
  };

  const handleAnalyzeSlip = async (fileOrBlob?: File | Blob) => {
    const input = fileOrBlob || selectedFile;
    if (!input) return;

    setIsAnalyzing(true);
    setPredictions(null);
    setResult(null);

    const formData = new FormData();
    if (input instanceof File) {
      formData.append("file", input);
    } else {
      formData.append("file", input, "snapshot.jpg");
    }

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
        if (data.error) {
          alert(`AI Error: ${data.error}`);
          setResult(null);
        } else {
          setDiagnosis(data.diagnosis || "");
          setSymptoms(data.raw_text_extracted || "Analyzed from prescription scan.");
          setResult({
            medications: data.medications || [],
            warnings: ["Extracted automatically from real-time scan. Please verify."]
          });
          if (!fileOrBlob) alert("Prescription slip analyzed successfully!");
        }
      } else {
        alert("Failed to analyze. Server error or API timeout.");
      }
    } catch (error) {
      console.error("Error analyzing prescription:", error);
      alert("Network error while analyzing.");
    } finally {
      setIsAnalyzing(false);
      setSelectedFile(null);
      if (isCameraOpen) stopCamera();
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraOpen(true);
    
    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera capture is not supported in this browser or requires a secure (HTTPS) connection.");
      return;
    }

    const constraints = { 
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
    };

    try {
      let stream;
      try {
        // Try with environment camera first (mobile-friendly)
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        console.warn("Environment camera failed, falling back to default", e);
        // Fallback to any available camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      let errorMsg = "Could not access camera.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = "Camera access denied. Please click the lock icon (🔒) in the address bar and set Camera to 'Allow'.";
      } else if (err.name === 'NotFoundError') {
        errorMsg = "No camera found on this device.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = "Camera is already in use by another application. Please close it and try again.";
      }
      setCameraError(errorMsg);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            handleAnalyzeSlip(blob);
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleSavePrescription = async () => {
    if (!result || !result.medications) return;
    if (!doctorProfile) {
      alert("Doctor profile not loaded yet. Please refresh the page.");
      return;
    }

    setIsSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/prescriptions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_id: selectedPatient?.patient_id || 1,
          doctor_id: doctorProfile.id,
          diagnosis: result.diagnosis,
          medications: result.medications,
          ai_suggestions_used: true
        })
      });

      if (response.ok) {
        alert("Prescription signed and sent! Patient will receive an email notification.");
        setResult(null);
        setDiagnosis("");
        setSymptoms("");
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to save prescription to database.");
      }
    } catch (error: any) {
      console.error("Save error", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <>
      <div className="p-8">
        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Overview</h1>
          <p className="text-slate-500 font-medium">Welcome back, Dr. {user?.name || 'Assistant'}</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left column: Patient Queue */}
          <div className="enterprise-card p-6 lg:col-span-4 flex flex-col h-[calc(100vh-250px)]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Live Appointment Queue
              </h2>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider">{appointments.length} Total</span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {isLoadingAppts ? (
                <p className="text-sm text-slate-400 text-center py-10 italic">Retrieving patient queue...</p>
              ) : appointments.length === 0 ? (
                <div className="text-center py-12 opacity-40">
                  <span className="text-4xl">🗓️</span>
                  <p className="text-xs font-bold uppercase tracking-widest mt-4">Queue Empty</p>
                </div>
              ) : (
                appointments.map((appt, idx) => (
                  <div 
                    key={appt.id} 
                    onClick={() => setSelectedPatient(appt)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedPatient?.id === appt.id ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/5' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-slate-900 text-sm">Patient ID: {appt.patient_id}</p>
                      {selectedPatient?.id === appt.id && <span className="bg-slate-900 text-white text-[8px] px-1.5 py-0.5 rounded uppercase font-black tracking-widest leading-none">Treating Now</span>}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">{appt.time}</span>
                      <span className="truncate">{appt.reason}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right column: AI Prescription Tool */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Quick AI Prescribe Card */}
            <div className="enterprise-card p-8">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">AI Clinical Assistant</h2>
                    <p className="text-xs text-slate-500 font-medium">Disease prediction and smart prescription generation</p>
                 </div>
                 <div className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                   Real-time analysis active
                 </div>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex-1">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Prescription Slip Transcription</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-normal">Upload a physical script to auto-fill diagnosis and meds</p>
                 </div>
                 <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                      onClick={startCamera}
                      className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-2"
                    >
                      <span>📷</span> Scan with Camera
                    </button>
                    <div className="relative group flex-1 md:flex-none">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <button className="w-full md:w-auto px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:border-slate-400 transition-colors">
                        {selectedFile ? selectedFile.name : "📁 Choose Slip"}
                      </button>
                    </div>
                    <button 
                      onClick={() => handleAnalyzeSlip()}
                      disabled={!selectedFile || isAnalyzing}
                      className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          Analyzing...
                        </>
                      ) : (
                        "🚀 Analyze Script"
                      )}
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Symptoms</label>
                        <button 
                          onClick={() => {
                            const recognition = new (window as any).webkitSpeechRecognition();
                            recognition.lang = 'en-US';
                            recognition.onresult = (event: any) => {
                              setSymptoms(event.results[0][0].transcript);
                            };
                            recognition.start();
                          }}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          🎤 Speak
                        </button>
                      </div>
                      <textarea 
                        rows={4} 
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="e.g. Persistent dry cough, 102F fever, nausea..." 
                        className="w-full text-sm font-medium resize-none"
                      ></textarea>
                    </div>
                    <button 
                      onClick={handlePredict}
                      disabled={isPredicting || !symptoms}
                      className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
                    >
                      {isPredicting ? 'Analyzing...' : '🧠 Predict Most Likely Disease'}
                    </button>
                 </div>

                 <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirmed Diagnosis</label>
                        <button 
                          onClick={() => {
                            const recognition = new (window as any).webkitSpeechRecognition();
                            recognition.lang = 'en-US';
                            recognition.onresult = (event: any) => {
                              setDiagnosis(event.results[0][0].transcript);
                            };
                            recognition.start();
                          }}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          🎤 Speak
                        </button>
                      </div>
                      <input 
                        type="text" 
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="Enter or select from AI list" 
                        className="w-full text-sm font-medium" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Vitals / Allergies</label>
                      <input 
                         type="text" 
                         value={vitals}
                         onChange={(e) => setVitals(e.target.value)}
                         placeholder="e.g. BP 120/80, Penicillin allergy" 
                         className="w-full text-sm font-medium" 
                      />
                    </div>
                 </div>
              </div>

              {predictions && (
                <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100 animate-fadeIn">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">AI Suggestions</p>
                  <div className="flex flex-wrap gap-2">
                    {predictions.predictions?.map((p: any, i: number) => (
                      <button 
                        key={i} 
                        onClick={() => setDiagnosis(p.disease)}
                        className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                      >
                        {p.disease}: {(p.probability * 100).toFixed(0)}%
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !diagnosis}
                className="w-full btn-primary text-base py-4"
              >
                {isGenerating ? 'Computing Recommendations...' : '✨ Generate Intelligent Prescription'}
              </button>
            </div>

            {/* Results Area */}
            {result && (
              <div className="enterprise-card p-8 border-l-8 border-emerald-500 animate-fadeIn space-y-8">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Prescription Review</h3>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          const msg = `Reminder: Take your medicine as prescribed for ${result.diagnosis || diagnosis}`;
                           const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                           fetch(`${apiUrl}/reminders/send`, {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                             body: JSON.stringify({ medicine_name: result.medications?.[0]?.name, dosage: result.medications?.[0]?.dosage, instructions: msg })
                           });
                           alert("Reminder notification sent to patient!");
                        }}
                        className="btn-secondary text-[10px] px-3 py-2"
                      >
                        🔔 Send Reminder
                      </button>
                      <button 
                        onClick={handleSavePrescription}
                        disabled={isSaving}
                        className="btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                      >
                        {isSaving ? 'Processing...' : '✅ Digital Signature & Submit'}
                      </button>
                      {selectedPatient && (
                        <button 
                          onClick={() => {
                            const room = `consultation-${selectedPatient.id}`;
                            window.open(`https://meet.jit.si/${room}`, '_blank');
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2"
                        >
                          <span className="text-lg">📹</span>
                          Start Video Call
                        </button>
                      )}
                    </div>
                  </div>

                  {result.warnings && result.warnings.length > 0 && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold flex items-center gap-3">
                      <span className="text-xl">⚠️</span>
                      <p className="uppercase tracking-tight">AI Warning: {result.warnings[0]}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.medications?.map((med: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 p-5 rounded-xl border border-slate-100 relative group overflow-hidden">
                        <div className="absolute right-0 top-0 w-1 h-full bg-slate-200 group-hover:bg-emerald-500 transition-colors"></div>
                        <p className="font-black text-slate-900 text-base">{med.name}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-widest">{med.dosage} • {med.frequency}</p>
                        <p className="text-[10px] text-slate-400 mt-3 italic font-medium">Rationale: {med.reason}</p>
                        {result.tamil_instructions && result.tamil_instructions[idx] && (
                           <p className="text-[11px] text-blue-600 font-bold mt-4 pt-4 border-t border-blue-100">
                             🇮🇳 {result.tamil_instructions[idx]}
                           </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Toxicology Section */}
                  {result.toxicology_report && (
                    <div className="mt-8 pt-8 border-t border-slate-100">
                       <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                         <span className="text-lg">🧪</span> Advanced Toxicology Analysis
                       </h4>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                           <p className="text-[9px] font-black text-rose-400 uppercase tracking-[0.2em] mb-2">Interactions</p>
                           <p className="text-[11px] font-bold text-rose-900 leading-relaxed">{result.toxicology_report.interactions}</p>
                         </div>
                         <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                           <p className="text-[9px] font-black text-amber-400 uppercase tracking-[0.2em] mb-2">Side Effects</p>
                           <p className="text-[11px] font-bold text-amber-900 leading-relaxed">{result.toxicology_report.side_effects}</p>
                         </div>
                         <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                           <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Dosage Risks</p>
                           <p className="text-[11px] font-bold text-indigo-900 leading-relaxed">{result.toxicology_report.dosage_risk}</p>
                         </div>
                       </div>
                    </div>
                  )}
              </div>
            )}
            
            {/* Handwriting ML Analysis Card */}
            <div className="enterprise-card p-6 border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div style={{ backgroundImage: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '12px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                    ✍️
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base tracking-tight">Digit Handwriting Analysis</h3>
                    <p className="text-xs text-slate-500 font-medium">CNN model trained on 60K MNIST samples • Draw or upload a digit</p>
                  </div>
                </div>
                <a
                  href="/handwriting"
                  className="btn-primary text-sm px-4 py-2"
                  style={{ textDecoration: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, padding: '0.5rem 1.25rem' }}
                >
                  Open Tool →
                </a>
              </div>
            </div>

            {/* AI Imaging Lab Section */}
            <div className="enterprise-card p-8 border-l-8 border-indigo-500 bg-indigo-50/30">
               <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">AI Imaging & Vision Lab</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Advanced Clinical Analysis</p>
                 </div>
                 <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Gemini 1.5 Flash</span>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-8 text-center bg-white hover:border-indigo-400 transition-colors shadow-sm">
                        <input 
                           type="file" 
                           id="vision-upload" 
                           className="hidden" 
                           accept="image/*"
                           onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file) {
                               setSelectedFile(file);
                               handleVisionAnalysis(file);
                             }
                           }}
                        />
                        <label htmlFor="vision-upload" className="cursor-pointer flex flex-col items-center gap-3">
                           <span className="text-4xl">📸</span>
                           <p className="text-sm font-bold text-slate-700">Upload Patient Scan / Photo</p>
                           <p className="text-[10px] text-slate-400 font-medium">Supports Clinical Photos, X-rays, Scans</p>
                        </label>
                     </div>
                     {selectedFile && (
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-indigo-100 animate-fadeIn">
                           <span className="text-xs">📄</span>
                           <p className="text-[10px] font-bold text-indigo-600 truncate flex-1">{selectedFile.name}</p>
                           <button onClick={() => setSelectedFile(null)} className="text-rose-500 font-black text-xs hover:scale-110 transition-transform">×</button>
                        </div>
                     )}
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-indigo-100 min-h-[220px] flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                     {isVisionAnalyzing ? (
                        <div className="flex flex-col items-center gap-4">
                           <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                           <p className="text-[10px] font-black text-indigo-600 uppercase animate-pulse tracking-widest">Analyzing Neural Patterns...</p>
                        </div>
                     ) : visionResult ? (
                        <div className="w-full space-y-4 animate-fadeIn">
                           <div className="flex justify-between items-center">
                              <span className={`px-2 py-1 rounded text-[10px] font-black text-white ${visionResult.severity === 'High' ? 'bg-red-500' : visionResult.severity === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                                 {visionResult.severity} SEVERITY
                              </span>
                              <p className="text-xs font-black text-indigo-900 tracking-tight">{visionResult.potential_diagnosis}</p>
                           </div>
                           <div className="p-3 bg-slate-50 rounded-xl border-l-4 border-indigo-500">
                              <p className="text-[11px] font-medium text-slate-700 leading-relaxed italic">
                                 "{visionResult.analysis}"
                              </p>
                           </div>
                           <div className="space-y-2">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Clinical Recommendations</p>
                              <div className="flex flex-col gap-1">
                                {visionResult.recommendations?.map((rec: string, i: number) => (
                                   <div key={i} className="flex items-start gap-2 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50">
                                      <span className="text-indigo-600 text-[10px]">✔</span>
                                      <p className="text-[10px] font-bold text-slate-600">{rec}</p>
                                   </div>
                                ))}
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="text-center px-8">
                           <p className="text-xs font-bold text-slate-300 italic">
                             Awaiting Visual Input...
                           </p>
                           <p className="text-[9px] text-slate-400 mt-2 font-medium uppercase tracking-widest">Autonomous Vision Diagnostic System</p>
                        </div>
                     )}
                  </div>
               </div>
               
               <p className="text-[9px] text-slate-400 font-bold mt-6 uppercase tracking-tight opacity-50 text-right">
                 {visionResult?.disclaimer || "AI analysis is not a final clinical diagnosis. Human verification mandatory."}
               </p>
            </div>

          </div>
        </div>
      </div>
      
      {/* Camera Scanner Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn border border-white/20">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Prescription Slip Scanner</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Position the script clearly within the frame</p>
               </div>
               <button onClick={stopCamera} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all">✕</button>
            </div>
            
            <div className="relative aspect-video bg-black overflow-hidden group">
               {cameraError ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-900">
                    <span className="text-4xl mb-4">⚠️</span>
                    <p className="text-white font-bold">{cameraError}</p>
                    <button onClick={startCamera} className="mt-6 btn-primary text-xs">Try Again</button>
                 </div>
               ) : (
                 <>
                   <video 
                     ref={videoRef} 
                     autoPlay 
                     playsInline 
                     className="w-full h-full object-cover"
                   />
                   <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                      <div className="w-full h-full border-2 border-emerald-400/50 rounded-2xl relative">
                         <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1"></div>
                         <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1"></div>
                         <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 -ml-1 -mb-1"></div>
                         <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 -mr-1 -mb-1"></div>
                      </div>
                   </div>
                   <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                      <button 
                        onClick={captureSnapshot}
                        disabled={isAnalyzing}
                        className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-emerald-400 hover:scale-110 active:scale-95 transition-all group"
                      >
                         <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                            {isAnalyzing ? (
                               <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                               <span className="text-2xl">📸</span>
                            )}
                         </div>
                      </button>
                   </div>
                 </>
               )}
            </div>
            
            <div className="p-6 bg-slate-50 flex justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
               Real-time Gemini Vision Analysis Active
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for snapshots */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
}

