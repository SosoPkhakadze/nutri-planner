// src/components/food-db/EditFoodItemModal.tsx
'use client';

import { useRef, useTransition, ReactNode } from 'react';
import { updateFoodItem, resetFoodItem } from '@/app/actions/food';
import { RotateCcw, X } from 'lucide-react';
import PrimaryButton from '../ui/PrimaryButton';

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

  const handleReset = () => {
    if (confirm("Are you sure? This will revert all changes back to the original verified food item's values.")) {
      startTransition(async () => {
        const result = await resetFoodItem(foodItem.id);
        if (result.success) {
          dialogRef.current?.close();
        } else {
          alert(result.error || 'Failed to reset item.');
        }
      });
    }
  };

  return (
    <>
      <div onClick={() => dialogRef.current?.showModal()} className="cursor-pointer">
        {children}
      </div>
      
      <dialog ref={dialogRef} className="bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-sm p-4 w-full max-w-lg rounded-2xl">
        <div className="bg-slate-900/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl w-full border border-slate-700/50 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-transparent flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Edit Food Item</h2>
              <p className="text-slate-400 mt-1 truncate">"{foodItem.name}"</p>
            </div>
            <button onClick={() => dialogRef.current?.close()} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
              <X size={20} />
            </button>
          </div>

          <form ref={formRef} action={handleAction}>
            <div className="p-6 space-y-4">
              {foodItem.base_food_item_id && (
                <div className="flex justify-end">
                  <button type="button" onClick={handleReset} disabled={isPending} className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 disabled:opacity-50">
                    <RotateCcw size={14} /> {isPending ? 'Resetting...' : 'Reset to Original'}
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div><label htmlFor="name" className="block text-sm font-medium mb-1">Name</label><input type="text" name="name" required defaultValue={foodItem.name} className="mt-1 w-full bg-slate-800 border border-slate-700 p-2 rounded-md" /></div>
                <div><label htmlFor="brand" className="block text-sm font-medium mb-1">Brand (Optional)</label><input type="text" name="brand" defaultValue={foodItem.brand || ''} className="mt-1 w-full bg-slate-800 border border-slate-700 p-2 rounded-md" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label htmlFor="serving_size" className="block text-sm font-medium mb-1">Serving Size</label><input type="number" step="0.1" name="serving_size" required defaultValue={foodItem.serving_size} className="mt-1 w-full bg-slate-800 border border-slate-700 p-2 rounded-md" /></div>
                <div><label htmlFor="serving_unit" className="block text-sm font-medium mb-1">Serving Unit</label><input type="text" name="serving_unit" required defaultValue={foodItem.serving_unit} className="mt-1 w-full bg-slate-800 border border-slate-700 p-2 rounded-md" /></div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div><label htmlFor="calories" className="block text-sm font-medium mb-1">Calories</label><input type="number" name="calories" required defaultValue={foodItem.calories} className="mt-1 w-full bg-slate-800 border border-slate-700 p-2 rounded-md" /></div>
                <div><label htmlFor="protein_g" className="block text-sm font-medium mb-1">Protein (g)</label><input type="number" step="0.1" name="protein_g" required defaultValue={foodItem.protein_g} className="mt-1 w-full bg-slate-800 border border-slate-700 p-2 rounded-md" /></div>
                <div><label htmlFor="carbs_g" className="block text-sm font-medium mb-1">Carbs (g)</label><input type="number" step="0.1" name="carbs_g" required defaultValue={foodItem.carbs_g} className="mt-1 w-full bg-slate-800 border border-slate-700 p-2 rounded-md" /></div>
                <div><label htmlFor="fat_g" className="block text-sm font-medium mb-1">Fat (g)</label><input type="number" step="0.1" name="fat_g" required defaultValue={foodItem.fat_g} className="mt-1 w-full bg-slate-800 border border-slate-700 p-2 rounded-md" /></div>
              </div>
              <div>
                <label htmlFor="tags" className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <input type="text" name="tags" placeholder="e.g. cutting, high-protein, snack" defaultValue={foodItem.tags?.join(', ') || ''} className="mt-1 w-full bg-slate-800 border border-slate-700 p-2 rounded-md" />
              </div>
            </div>
            
            <div className="p-6 bg-slate-900/70 border-t border-slate-700/50 flex justify-end gap-3">
              <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 rounded-xl text-slate-300 bg-slate-800/50 hover:bg-slate-800 transition-colors">Cancel</button>
              <PrimaryButton type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}