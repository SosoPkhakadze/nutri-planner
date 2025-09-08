// src/app/DashboardClientPage.tsx
'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Droplets, Flame, Zap, Apple, Drumstick } from 'lucide-react';
import Header from "@/components/Header";
import Card from "@/components/ui/Card";
import AddMealModal from "@/components/meals/AddMealModal";
import DayStatusToggleButton from '@/components/ui/DayStatusToggleButton';
import SaveDayAsTemplateModal from '@/components/templates/SaveDayAsTemplateModal';
import { DraggableMealCard } from '@/components/meals/DraggableMealCard';
import { reorderMeals, reorderMealFoods } from '@/app/actions/meals';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import type { Meal, FoodItem } from '@/lib/types';
import WaterTrackerCard from '@/components/tracking/WaterTrackerCard';
import SupplementTrackerCard from '@/components/supplements/SupplementTrackerCard';

// Match the detailed supplement type
type Supplement = {
  id: string; name: string; dosage_amount: number | null; dosage_unit: string | null;
  calories_per_serving: number | null; protein_g_per_serving: number | null;
};

// Summary Stat Card Component (New)
const StatCard = ({ icon, label, value, target, unit, colorClass }: any) => (
  <Card className="p-4 flex items-start gap-4">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-xl font-bold">
        {value.toLocaleString()}
        <span className="text-base text-gray-400 font-normal"> / {target.toLocaleString()}{unit}</span>
      </p>
    </div>
  </Card>
);

interface DashboardClientPageProps {
  initialMeals: Meal[]; foodItems: FoodItem[]; date: { displayDateString: string; displayDateLocale: string; prevDay: string; nextDay: string; };
  dayStatus: 'pending' | 'complete'; dailyTotals: { consumedCalories: number; consumedProtein: number; consumedCarbs: number; consumedFat: number; };
  targets: { calories: number; protein: number; carbs: number; fat: number; }; totalWaterMl: number; dailyWaterGoalMl: number;
  activeSupplements: Supplement[]; loggedSupplementIds: string[];
}

export default function DashboardClientPage({ 
  initialMeals, foodItems, date, dayStatus, dailyTotals, targets, totalWaterMl, dailyWaterGoalMl, activeSupplements, loggedSupplementIds
}: DashboardClientPageProps) {
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); setMeals(initialMeals);
  }, [initialMeals]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeType = active.data.current?.type;
    if (activeType === 'meal') {
      const oldIndex = meals.findIndex(m => m.id === active.id);
      const newIndex = meals.findIndex(m => m.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newOrder = arrayMove(meals, oldIndex, newIndex);
      setMeals(newOrder);
      startTransition(() => { reorderMeals(date.displayDateString, newOrder.map(m => m.id)); });
    } else if (activeType === 'foodItem') {
      const activeContainerId = active.data.current?.mealId;
      const overContainerId = over.data.current?.mealId;
      if (!activeContainerId || activeContainerId !== overContainerId) return;
      const mealIndex = meals.findIndex(m => m.id === activeContainerId);
      if (mealIndex === -1) return;
      const mealToUpdate = meals[mealIndex];
      const oldFoodIndex = mealToUpdate.meal_foods.findIndex(f => f.id === active.id);
      const newFoodIndex = mealToUpdate.meal_foods.findIndex(f => f.id === over.id);
      if (oldFoodIndex === -1 || newFoodIndex === -1) return;
      const updatedMealFoods = arrayMove(mealToUpdate.meal_foods, oldFoodIndex, newFoodIndex);
      const newMeals = [...meals];
      newMeals[mealIndex] = { ...mealToUpdate, meal_foods: updatedMealFoods };
      setMeals(newMeals);
      startTransition(() => { reorderMealFoods(activeContainerId, updatedMealFoods.map(f => f.id)); });
    }
  };
  
  if (!isMounted) return null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div>
        <Header />
        <main className="container mx-auto p-4 md:p-8 space-y-8">
          {/* Section 1: Date Navigation & Actions */}
          <div className="flex justify-between items-center flex-wrap gap-4">
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

          {/* NEW Section 2: High-Level Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Flame size={20} />} label="Calories" value={Math.round(dailyTotals.consumedCalories)} target={targets.calories} unit="kcal" colorClass="bg-brand-amber/20 text-brand-amber" />
            <StatCard icon={<Drumstick size={20} />} label="Protein" value={Math.round(dailyTotals.consumedProtein)} target={targets.protein} unit="g" colorClass="bg-red-500/20 text-red-400" />
            <StatCard icon={<Zap size={20} />} label="Carbs" value={Math.round(dailyTotals.consumedCarbs)} target={targets.carbs} unit="g" colorClass="bg-sky-500/20 text-sky-400" />
            <StatCard icon={<Apple size={20} />} label="Fat" value={Math.round(dailyTotals.consumedFat)} target={targets.fat} unit="g" colorClass="bg-yellow-500/20 text-yellow-400" />
          </div>
          
          {/* Section 3: Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Today's Meals</h2>
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
            <div className="lg:col-span-1 space-y-6">
              <WaterTrackerCard totalWaterMl={totalWaterMl} dailyWaterGoalMl={dailyWaterGoalMl} date={date.displayDateString} />
              <SupplementTrackerCard activeSupplements={activeSupplements} loggedSupplementIds={loggedSupplementIds} date={date.displayDateString} />
            </div>
          </div>
        </main>
      </div>
    </DndContext>
  );
}