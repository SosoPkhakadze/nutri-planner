// src/app/progress/ProgressClientPage.tsx
'use client';

import { useState, useTransition } from 'react';
import { addWeightLog, deleteWeightLog } from '../actions/progress';
import { type WeightLog } from '@/lib/types';
import { GlassCard } from '@/components/ui/Card';
import PrimaryButton from '@/components/ui/PrimaryButton';
import RemoveButton from '@/components/ui/RemoveButton';
import WeightChart from '@/components/progress/WeightChart';
// FIX: Alias the imported icon to avoid naming conflicts with the chart component
import { LineChart as LineChartIcon, PlusCircle, CalendarDays } from 'lucide-react';

interface ProgressClientPageProps {
  initialLogs: WeightLog[];
  initialWeight: number;
}

export default function ProgressClientPage({ initialLogs, initialWeight }: ProgressClientPageProps) {
  const [logs, setLogs] = useState<WeightLog[]>(initialLogs);
  const [isPending, startTransition] = useTransition();

  const handleAddLog = (formData: FormData) => {
    startTransition(async () => {
      const result = await addWeightLog(formData);
      if (result.success && result.data) {
        setLogs(prevLogs => {
          const existingIndex = prevLogs.findIndex(log => log.date === result.data.date);
          if (existingIndex > -1) {
            const newLogs = [...prevLogs];
            newLogs[existingIndex] = result.data;
            return newLogs;
          }
          return [...prevLogs, result.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        });
        document.getElementById('weight-log-form')?.closest('form')?.reset();
      } else {
        alert(result.error);
      }
    });
  };

  const handleDeleteLog = (logId: string) => {
    startTransition(async () => {
      setLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
      const result = await deleteWeightLog(logId);
      if (result.error) {
        alert(result.error);
        setLogs(initialLogs); // Revert on error
      }
    });
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Your Progress
        </h1>
        <p className="text-slate-400 mt-1">Log your weight and visualize your journey.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassCard className="p-6 h-full">
            {/* FIX: Use the aliased icon name here */}
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><LineChartIcon /> Weight Trend</h2>
            <div className="h-96">
              <WeightChart data={logs} />
            </div>
          </GlassCard>
        </div>

        <div className="space-y-8">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><PlusCircle /> Log Your Weight</h2>
            <form action={handleAddLog} id="weight-log-form">
              <div className="space-y-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-slate-400 mb-1">Date</label>
                  <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-800 border border-slate-700 p-2 rounded-md" />
                </div>
                <div>
                  <label htmlFor="weight_kg" className="block text-sm font-medium text-slate-400 mb-1">Weight (kg)</label>
                  <input type="number" step="0.1" name="weight_kg" placeholder={initialWeight > 0 ? String(initialWeight) : 'e.g., 75.5'} required className="w-full bg-slate-800 border border-slate-700 p-2 rounded-md" />
                </div>
                <PrimaryButton type="submit" disabled={isPending} className="w-full">
                  {isPending ? 'Saving...' : 'Save Entry'}
                </PrimaryButton>
              </div>
            </form>
          </GlassCard>
          
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><CalendarDays /> Recent Entries</h2>
            <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
              {logs.length > 0 ? (
                [...logs].reverse().map(log => (
                  <div key={log.id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="font-semibold">{log.weight_kg} kg</p>
                      <p className="text-sm text-slate-400">{new Date(log.date).toLocaleDateString('en-CA')}</p>
                    </div>
                    <RemoveButton action={() => handleDeleteLog(log.id)} itemDescription="this weight entry" />
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-8">No weight entries yet.</p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  );
}