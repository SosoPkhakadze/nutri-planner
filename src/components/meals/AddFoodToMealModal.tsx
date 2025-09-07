// src/components/meals/AddFoodToMealModal.tsx
'use client';

import { useState, useRef, useTransition } from 'react';
import { addFoodToMeal } from '@/app/actions/meals';

// Define a more specific type for our food items
interface FoodItem {
  id: string;
  name: string;
  brand?: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_size: number;
  serving_unit: string;
}

interface AddFoodToMealModalProps {
  mealId: string;
  foodItems: FoodItem[];
}

export default function AddFoodToMealModal({ mealId, foodItems }: AddFoodToMealModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [weight, setWeight] = useState(100); // Default to 100g

  const filteredItems = searchTerm ? foodItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setSearchTerm(food.name); // Put the name in the search bar
  };

  const handleAddFood = () => {
    if (!selectedFood) return;

    startTransition(async () => {
      const result = await addFoodToMeal(mealId, selectedFood.id, weight);
      if (result?.success) {
        handleClose();
      } else {
        alert(result?.error || "Failed to add food.");
      }
    });
  };
  
  const handleClose = () => {
    dialogRef.current?.close();
    // Reset state on close
    setSearchTerm('');
    setSelectedFood(null);
    setWeight(100);
  };

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className="w-full text-cyan-400 flex items-center justify-center gap-2 p-2 rounded-md hover:bg-slate-700 transition"
      >
        Add Food
      </button>
      
      <dialog ref={dialogRef} onClose={handleClose} className="bg-slate-800 text-white p-0 rounded-lg shadow-xl backdrop:bg-black/50 w-full max-w-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Add Food to Meal</h2>
          
          {selectedFood ? (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-slate-700 rounded-md">
                <p className="font-bold text-lg">{selectedFood.name}</p>
                <p className="text-sm text-gray-400">Per 100g: {selectedFood.calories} kcal, {selectedFood.protein_g}g Protein</p>
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium">Weight (g)</label>
                <input
                  type="number"
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value))}
                  step="1"
                  min="1"
                  className="mt-1 w-full bg-slate-900 p-2 rounded-md"
                />
              </div>
              <div className="flex justify-between items-center pt-4">
                <button onClick={() => setSelectedFood(null)} className="text-sm text-cyan-400 hover:underline">
                  &larr; Back to search
                </button>
                <div className="flex gap-4">
                  <button type="button" onClick={handleClose} className="px-4 py-2 rounded-md text-gray-300 hover:bg-slate-700">Cancel</button>
                  <button onClick={handleAddFood} disabled={isPending} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 font-semibold rounded-md">
                    {isPending ? "Adding..." : "Add to Meal"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <input
                type="text"
                placeholder="Search your food database..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700 p-2 rounded-md mb-4"
              />
              <div className="max-h-60 overflow-y-auto">
                {filteredItems.length > 0 ? (
                  <ul>
                    {filteredItems.map(item => (
                      <li key={item.id} onClick={() => handleSelectFood(item)} className="p-3 hover:bg-slate-700 rounded-md cursor-pointer">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-400">{item.serving_size}{item.serving_unit} &bull; {item.calories} kcal</p>
                      </li>
                    ))}
                  </ul>
                ) : searchTerm && <p className="text-center text-gray-500 py-4">No matching food found.</p>}
              </div>
              <div className="flex justify-end pt-4">
                <button type="button" onClick={handleClose} className="px-4 py-2 rounded-md text-gray-300 hover:bg-slate-700">Close</button>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}