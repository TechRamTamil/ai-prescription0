"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState("doctor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [doctorSecretKey, setDoctorSecretKey] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError("");

    // Doctor must provide the secret key
    if (role === 'doctor' && !doctorSecretKey.trim()) {
      setError("Doctor Secret Key is required for physician access.");
      setIsLoggingIn(false);
      return;
    }

    const success = await login(email, password, role, doctorSecretKey);
    if (!success) {
      if (role === 'doctor') {
        setError("Authentication failed. Check your credentials or Doctor Secret Key.");
      } else {
        setError("Authentication failed. Please check your credentials.");
      }
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      
      {/* Main Login Container */}
      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Left Side: Branding/Visual */}
        <div className="hidden md:flex flex-col justify-between bg-slate-900 p-12 text-white relative">
           <div className="z-10">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 font-black text-xl">P</div>
                 <span className="text-xl font-black tracking-tighter">PRESCRIPTION AI</span>
              </div>
              <h2 className="text-4xl font-black leading-tight tracking-tight mb-6">
                Redefining clinical <br/> operations with <br/> <span className="text-emerald-400 underline decoration-slate-700 underline-offset-8">Intelligent AI.</span>
              </h2>
              <p className="text-slate-400 text-sm font-medium max-w-xs">
                The enterprise-grade platform for smart prescription management and rapid clinical response.
              </p>
           </div>

           <div className="z-10 space-y-4">
              <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-900 bg-slate-700"></div>)}
                 <div className="w-10 h-10 rounded-full border-4 border-slate-900 bg-emerald-500 flex items-center justify-center text-[10px] font-black">+2k</div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Trusted by leading medical centers</p>
           </div>

           {/* Decorative Background Elements */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-left">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Platform Access</h3>
            <p className="text-sm text-slate-500 font-medium">Please enter your specialized credentials below</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-bold animate-fadeIn">
                ⚠️ {error}
              </div>
            )}

            {/* Role Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorization Role</label>
              <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                {['doctor', 'patient'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); setError(""); setDoctorSecretKey(""); }}
                    className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${
                      role === r 
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {r === 'doctor' ? '🩺 Doctor' : '🧑‍⚕️ Patient'}
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Station Email</label>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@medical-center.com" 
                className="w-full text-sm font-bold"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">Recovery</button>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full text-sm font-bold"
                required
              />
            </div>

            {/* Doctor Secret Key — shown only for doctor role */}
            {role === 'doctor' && (
              <div className="space-y-1.5 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 bg-amber-400 rounded-full inline-flex items-center justify-center text-[8px]">🔑</span>
                    Doctor Secret Key
                    <span className="ml-1 bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">Required</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-[9px] font-bold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showSecret ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type={showSecret ? "text" : "password"}
                    value={doctorSecretKey}
                    onChange={(e) => setDoctorSecretKey(e.target.value)}
                    placeholder="Enter physician access key"
                    className="w-full text-sm font-bold pr-10 border-2 border-amber-200 focus:border-amber-400 rounded-xl"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 text-sm">🔐</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  This key is provided by your hospital administration. Contact your system admin if you don't have it.
                </p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full btn-primary text-base py-4 shadow-slate-200 mt-2 h-14"
            >
              {isLoggingIn ? 'Authenticating...' : `🔒 Secure Sign In`}
            </button>
          </form>

          <p className="mt-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Protected by Advanced 256-bit Encryption
          </p>
        </div>
        
      </div>
    </div>
  );
}
