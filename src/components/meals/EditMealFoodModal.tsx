// src/components/meals/EditMealFoodModal.tsx
'use client';

import { useState, useRef, useTransition, ReactNode } from 'react';
import { updateMealFoodWeight } from '@/app/actions/meals';
import PrimaryButton from '../ui/PrimaryButton';
import { X } from 'lucide-react';

interface EditMealFoodModalProps {
  mealFood: any; // The specific meal_food entry, including food_items details
  children: ReactNode; // The content that will trigger the modal
}

export default function EditMealFoodModal({ mealFood, children }: EditMealFoodModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const [weight, setWeight] = useState(mealFood.weight_g);

  const handleUpdate = () => {
    startTransition(async () => {
      const result = await updateMealFoodWeight(mealFood.id, weight);
      if (result?.success) {
        dialogRef.current?.close();
      } else {
        alert(result?.error || "Failed to update item.");
      }
    });
  };

  return (
    <>
      <div onClick={() => dialogRef.current?.showModal()} className="w-full">
        {children}
      </div>
      
      <dialog ref={dialogRef} className="bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-sm p-4 w-full max-w-sm rounded-2xl">
        <div className="bg-slate-900/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl w-full border border-slate-700/50 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-transparent flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Edit Item</h2>
            <button onClick={() => dialogRef.current?.close()} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <p className="font-bold text-lg text-white truncate">{mealFood.food_items.name}</p>
              <p className="text-sm text-slate-400">Per 100g: {mealFood.food_items.calories} kcal</p>
            </div>
            <div>
              <label htmlFor={`weight-${mealFood.id}`} className="block text-sm font-medium text-slate-400 mb-1">Weight (g)</label>
              <input
                type="number"
                id={`weight-${mealFood.id}`}
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value))}
                step="1"
                min="1"
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded-md"
              />
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 bg-slate-900/70 border-t border-slate-700/50 flex justify-end gap-3">
            <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 rounded-xl text-slate-300 bg-slate-800/50 hover:bg-slate-800 transition-colors">Cancel</button>
            <PrimaryButton onClick={handleUpdate} disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </PrimaryButton>
          </div>
        </div>
      </dialog>
    </>
  );
}