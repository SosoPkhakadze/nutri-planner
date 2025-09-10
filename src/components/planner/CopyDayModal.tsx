// src/components/planner/CopyDayModal.tsx
'use client';

import { useRef, useTransition, useState, ReactNode } from 'react';
import { copyDayToDate } from '@/app/actions/meals';
import { X, Copy } from 'lucide-react';
import PrimaryButton from '../ui/PrimaryButton';
import { useRouter } from 'next/navigation';

interface CopyDayModalProps {
  sourceDate: string; // YYYY-MM-DD
  hasMeals: boolean;
  children: ReactNode;
}

export default function CopyDayModal({ sourceDate, hasMeals, children }: CopyDayModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const tomorrow = new Date(sourceDate);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const [targetDate, setTargetDate] = useState(tomorrow.toISOString().split('T')[0]);

  const handleAction = () => {
    startTransition(async () => {
      const result = await copyDayToDate(sourceDate, targetDate);
      if (result?.success) {
        dialogRef.current?.close();
        alert(`Day plan successfully copied to ${targetDate}!`);
        router.push(`/?date=${targetDate}`); // Navigate to the new day
      } else {
        alert(result?.error || 'Failed to copy day.');
      }
    });
  };

  return (
    <>
      <div onClick={() => hasMeals && dialogRef.current?.showModal()} className={hasMeals ? 'cursor-pointer' : 'cursor-not-allowed'}>
        {children}
      </div>

      <dialog ref={dialogRef} className="bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-sm p-4 w-full max-w-md rounded-2xl">
        <div className="bg-slate-900/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl w-full border border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-transparent flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Copy Day Plan</h2>
              <p className="text-slate-400 mt-1">Copy all meals from {sourceDate}.</p>
            </div>
            <button onClick={() => dialogRef.current?.close()} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="targetDate" className="block text-sm font-medium text-slate-400 mb-1">Copy to Date</label>
              <input
                type="date"
                id="targetDate"
                name="targetDate"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded-md"
              />
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-amber-300/80 text-sm">
                    <strong>Note:</strong> This will overwrite any existing meals on the selected date.
                </p>
            </div>
          </div>
          
          <div className="p-6 bg-slate-900/70 border-t border-slate-700/50 flex justify-end gap-3">
            <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 rounded-xl text-slate-300 bg-slate-800/50 hover:bg-slate-800 transition-colors">Cancel</button>
            <PrimaryButton onClick={handleAction} disabled={isPending || !targetDate || targetDate === sourceDate}>
              {isPending ? 'Copying...' : 'Copy Day'}
            </PrimaryButton>
          </div>
        </div>
      </dialog>
    </>
  );
}