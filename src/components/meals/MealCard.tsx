// src/components/meals/MealCard.tsx
'use client';

import { useTransition, useMemo } from 'react';
import Card from "../ui/Card";
import AddFoodToMealModal from "./AddFoodToMealModal";
import RemoveButton from "../ui/RemoveButton";
import { deleteMeal, removeFoodFromMeal, toggleMealStatus } from "@/app/actions/meals";
import EditMealFoodModal from "./EditMealFoodModal";
import SaveMealAsTemplateModal from "../templates/SaveMealAsTemplateModal";
import { DraggableMealFoodItem } from './DraggableMealFoodItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CheckCircle2, Circle, Clock, Pencil } from 'lucide-react';
import type { Meal, FoodItem, MealFood } from '@/lib/types';

interface MealCardProps {
  meal: Meal;
  foodItems: FoodItem[];
}

export default function MealCard({ meal, foodItems }: MealCardProps) {
  const [, startTransition] = useTransition();

  const displayTime = meal.time ? new Date(`1970-01-01T${meal.time}Z`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }) : '';

  const mealTotals = useMemo(() => {
    return meal.meal_foods.reduce((acc, mf) => {
      if (mf.food_items) {
        const multiplier = mf.weight_g / 100;
        acc.calories += Math.round(mf.food_items.calories * multiplier);
        acc.protein += mf.food_items.protein_g * multiplier;
        acc.carbs += mf.food_items.carbs_g * multiplier;
        acc.fat += mf.food_items.fat_g * multiplier;
      }
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [meal.meal_foods]);

  const renderFoodItemRow = (mf: MealFood) => {
    const multiplier = mf.weight_g / 100;
    const calories = Math.round(mf.food_items.calories * multiplier);
    const protein = (mf.food_items.protein_g * multiplier).toFixed(1);
    const carbs = (mf.food_items.carbs_g * multiplier).toFixed(1);
    const fat = (mf.food_items.fat_g * multiplier).toFixed(1);
    return (
      <div className="text-sm flex justify-between items-center group w-full">
        <div className="flex-grow p-2">
          <span className="font-medium">{mf.food_items.name}</span>
          <span className="text-gray-400 text-xs ml-2">({mf.weight_g}g)</span>
        </div>
        <div className="flex gap-4 sm:gap-8 text-right font-mono text-xs sm:text-sm">
          <span className="w-12">{protein}g</span>
          <span className="w-12">{carbs}g</span>
          <span className="w-12">{fat}g</span>
          <span className="w-12 font-semibold">{calories}</span>
        </div>
        <div className="pl-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <EditMealFoodModal mealFood={mf}>
            <button className="p-1 text-gray-400 hover:text-white" aria-label="Edit food item"><Pencil size={14} /></button>
          </EditMealFoodModal>
          <RemoveButton action={() => removeFoodFromMeal(mf.id)} itemDescription={`${mf.weight_g}g of ${mf.food_items.name}`} />
        </div>
      </div>
    );
  };

  return (
    <Card className="mb-4">
      <div className="p-4">
        <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { startTransition(() => { toggleMealStatus(meal.id, meal.status); }); }} 
              className={`p-1 rounded-md transition-colors ${meal.status === 'done' ? 'text-green-400 hover:bg-green-500/10' : 'text-gray-400 hover:bg-slate-700/50'}`}
            >
              {meal.status === 'done' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            </button>
            <h3 className="text-lg font-bold">{meal.name}</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <SaveMealAsTemplateModal mealId={meal.id} hasFoods={meal.meal_foods.length > 0} />
            <RemoveButton action={() => deleteMeal(meal.id)} itemDescription={`the "${meal.name}" meal`} />
            <Clock size={16} />
            <span>{displayTime}</span>
          </div>
        </div>

        <div className="my-3">
          <div className="flex justify-between text-xs text-gray-400 mb-2 px-10">
            <span>FOOD ITEM</span>
            <div className="flex gap-4 sm:gap-8 text-right">
              <span className="w-12">Protein</span> <span className="w-12">Carbs</span> <span className="w-12">Fat</span> <span className="w-12">Cals</span>
            </div>
          </div>
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
        
        <div className="pt-3 border-t border-slate-700">
          <div className="flex justify-between items-center mb-3 px-2">
            <span className="font-bold">Meal Totals</span>
            <div className="flex gap-4 sm:gap-8 text-right font-mono text-xs sm:text-sm font-semibold">
              <span className="w-12">{mealTotals.protein.toFixed(1)}g</span>
              <span className="w-12">{mealTotals.carbs.toFixed(1)}g</span>
              <span className="w-12">{mealTotals.fat.toFixed(1)}g</span>
              <span className="w-12">{Math.round(mealTotals.calories)}</span>
            </div>
          </div>
          <AddFoodToMealModal mealId={meal.id} foodItems={foodItems} />
        </div>
      </div>
    </Card>
  );
}