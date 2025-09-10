// src/components/progress/WeightChart.tsx
'use client';

import { type WeightLog } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WeightChartProps {
  data: WeightLog[];
}

export default function WeightChart({ data }: WeightChartProps) {
  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <p>Log at least two weight entries to see your progress chart.</p>
      </div>
    );
  }

  const formattedData = data.map(log => ({
    date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: parseFloat(String(log.weight_kg)),
  }));

  const weightDomain = [
    Math.floor(Math.min(...formattedData.map(d => d.weight)) - 2),
    Math.ceil(Math.max(...formattedData.map(d => d.weight)) + 2),
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={formattedData}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={weightDomain} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            borderColor: 'rgba(100, 116, 139, 0.2)',
            borderRadius: '0.75rem'
          }}
          labelStyle={{ color: '#cbd5e1' }}
          itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
        />
        <Legend wrapperStyle={{ fontSize: '14px' }} />
        <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#22d3ee" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}