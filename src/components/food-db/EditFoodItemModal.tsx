// src/components/food-db/EditFoodItemModal.tsx
'use client';

import { useRef, useTransition, ReactNode } from 'react';
import { updateFoodItem } from '@/app/actions/food';

interface EditFoodItemModalProps {
  foodItem: any;
  children: ReactNode;
}

export default function EditFoodItemModal({ foodItem, children }: EditFoodItemModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateFoodItem(foodItem.id, formData);
      if (result?.success) {
        dialogRef.current?.close();
      } else {
        alert(result?.error || 'Failed to update food item.');
      }
    });
  };

  return (
    <>
      {/* The trigger is a button that opens the dialog */}
      <button onClick={() => dialogRef.current?.showModal()} className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-slate-700">
        {children}
      </button>
      
      <dialog ref={dialogRef} className="bg-slate-800 text-white p-0 rounded-lg shadow-xl backdrop:bg-black/50 w-full max-w-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Edit "{foodItem.name}"</h2>
            <button onClick={() => dialogRef.current?.close()} className="text-gray-400 hover:text-white">&times;</button>
          </div>

          <form ref={formRef} action={handleAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">Name</label>
                <input type="text" name="name" required defaultValue={foodItem.name} className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
              </div>
              <div>
                <label htmlFor="brand" className="block text-sm font-medium">Brand (Optional)</label>
                <input type="text" name="brand" defaultValue={foodItem.brand || ''} className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="serving_size" className="block text-sm font-medium">Serving Size (per 100g)</label>
                <input type="number" step="0.1" name="serving_size" required defaultValue={foodItem.serving_size} className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
              </div>
              <div>
                <label htmlFor="serving_unit" className="block text-sm font-medium">Serving Unit</label>
                <input type="text" name="serving_unit" required defaultValue={foodItem.serving_unit} className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-2 lg-grid-cols-4 gap-4">
              <div><label htmlFor="calories" className="block text-sm font-medium">Calories</label><input type="number" name="calories" required defaultValue={foodItem.calories} className="mt-1 w-full bg-slate-700 p-2 rounded-md" /></div>
              <div><label htmlFor="protein_g" className="block text-sm font-medium">Protein (g)</label><input type="number" step="0.1" name="protein_g" required defaultValue={foodItem.protein_g} className="mt-1 w-full bg-slate-700 p-2 rounded-md" /></div>
              <div><label htmlFor="carbs_g" className="block text-sm font-medium">Carbs (g)</label><input type="number" step="0.1" name="carbs_g" required defaultValue={foodItem.carbs_g} className="mt-1 w-full bg-slate-700 p-2 rounded-md" /></div>
              <div><label htmlFor="fat_g" className="block text-sm font-medium">Fat (g)</label><input type="number" step="0.1" name="fat_g" required defaultValue={foodItem.fat_g} className="mt-1 w-full bg-slate-700 p-2 rounded-md" /></div>
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium">Tags (comma-separated)</label>
              <input type="text" name="tags" placeholder="e.g. cutting, high-protein, snack" defaultValue={foodItem.tags?.join(', ') || ''} className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 rounded-md text-gray-300 hover:bg-slate-700">Cancel</button>
              <button type="submit" disabled={isPending} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 font-semibold rounded-md">
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}