// src/components/meals/AddFoodToMealModal.tsx
'use client';

import { useState, useRef } from 'react';
// We need a server action to fetch search results
// We need a server action to add the food to the meal

interface FoodItem {
  id: string;
  name: string;
  brand: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_size: number;
  serving_unit: string;
}

interface AddFoodToMealModalProps {
  mealId: string;
  foodItems: FoodItem[]; // Pass the full list of available foods
}

export default function AddFoodToMealModal({ mealId, foodItems }: AddFoodToMealModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredItems = foodItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddFood = (foodId: string) => {
    // Here we will call a server action
    console.log(`Adding food ${foodId} to meal ${mealId}`);
    // After action, close the modal
    dialogRef.current?.close();
  };
  
  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className="w-full text-cyan-400 flex items-center justify-center gap-2 p-2 rounded-md hover:bg-slate-700 transition"
      >
        Add Food
      </button>
      
      <dialog ref={dialogRef} className="bg-slate-800 text-white p-0 rounded-lg shadow-xl backdrop:bg-black/50 w-full max-w-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Add Food to Meal</h2>
          <input
            type="text"
            placeholder="Search your food database..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-700 p-2 rounded-md mb-4"
          />
          <div className="max-h-80 overflow-y-auto">
            {filteredItems.length > 0 ? (
              <ul>
                {filteredItems.map(item => (
                  <li key={item.id} className="p-3 hover:bg-slate-700 rounded-md flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-400">{item.serving_size}{item.serving_unit} &bull; {item.calories} kcal</p>
                    </div>
                    <button onClick={() => handleAddFood(item.id)} className="px-3 py-1 bg-cyan-600 rounded-md text-sm">Add</button>
                  </li>
                ))}
              </ul>
            ) : <p className="text-center text-gray-500 py-4">No matching food found.</p>}
          </div>
        </div>
      </dialog>
    </>
  );
}