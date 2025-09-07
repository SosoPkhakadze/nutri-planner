// src/components/meals/AddMealModal.tsx
'use client';

import { useRef, useTransition } from 'react';
import { addMeal } from '@/app/actions/meals';
import { PlusCircle } from 'lucide-react';

export default function AddMealModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleAddMeal = (formData: FormData) => {
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
      <button
        onClick={() => dialogRef.current?.showModal()}
        className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition flex items-center gap-2"
      >
        <PlusCircle size={18} />
        Add Your First Meal
      </button>

      <dialog ref={dialogRef} className="bg-slate-800 text-white p-0 rounded-lg shadow-xl backdrop:bg-black/50 w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Add a New Meal</h2>
            <button onClick={() => dialogRef.current?.close()} className="text-gray-400 hover:text-white">&times;</button>
          </div>
          
          <form ref={formRef} action={handleAddMeal} className="space-y-4">
            <div>
              <label htmlFor="mealName" className="block text-sm font-medium text-gray-300">Meal Name</label>
              <input
                type="text"
                id="mealName"
                name="mealName"
                required
                className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2"
                placeholder="e.g., Breakfast, Post-Workout Shake"
              />
            </div>
            <div>
              <label htmlFor="mealTime" className="block text-sm font-medium text-gray-300">Time</label>
              <input
                type="time"
                id="mealTime"
                name="mealTime"
                required
                className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2"
              />
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 rounded-md text-gray-300 hover:bg-slate-700">Cancel</button>
              <button type="submit" disabled={isPending} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition disabled:bg-slate-600">
                {isPending ? 'Adding...' : 'Add Meal'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}