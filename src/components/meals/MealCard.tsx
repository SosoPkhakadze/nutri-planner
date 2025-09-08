// src/components/meals/MealCard.tsx
'use client';

import { useState, useMemo } from 'react';
import { deleteMeal, removeFoodFromMeal } from "@/app/actions/meals";
import AddFoodToMealModal from "./AddFoodToMealModal";
import EditMealFoodModal from "./EditMealFoodModal";
import SaveMealAsTemplateModal from "../templates/SaveMealAsTemplateModal";
import MealStatusToggleButton from './MealStatusToggleButton';
import RemoveButton from "../ui/RemoveButton";
import { DraggableMealFoodItem } from './DraggableMealFoodItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Clock, Pencil, AlertTriangle, ChevronDown } from 'lucide-react';
import type { Meal, FoodItem, MealFood } from '@/lib/types';

interface MealCardProps {
  meal: Meal;
  foodItems: FoodItem[];
}

export default function MealCard({ meal, foodItems }: MealCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  const displayTime = meal.time ? new Date(`1970-01-01T${meal.time}Z`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }) : '';

  const mealTotals = useMemo(() => {
    return meal.meal_foods.reduce((acc, mf) => {
      if (mf.food_items) {
        const multiplier = mf.weight_g / 100;
        acc.calories += Math.round(mf.food_items.calories * multiplier);
        acc.protein += mf.food_items.protein_g * multiplier;
      }
      return acc;
    }, { calories: 0, protein: 0 });
  }, [meal.meal_foods]);

  const renderFoodItemRow = (mf: MealFood) => {
    if (!mf.food_items) {
      return (
        <div className="text-sm flex justify-between items-center group w-full p-2 bg-brand-amber/10 rounded-md">
          <div className="flex items-center gap-2 text-brand-amber">
            <AlertTriangle size={14} />
            <span className="font-medium italic">[Deleted Food Item]</span>
          </div>
          <div className="pl-2">
            <RemoveButton action={() => removeFoodFromMeal(mf.id)} itemDescription="this deleted item entry" />
          </div>
        </div>
      );
    }
    const multiplier = mf.weight_g / 100;
    const calories = Math.round(mf.food_items.calories * multiplier);
    const protein = (mf.food_items.protein_g * multiplier).toFixed(1);

    return (
      <div className="text-sm flex justify-between items-center group w-full py-2 pl-1 pr-2 rounded-md hover:bg-slate-700/50 transition-colors">
        <div>
          <span className="font-medium">{mf.food_items.name}</span>
          <span className="text-gray-400 text-xs ml-2">({mf.weight_g}g)</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs">
          <span>{protein}g P</span>
          <span className="font-semibold w-16 text-right">{calories} kcal</span>
        </div>
        <div className="w-20 pl-2 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <EditMealFoodModal mealFood={mf}>
            <button className="p-1 text-gray-400 hover:text-white"><Pencil size={14} /></button>
          </EditMealFoodModal>
          <RemoveButton action={() => removeFoodFromMeal(mf.id)} itemDescription={`${mf.weight_g}g of ${mf.food_items.name}`} />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-subtle rounded-lg border border-slate-border shadow-md">
      {/* CARD HEADER */}
      <header 
        className="p-3 flex justify-between items-center cursor-pointer hover:bg-slate-700/30 rounded-t-lg transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <MealStatusToggleButton mealId={meal.id} status={meal.status} />
          <div>
            <h3 className="text-lg font-bold">{meal.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock size={12} />
              <span>{displayTime}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="font-mono text-right">
            <p className="font-semibold text-white">{mealTotals.calories.toLocaleString()} <span className="text-xs text-gray-400">kcal</span></p>
            <p className="text-xs text-gray-400">{mealTotals.protein.toFixed(0)}g protein</p>
          </div>
          <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`} />
        </div>
      </header>

      {/* COLLAPSIBLE BODY */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="p-3 border-t border-slate-border">
          <SortableContext items={meal.meal_foods.map(f => f.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-1">
              {meal.meal_foods.length > 0 ? (
                meal.meal_foods.map((mf) => (
                  <DraggableMealFoodItem key={mf.id} foodItem={mf}>
                    {renderFoodItemRow(mf)}
                  </DraggableMealFoodItem>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4"><p>No food items added yet.</p></div>
              )}
            </ul>
          </SortableContext>
        </div>
      </div>

      {/* CARD FOOTER */}
      <footer className="p-2 border-t border-slate-border flex justify-between items-center">
        <AddFoodToMealModal mealId={meal.id} foodItems={foodItems} />
        <div className="flex items-center gap-2">
            <SaveMealAsTemplateModal mealId={meal.id} hasFoods={meal.meal_foods.length > 0} />
            <RemoveButton action={() => deleteMeal(meal.id)} itemDescription={`the "${meal.name}" meal`} />
        </div>
      </footer>
    </div>
  );
}