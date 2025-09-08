// src/components/templates/TemplateCard.tsx
'use client';

import { useState, useRef, useTransition } from 'react';
import Card from "@/components/ui/Card";
import { CalendarDays, Utensils } from "lucide-react";
import { applyTemplateToDate } from '@/app/actions/templates';
import { useRouter } from 'next/navigation';

export default function TemplateCard({ template }: { template: any }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const today = new Date().toISOString().split('T')[0];
  const [applyDate, setApplyDate] = useState(today);
  const isDayTemplate = template.type === 'day';

  const handleApply = () => {
    startTransition(async () => {
      const result = await applyTemplateToDate(template.id, applyDate);
      if (result?.success) {
        dialogRef.current?.close();
        router.push(`/planner?week=${applyDate}`);
        router.refresh(); // Force a refresh to show new data
      } else {
        alert(result?.error || 'Failed to apply template.');
      }
    });
  };

  return (
    <>
      <Card className="p-6 flex flex-col justify-between hover:border-cyan-500 transition-colors">
        <div>
          <div className={`inline-flex items-center gap-2 text-xs font-bold px-2 py-1 rounded-full mb-3 ${isDayTemplate ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'}`}>
            {isDayTemplate ? <CalendarDays size={14} /> : <Utensils size={14} />}
            <span className="capitalize">{template.type} Template</span>
          </div>
          <h3 className="text-xl font-bold mb-2">{template.title}</h3>
        </div>
        <button
          onClick={() => dialogRef.current?.showModal()}
          className="mt-4 w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition"
        >
          Apply Template
        </button>
      </Card>

      <dialog ref={dialogRef} className="bg-slate-800 text-white p-0 rounded-lg shadow-xl backdrop:bg-black/50 w-full max-w-sm">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Apply "{template.title}"</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="applyDate" className="block text-sm font-medium text-gray-300">
                Select a date to apply this template to:
              </label>
              <input
                type="date"
                id="applyDate"
                value={applyDate}
                onChange={(e) => setApplyDate(e.target.value)}
                className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2"
              />
            </div>
            <p className="text-xs text-gray-400">
              Warning: This will overwrite any existing meals on the selected date.
            </p>
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 rounded-md text-gray-300 hover:bg-slate-700">Cancel</button>
              <button onClick={handleApply} disabled={isPending} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 font-semibold rounded-md">
                {isPending ? 'Applying...' : 'Apply to Date'}
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}