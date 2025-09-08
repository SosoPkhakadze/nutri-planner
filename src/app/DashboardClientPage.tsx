// src/app/DashboardClientPage.tsx
'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from "@/components/Header";
import Card from "@/components/ui/Card";
import ProgressRing from "@/components/ui/ProgressRing";
import AddMealModal from "@/components/meals/AddMealModal";
import DayStatusToggleButton from '@/components/ui/DayStatusToggleButton';
import SaveDayAsTemplateModal from '@/components/templates/SaveDayAsTemplateModal';
import { DraggableMealCard } from '@/components/meals/DraggableMealCard';
import { reorderMeals, reorderMealFoods } from '@/app/actions/meals';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import type { Meal, FoodItem } from '@/lib/types';

interface DashboardClientPageProps {
  initialMeals: Meal[];
  foodItems: FoodItem[];
  date: { displayDateString: string; displayDateLocale: string; prevDay: string; nextDay: string; };
  dayStatus: 'pending' | 'complete';
  dailyTotals: { consumedCalories: number; consumedProtein: number; consumedCarbs: number; consumedFat: number; };
  targets: { calories: number; protein: number; carbs: number; fat: number; };
}

export default function DashboardClientPage({ initialMeals, foodItems, date, dayStatus, dailyTotals, targets }: DashboardClientPageProps) {
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setMeals(initialMeals);
  }, [initialMeals]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();
    const activeType = active.data.current?.type;

    if (activeId === overId) return;

    if (activeType === 'meal') {
      setMeals((currentMeals) => {
        const oldIndex = currentMeals.findIndex((m) => m.id === activeId);
        const newIndex = currentMeals.findIndex((m) => m.id === overId);
        if (oldIndex === -1 || newIndex === -1) return currentMeals;
        const newOrder = arrayMove(currentMeals, oldIndex, newIndex);
        startTransition(() => { reorderMeals(date.displayDateString, newOrder.map(m => m.id)); });
        return newOrder;
      });
    }

    if (activeType === 'foodItem') {
      const activeContainerId = active.data.current?.mealId;
      const overContainerId = over.data.current?.mealId;

      if (!activeContainerId || !overContainerId || activeContainerId !== overContainerId) return;
      
      setMeals((currentMeals) => {
        const mealIndex = currentMeals.findIndex(m => m.id === activeContainerId);
        if (mealIndex === -1) return currentMeals;

        const newMeals = [...currentMeals];
        const mealToUpdate = { ...newMeals[mealIndex] };
        const oldFoodIndex = mealToUpdate.meal_foods.findIndex(f => f.id === activeId);
        const newFoodIndex = mealToUpdate.meal_foods.findIndex(f => f.id === overId);
        if (oldFoodIndex === -1 || newFoodIndex === -1) return currentMeals;

        mealToUpdate.meal_foods = arrayMove(mealToUpdate.meal_foods, oldFoodIndex, newFoodIndex);
        newMeals[mealIndex] = mealToUpdate;

        startTransition(() => { reorderMealFoods(activeContainerId, mealToUpdate.meal_foods.map(f => f.id)); });
        return newMeals;
      });
    }
  };
  
  const calorieProgress = targets.calories > 0 ? (dailyTotals.consumedCalories / targets.calories) * 100 : 0;

  if (!isMounted) {
    // Render a skeleton or a simplified static view to prevent hydration errors.
    // Returning null is the simplest way to ensure nothing interactive renders on the server.
    return null; 
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div>
        <Header />
        <main className="container mx-auto p-4 md:p-8">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
             <div className="flex items-center gap-4">
              <Link href={`/?date=${date.prevDay}`} className="p-2 rounded-md hover:bg-slate-700"><ChevronLeft /></Link>
              <h1 className="text-3xl font-bold">{date.displayDateLocale}</h1>
              <Link href={`/?date=${date.nextDay}`} className="p-2 rounded-md hover:bg-slate-700"><ChevronRight /></Link>
            </div>
            <div className="flex items-center gap-2">
              <DayStatusToggleButton date={date.displayDateString} status={dayStatus} />
              <SaveDayAsTemplateModal date={date.displayDateString} hasMeals={meals.length > 0} />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Schedule</h2>
                  <AddMealModal date={date.displayDateString} />
                </div>
                {meals.length > 0 ? (
                  <SortableContext items={meals.map(m => m.id)} strategy={verticalListSortingStrategy}>
                    <div className='space-y-4'>
                      {meals.map((meal) => <DraggableMealCard key={meal.id} meal={meal} foodItems={foodItems} />)}
                    </div>
                  </SortableContext>
                ) : (
                  <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-lg">
                    <p className="text-gray-500">No meals scheduled for this day.</p>
                    <AddMealModal date={date.displayDateString} />
                  </div>
                )}
              </Card>
            </div>
            <div className="space-y-6">
                <Card className="p-6 flex flex-col items-center justify-center text-center">
                  <h2 className="text-xl font-semibold mb-4">Calories</h2>
                  <div className="relative">
                      <ProgressRing progress={calorieProgress > 100 ? 100 : calorieProgress} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-bold text-2xl">{Math.round(dailyTotals.consumedCalories).toLocaleString()}</span>
                      <span className="text-sm text-gray-400">/ {targets.calories.toLocaleString()}</span>
                      </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Macros</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span>Protein</span><span className="font-semibold">{Math.round(dailyTotals.consumedProtein)}g / {targets.protein}g</span></div>
                      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden"><div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${Math.min(100, (dailyTotals.consumedProtein/targets.protein)*100)}%` }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span>Carbs</span><span className="font-semibold">{Math.round(dailyTotals.consumedCarbs)}g / {targets.carbs}g</span></div>
                      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden"><div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${Math.min(100, (dailyTotals.consumedCarbs/targets.carbs)*100)}%` }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span>Fat</span><span className="font-semibold">{Math.round(dailyTotals.consumedFat)}g / {targets.fat}g</span></div>
                      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden"><div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${Math.min(100, (dailyTotals.consumedFat/targets.fat)*100)}%` }}></div></div>
                    </div>
                  </div>
                </Card>
            </div>
          </div>
        </main>
      </div>
    </DndContext>
  );
}