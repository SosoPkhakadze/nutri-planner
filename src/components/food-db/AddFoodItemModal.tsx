// src/components/food-db/AddFoodItemModal.tsx
'use client';

import { useRef, useTransition } from 'react';
import { addFoodItem } from '@/app/actions/food'; // We'll create this action
import { PlusCircle } from 'lucide-react';

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
      <button
        onClick={() => dialogRef.current?.showModal()}
        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition flex items-center gap-2"
      >
        <PlusCircle size={18} />
        Add New Food
      </button>
      
      <dialog ref={dialogRef} className="bg-slate-800 text-white p-0 rounded-lg shadow-xl backdrop:bg-black/50 w-full max-w-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Add a New Food Item</h2>
            <button onClick={() => dialogRef.current?.close()} className="text-gray-400 hover:text-white">&times;</button>
          </div>

          <form ref={formRef} action={handleAction} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">Name</label>
                <input type="text" name="name" required className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
              </div>
              <div>
                <label htmlFor="brand" className="block text-sm font-medium">Brand (Optional)</label>
                <input type="text" name="brand" className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
              </div>
            </div>

            {/* Serving Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="serving_size" className="block text-sm font-medium">Serving Size</label>
                <input type="number" step="0.1" name="serving_size" required className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
              </div>
              <div>
                <label htmlFor="serving_unit" className="block text-sm font-medium">Serving Unit</label>
                <input type="text" name="serving_unit" required placeholder="g, ml, piece" className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
              </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="calories" className="block text-sm font-medium">Calories</label>
                <input type="number" name="calories" required className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
              </div>
              <div>
                <label htmlFor="protein_g" className="block text-sm font-medium">Protein (g)</label>
                <input type="number" step="0.1" name="protein_g" required className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
              </div>
              <div>
                <label htmlFor="carbs_g" className="block text-sm font-medium">Carbs (g)</label>
                <input type="number" step="0.1" name="carbs_g" required className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
              </div>
              <div>
                <label htmlFor="fat_g" className="block text-sm font-medium">Fat (g)</label>
                <input type="number" step="0.1" name="fat_g" required className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
              </div>
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 rounded-md text-gray-300 hover:bg-slate-700">Cancel</button>
              <button type="submit" disabled={isPending} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 font-semibold rounded-md">
                {isPending ? 'Saving...' : 'Save Food Item'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}