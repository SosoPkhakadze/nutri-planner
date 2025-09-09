// src/components/food-db/AddFoodItemModal.tsx
'use client';

import { useRef, useTransition } from 'react';
import { addFoodItem } from '@/app/actions/food';
import { PlusCircle } from 'lucide-react';
import PrimaryButton from '../ui/PrimaryButton';

export default function AddFoodItemModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      const result = await addFoodItem(formData);
      if (result?.success) {
        dialogRef.current?.close();
        formRef.current?.reset();
      } else {
        alert(result?.error || 'Failed to add food item.');
      }
    });
  };

  return (
    <>
      <PrimaryButton onClick={() => dialogRef.current?.showModal()}>
        <PlusCircle size={18} />
        Add New Food
      </PrimaryButton>
      
      <dialog ref={dialogRef} className="bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-sm p-0">
        <div className="bg-slate-900/95 backdrop-blur-xl text-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700/50">
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-transparent">
            <h2 className="text-2xl font-bold text-white">Add New Food Item</h2>
            <p className="text-slate-400 mt-1">Enter the nutritional information per 100g.</p>
          </div>
          
          <form ref={formRef} action={handleAction} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-400">Name</label>
                <input type="text" name="name" required className="mt-1 w-full bg-slate-800 border border-slate-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-slate-400">Brand (Optional)</label>
                <input type="text" name="brand" className="mt-1 w-full bg-slate-800 border border-slate-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label htmlFor="serving_unit" className="block text-sm font-medium text-slate-400">Serving Unit</label>
                <input type="text" name="serving_unit" required defaultValue="g" className="mt-1 w-full bg-slate-800 border border-slate-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
               <div>
                <label htmlFor="serving_size" className="block text-sm font-medium text-slate-400">Serving Size</label>
                <input type="number" step="0.1" name="serving_size" required defaultValue="100" className="mt-1 w-full bg-slate-800 border border-slate-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="calories" className="block text-sm font-medium text-slate-400">Calories</label>
                <input type="number" name="calories" required className="mt-1 w-full bg-slate-800 border border-slate-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label htmlFor="protein_g" className="block text-sm font-medium text-slate-400">Protein (g)</label>
                <input type="number" step="0.1" name="protein_g" required className="mt-1 w-full bg-slate-800 border border-slate-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label htmlFor="carbs_g" className="block text-sm font-medium text-slate-400">Carbs (g)</label>
                <input type="number" step="0.1" name="carbs_g" required className="mt-1 w-full bg-slate-800 border border-slate-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label htmlFor="fat_g" className="block text-sm font-medium text-slate-400">Fat (g)</label>
                <input type="number" step="0.1" name="fat_g" required className="mt-1 w-full bg-slate-800 border border-slate-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
            </div>
            
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-slate-400">Tags (comma-separated)</label>
              <input type="text" name="tags" placeholder="e.g. cutting, high-protein, snack" className="mt-1 w-full bg-slate-800 border border-slate-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            
            <div className="pt-6 flex justify-end gap-3">
              <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors">Cancel</button>
              <PrimaryButton type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Food Item'}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}