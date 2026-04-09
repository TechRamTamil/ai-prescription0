"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl">S</div>
            <span className="text-xl font-black tracking-tighter text-slate-900">SCRIPGUARD AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 font-bold text-slate-700 uppercase tracking-widest text-[10px]">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Digital Platform</a>
            <Link href="/doctor" className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all">
              Physician Portal
            </Link>
            <Link href="/patient" className="border-2 border-slate-900 text-slate-900 px-4 py-1.5 rounded-lg hover:bg-slate-50 transition-all">
              Patient Access
            </Link>
          </div>
          <div className="md:hidden flex gap-2">
            <Link href="/doctor" className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">Doctor</Link>
            <Link href="/patient" className="border border-slate-900 text-slate-900 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">Patient</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Public Access Enabled
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
              Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Prescription Understanding</span> With Drug Detection.
            </h1>
            <p className="text-lg text-slate-600 font-medium mb-10 max-w-xl">
              An AI-based system utilizing OCR to automate the extraction and analysis of prescription data for enhanced patient safety and efficiency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/doctor" className="btn-primary h-14 px-8 flex items-center justify-center text-lg shadow-emerald-200">
                Enter Doctor System
              </Link>
              <Link href="/patient" className="btn-secondary h-14 px-8 flex items-center justify-center text-lg bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50">
                Patient Dashboard
              </Link>
            </div>
          </div>
          <div className="relative">
             <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
               <Image 
                 src="/hero.png" 
                 alt="Medical AI Interface" 
                 width={800} 
                 height={600} 
                 className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
               />
             </div>
             {/* Decorative Blobs */}
             <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-[100px] -z-10"></div>
             <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-slate-400/20 rounded-full blur-[100px] -z-10"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-6">Designed for Modern Healthcare</h2>
            <p className="text-slate-600 font-medium">Our platform integrates seamlessly into your workflow, providing advanced tools to enhance patient care and operational efficiency.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Powered Prescriptions",
                desc: "Intelligent suggestions and drug-interaction checks powered by advanced clinical models.",
                icon: "⚡",
                color: "bg-emerald-100 text-emerald-600"
              },
              {
                title: "Real-time Tracking",
                desc: "Monitor medication adherence and patient outcomes with interactive dashboards and alerts.",
                icon: "📊",
                color: "bg-blue-100 text-blue-600"
              },
              {
                title: "Enterprise Security",
                desc: "HIPAA-compliant data protection with 256-bit encryption and robust architecture.",
                icon: "🛡️",
                color: "bg-slate-900 text-white"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group">
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-48 bg-slate-100 rounded-3xl"></div>
                <div className="h-64 bg-emerald-500 rounded-3xl flex items-end p-6">
                   <p className="text-white font-black text-2xl">99.9% <br/> Accuracy</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-64 bg-slate-900 rounded-3xl flex items-end p-6">
                   <p className="text-white font-black text-2xl">2k+ <br/> Hospitals</p>
                </div>
                <div className="h-48 bg-slate-100 rounded-3xl"></div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-4xl font-black text-slate-900 mb-8 leading-tight">Our mission is to bring intelligence to every clinical encounter.</h2>
            <div className="space-y-6">
              <p className="text-lg text-slate-600 font-medium">
                Scripguard AI was founded with a singular vision: to eliminate medication errors and automate prescription analysis through OCR and advanced artificial intelligence.
              </p>
              <p className="text-lg text-slate-600 font-medium">
                Our system demonstrates the potential of integrating AI in healthcare by providing intelligent recommendations, drug detection, and allergy-based suggestions.
              </p>
              <div className="pt-4 font-black flex items-center gap-6">
                <Link href="/doctor" className="text-slate-900 hover:text-emerald-600 transition-colors uppercase tracking-widest text-xs">Phyisician Access →</Link>
                <Link href="/patient" className="text-slate-900 hover:text-emerald-600 transition-colors uppercase tracking-widest text-xs">Patient Access →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-16 text-white">
        <div className="max-w-7xl mx-auto px-6 border-b border-slate-800 pb-12 grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 font-black text-xl">S</div>
              <span className="text-xl font-black tracking-tighter">SCRIPGUARD AI</span>
            </div>
            <p className="text-slate-400 font-medium max-w-sm">
              Smart Prescription Understanding with Drug Detection. Empowering healthcare with automated OCR extraction and intelligent insights.
            </p>
          </div>
          <div>
            <h4 className="font-black mb-6 uppercase tracking-widest text-xs text-slate-500">Platform</h4>
            <ul className="space-y-4 text-slate-400 font-bold text-sm">
              <li><Link href="/doctor" className="hover:text-white transition-colors">Physician Portal</Link></li>
              <li><Link href="/patient" className="hover:text-white transition-colors">Patient Portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black mb-6 uppercase tracking-widest text-xs text-slate-500">Legal</h4>
            <ul className="space-y-4 text-slate-400 font-bold text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">HIPAA Compliance</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
           <p>© 2026 Scripguard AI. All rights reserved.</p>
           <p>Engineered by Raman S, Thamizharasan D, Thejesh G.</p>
        </div>
      </footer>
    </div>
  );
}
