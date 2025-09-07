// src/components/meals/EditMealFoodModal.tsx
'use client';

import { useState, useRef, useTransition, ReactNode } from 'react';
import { updateMealFoodWeight } from '@/app/actions/meals'; // We will create this action

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
      
      <dialog ref={dialogRef} className="bg-slate-800 text-white p-0 rounded-lg shadow-xl backdrop:bg-black/50 w-full max-w-sm">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Edit Food Item</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-700 rounded-md">
              <p className="font-bold text-lg">{mealFood.food_items.name}</p>
              <p className="text-sm text-gray-400">Per 100g: {mealFood.food_items.calories} kcal</p>
            </div>
            <div>
              <label htmlFor={`weight-${mealFood.id}`} className="block text-sm font-medium">Weight (g)</label>
              <input
                type="number"
                id={`weight-${mealFood.id}`}
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value))}
                step="1"
                min="1"
                className="mt-1 w-full bg-slate-900 p-2 rounded-md"
              />
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 rounded-md text-gray-300 hover:bg-slate-700">Cancel</button>
              <button onClick={handleUpdate} disabled={isPending} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 font-semibold rounded-md">
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}