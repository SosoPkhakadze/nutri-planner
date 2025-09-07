// src/components/meals/MealCard.tsx
'use client';

import Card from "../ui/Card";
import { Clock } from "lucide-react";
import AddFoodToMealModal from "./AddFoodToMealModal";
import RemoveButton from "../ui/RemoveButton";
import { deleteMeal, removeFoodFromMeal } from "@/app/actions/meals";
// We will create the EditMealFoodModal component next
import EditMealFoodModal from "./EditMealFoodModal";

interface MealCardProps {
  meal: any;
  foodItems: any[];
}

export default function MealCard({ meal, foodItems }: MealCardProps) {
  const displayTime = meal.time ? new Date(`1970-01-01T${meal.time}Z`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }) : 'Any time';

  // Calculate meal totals
  const mealTotals = meal.meal_foods.reduce((acc: any, mf: any) => {
    if (mf.food_items) {
      const multiplier = mf.weight_g / 100;
      acc.calories += Math.round(mf.food_items.calories * multiplier);
      acc.protein += mf.food_items.protein_g * multiplier;
      acc.carbs += mf.food_items.carbs_g * multiplier;
      acc.fat += mf.food_items.fat_g * multiplier;
    }
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <Card className="mb-4">
      <div className="p-4">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">{meal.name}</h3>
            <RemoveButton action={() => deleteMeal(meal.id)} itemDescription={`the "${meal.name}" meal`} />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock size={16} />
            <span>{displayTime}</span>
          </div>
        </div>

        {/* FOOD LIST */}
        <div className="my-3">
          {/* Header row for the food list */}
          <div className="flex justify-between text-xs text-gray-400 mb-2 px-2">
            <span>FOOD ITEM</span>
            <div className="flex gap-4 sm:gap-8 text-right">
              <span className="w-12">Protein</span>
              <span className="w-12">Carbs</span>
              <span className="w-12">Fat</span>
              <span className="w-12">Cals</span>
            </div>
          </div>
          
          {meal.meal_foods && meal.meal_foods.length > 0 ? (
            <ul className="space-y-1">
              {meal.meal_foods.map((mf: any) => {
                const multiplier = mf.weight_g / 100;
                const calories = Math.round(mf.food_items.calories * multiplier);
                const protein = (mf.food_items.protein_g * multiplier).toFixed(1);
                const carbs = (mf.food_items.carbs_g * multiplier).toFixed(1);
                const fat = (mf.food_items.fat_g * multiplier).toFixed(1);

                return (
                  <li key={mf.id} className="text-sm flex justify-between items-center rounded-md hover:bg-slate-700/50 pr-2">
                    {/* The Edit Modal will wrap the food item's display */}
                    <EditMealFoodModal mealFood={mf}>
                      <div className="flex-grow p-2 cursor-pointer">
                        <span className="font-medium">{mf.food_items.name}</span>
                        <span className="text-gray-400 text-xs ml-2">({mf.weight_g}g)</span>
                      </div>
                    </EditMealFoodModal>
                    
                    <div className="flex gap-4 sm:gap-8 text-right font-mono text-xs sm:text-sm">
                      <span className="w-12">{protein}g</span>
                      <span className="w-12">{carbs}g</span>
                      <span className="w-12">{fat}g</span>
                      <span className="w-12 font-semibold">{calories}</span>
                    </div>
                    <div className="pl-2">
                      <RemoveButton action={() => removeFoodFromMeal(mf.id)} itemDescription={`${mf.weight_g}g of ${mf.food_items.name}`} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center text-gray-500 py-4"><p>No food items added yet.</p></div>
          )}
        </div>
        
        {/* FOOTER */}
        <div className="pt-3 border-t border-slate-700">
          {/* Meal Totals */}
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