"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface HealthChartsProps {
  data: any[];
  type: 'BP' | 'Weight' | 'Sugar' | 'HeartRate';
  color: string;
  title: string;
}

export default function HealthChart({ data, type, color, title }: HealthChartsProps) {
  const filteredData = data
    .filter(d => d.type === type)
    .map(d => ({
      name: new Date(d.timestamp).toLocaleDateString(),
      value: d.value
    }));

  if (filteredData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No {title} Data Available</p>
      </div>
    );
  }

  return (
    <div className="enterprise-card p-6 border-t-4" style={{ borderColor: color }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{title}</h4>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Historical Trends</p>
        </div>
        <span className="text-xs font-black" style={{ color }}>
          {filteredData[filteredData.length - 1].value} {type === 'BP' ? 'mmHg' : type === 'Weight' ? 'kg' : type === 'Sugar' ? 'mg/dL' : 'bpm'}
        </span>
      </div>
      
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id={`color-${type}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
            />
            <YAxis 
                hide 
                domain={['auto', 'auto']}
            />
            <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
            />
            <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={3}
                fillOpacity={1} 
                fill={`url(#color-${type})`} 
                animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
