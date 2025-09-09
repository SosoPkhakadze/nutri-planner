// src/components/meals/AddFoodToMealModal.tsx
'use client';

import { useState, useRef, useTransition } from 'react';
import { addFoodToMeal } from '@/app/actions/meals';
import PrimaryButton from '../ui/PrimaryButton';
import { X } from 'lucide-react';

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
  const [weight, setWeight] = useState(100);

  const filteredItems = searchTerm ? foodItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setSearchTerm(food.name);
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
    setTimeout(() => {
      setSearchTerm('');
      setSelectedFood(null);
      setWeight(100);
    }, 200); // delay reset to prevent jarring UI shift
  };

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className="w-full text-cyan-400 flex items-center justify-center gap-2 p-2 rounded-md hover:bg-slate-700 transition"
      >
        Add Food
      </button>
      
      <dialog ref={dialogRef} onClose={handleClose} className="bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-sm p-4 w-full max-w-lg rounded-2xl">
        <div className="bg-slate-900/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl w-full border border-slate-700/50 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-transparent flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Add Food to Meal</h2>
            <button onClick={handleClose} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6">
            {selectedFood ? (
              <div className="space-y-6 animate-fade-in">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <p className="font-bold text-lg text-white">{selectedFood.name}</p>
                  <p className="text-sm text-slate-400">Per 100g: {selectedFood.calories} kcal, {selectedFood.protein_g}g Protein</p>
                </div>
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-slate-400 mb-1">Weight (g)</label>
                  <input
                    type="number"
                    id="weight"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value))}
                    step="1"
                    min="1"
                    className="w-full bg-slate-800 border border-slate-700 p-2 rounded-md"
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <button onClick={() => setSelectedFood(null)} className="text-sm text-cyan-400 hover:underline">
                    &larr; Back to search
                  </button>
                  <div className="flex gap-3">
                    <button type="button" onClick={handleClose} className="px-4 py-2 rounded-xl text-slate-300 bg-slate-800/50 hover:bg-slate-800 transition-colors">Cancel</button>
                    <PrimaryButton onClick={handleAddFood} disabled={isPending}>
                      {isPending ? "Adding..." : "Add to Meal"}
                    </PrimaryButton>
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
                  className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl mb-4 focus:ring-2 focus:ring-cyan-500"
                />
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {filteredItems.length > 0 ? (
                    filteredItems.slice(0, 50).map(item => (
                      <div key={item.id} onClick={() => handleSelectFood(item)} className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors border border-slate-700/50">
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-sm text-slate-400">{item.serving_size}{item.serving_unit} &bull; {item.calories} kcal</p>
                      </div>
                    ))
                  ) : searchTerm && <p className="text-center text-slate-500 py-8">No matching food found.</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}