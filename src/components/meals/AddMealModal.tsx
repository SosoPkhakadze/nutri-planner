// src/components/meals/AddMealModal.tsx
'use client';

import { useRef, useTransition, ReactNode } from 'react';
import { addMeal } from '@/app/actions/meals';
import { X } from 'lucide-react';
import PrimaryButton from '../ui/PrimaryButton';

interface AddMealModalProps {
  date: string; // YYYY-MM-DD
  children: ReactNode; // Accept children to act as the trigger
}

export default function AddMealModal({ date, children }: AddMealModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleAddMeal = (formData: FormData) => {
    formData.append('date', date); // Add the date to the form data
    startTransition(async () => {
      const result = await addMeal(formData);
      if (result?.success) {
        dialogRef.current?.close();
        formRef.current?.reset();
      } else {
        alert(result?.error || 'Failed to add meal.');
      }
    });
  };

  return (
    <>
      <div onClick={() => dialogRef.current?.showModal()} className="cursor-pointer">
        {children}
      </div>

      <dialog ref={dialogRef} className="bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-sm p-4 w-full max-w-md rounded-2xl">
        <div className="bg-slate-900/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl w-full border border-slate-700/50 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-transparent flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Add a New Meal</h2>
              <p className="text-slate-400 mt-1">Plan your next meal for the day.</p>
            </div>
            <button onClick={() => dialogRef.current?.close()} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
              <X size={20} />
            </button>
          </div>

          <form ref={formRef} action={handleAddMeal}>
            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="mealName" className="block text-sm font-medium text-slate-400 mb-1">Meal Name</label>
                <input
                  type="text"
                  id="mealName"
                  name="mealName"
                  required
                  className="w-full bg-slate-800 border border-slate-700 p-2 rounded-md shadow-sm focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., Breakfast, Post-Workout Shake"
                />
              </div>
              <div>
                <label htmlFor="mealTime" className="block text-sm font-medium text-slate-400 mb-1">Time</label>
                <input
                  type="time"
                  id="mealTime"
                  name="mealTime"
                  required
                  defaultValue="08:00"
                  className="w-full bg-slate-800 border border-slate-700 p-2 rounded-md shadow-sm focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-900/70 border-t border-slate-700/50 flex justify-end gap-3">
              <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 rounded-xl text-slate-300 bg-slate-800/50 hover:bg-slate-800 transition-colors">Cancel</button>
              <PrimaryButton type="submit" disabled={isPending}>
                {isPending ? 'Adding...' : 'Add Meal'}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}