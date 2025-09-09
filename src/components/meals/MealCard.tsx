// src/components/meals/MealCard.tsx
'use client';

import { useState, useMemo } from 'react';
import { deleteMeal, removeFoodFromMeal } from "@/app/actions/meals";
import AddFoodToMealModal from "./AddFoodToMealModal";
import EditMealFoodModal from "./EditMealFoodModal";
import SaveMealAsTemplateModal from "../templates/SaveMealAsTemplateModal"; // Re-import
import MealStatusToggleButton from './MealStatusToggleButton';
import RemoveButton from "../ui/RemoveButton";
import { DraggableMealFoodItem } from './DraggableMealFoodItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Clock, Pencil, AlertTriangle, ChevronDown, Plus, Utensils, TrendingUp } from 'lucide-react';
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
        acc.carbs += mf.food_items.carbs_g * multiplier;
        acc.fat += mf.food_items.fat_g * multiplier;
      }
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [meal.meal_foods]);

  const renderFoodItemRow = (mf: MealFood) => {
    if (!mf.food_items) {
      return (
        <div className="group relative p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle size={16} />
              <span className="font-medium italic">[Deleted Food Item]</span>
            </div>
            <RemoveButton action={() => removeFoodFromMeal(mf.id)} itemDescription="this deleted item entry" />
          </div>
        </div>
      );
    }

    const multiplier = mf.weight_g / 100;
    const calories = Math.round(mf.food_items.calories * multiplier);
    const protein = (mf.food_items.protein_g * multiplier).toFixed(1);
    const carbs = (mf.food_items.carbs_g * multiplier).toFixed(1);
    const fat = (mf.food_items.fat_g * multiplier).toFixed(1);

    return (
      <div className="group relative p-3 rounded-xl hover:bg-slate-800/50 transition-all duration-200 border border-transparent hover:border-slate-600/30">
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold text-white truncate">{mf.food_items.name}</h4>
              <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs font-medium rounded-full">
                {mf.weight_g}g
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500 rounded-full"></div><span className="text-slate-400">{calories} kcal</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div><span className="text-slate-400">{protein}g P</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div><span className="text-slate-400">{carbs}g C</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div><span className="text-slate-400">{fat}g F</span></div>
            </div>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pl-4">
            <EditMealFoodModal mealFood={mf}>
              <div className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer">
                <Pencil size={14} />
              </div>
            </EditMealFoodModal>
            <RemoveButton action={() => removeFoodFromMeal(mf.id)} itemDescription={`${mf.weight_g}g of ${mf.food_items.name}`} />
          </div>
        </div>
      </div>
    );
  };

  const isDone = meal.status === 'done';

  return (
    <div className={`relative group transition-all duration-300 ${isDone ? 'opacity-75' : ''}`}>
      <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r transition-all duration-300 ${isDone ? 'from-green-500 to-emerald-500' : 'from-cyan-500 to-blue-500'}`}></div>

        <header 
          className="p-6 cursor-pointer hover:bg-slate-800/30 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <MealStatusToggleButton mealId={meal.id} status={meal.status} />
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={`text-xl font-bold transition-all duration-200 ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>{meal.name}</h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-700/50 rounded-full">
                    <Clock size={12} className="text-slate-400" />
                    <span className="text-xs text-slate-400 font-medium">{displayTime}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1"><Utensils size={12} /><span>{meal.meal_foods.length} items</span></div>
                  <div className="flex items-center gap-1"><TrendingUp size={12} /><span>{mealTotals.calories} kcal</span></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-2xl font-bold text-white mb-1">{mealTotals.calories.toLocaleString()}<span className="text-sm text-slate-400 font-normal ml-1">kcal</span></div>
                <div className="flex items-center gap-3 text-xs font-medium">
                  <span className="text-red-400">{mealTotals.protein.toFixed(0)}g P</span>
                  <span className="text-blue-400">{mealTotals.carbs.toFixed(0)}g C</span>
                  <span className="text-yellow-400">{mealTotals.fat.toFixed(0)}g F</span>
                </div>
              </div>
              <ChevronDown size={24} className={`text-slate-400 transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`} />
            </div>
          </div>
        </header>

        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 pb-6">
            <SortableContext items={meal.meal_foods.map(f => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3 mb-6">
                {meal.meal_foods.length > 0 ? (
                  meal.meal_foods.map((mf) => (
                    <DraggableMealFoodItem key={mf.id} foodItem={mf}>
                      {renderFoodItemRow(mf)}
                    </DraggableMealFoodItem>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center mb-3"><Utensils size={20} className="text-slate-400" /></div>
                    <p className="text-slate-400 font-medium">No food items yet</p>
                    <p className="text-slate-500 text-sm">Add items to track nutrition</p>
                  </div>
                )}
              </div>
            </SortableContext>

            <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
              <AddFoodToMealModal mealId={meal.id} foodItems={foodItems} />
              <div className="flex items-center gap-3">
                {/* THIS IS THE FIX: Button is now here */}
                <SaveMealAsTemplateModal mealId={meal.id} hasFoods={meal.meal_foods.length > 0} />
                <RemoveButton action={() => deleteMeal(meal.id)} itemDescription={`the "${meal.name}" meal`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}