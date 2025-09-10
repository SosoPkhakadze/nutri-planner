// src/components/meals/CopyMealModal.tsx
'use client';

import { useRef, useTransition, useState } from 'react';
import { copyMealToDate } from '@/app/actions/meals';
import { Copy, X } from 'lucide-react';
import PrimaryButton from '../ui/PrimaryButton';
import { useRouter } from 'next/navigation';

interface CopyMealModalProps {
  mealId: string;
  mealName: string;
}

export default function CopyMealModal({ mealId, mealName }: CopyMealModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const today = new Date();
  today.setDate(today.getDate() + 1); // Default to tomorrow
  const [targetDate, setTargetDate] = useState(today.toISOString().split('T')[0]);

  const handleAction = () => {
    startTransition(async () => {
      const result = await copyMealToDate(mealId, targetDate);
      if (result?.success) {
        dialogRef.current?.close();
        alert(`Meal successfully copied to ${targetDate}!`);
        router.refresh(); // Refresh to show potential changes if user is viewing target date
      } else {
        alert(result?.error || 'Failed to copy meal.');
      }
    });
  };

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); dialogRef.current?.showModal(); }}
        title="Copy meal to another date"
        className="p-1 rounded-md text-gray-400 hover:bg-slate-700 hover:text-white"
      >
        <Copy size={16} />
      </button>

      <dialog ref={dialogRef} onClick={(e) => e.stopPropagation()} className="bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-sm p-4 w-full max-w-md rounded-2xl">
        <div className="bg-slate-900/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl w-full border border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-transparent flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Copy Meal</h2>
              <p className="text-slate-400 mt-1 truncate">"{mealName}"</p>
            </div>
            <button onClick={() => dialogRef.current?.close()} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="p-6">
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
          <div className="p-6 bg-slate-900/70 border-t border-slate-700/50 flex justify-end gap-3">
            <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 rounded-xl text-slate-300 bg-slate-800/50 hover:bg-slate-800 transition-colors">Cancel</button>
            <PrimaryButton onClick={handleAction} disabled={isPending || !targetDate}>
              {isPending ? 'Copying...' : 'Copy Meal'}
            </PrimaryButton>
          </div>
        </div>
      </dialog>
    </>
  );
}