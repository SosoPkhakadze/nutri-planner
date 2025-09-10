// src/app/DashboardClientPage.tsx
'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Droplets, Flame, Zap, Apple, Drumstick, Plus, Calendar, Target, Copy } from 'lucide-react';
import Header from "@/components/Header";
import Card from "@/components/ui/Card";
import AddMealModal from "@/components/meals/AddMealModal";
import SaveDayAsTemplateModal from '@/components/templates/SaveDayAsTemplateModal';
import { DraggableMealCard } from '@/components/meals/DraggableMealCard';
import { reorderMeals, reorderMealFoods } from '@/app/actions/meals';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import type { Meal, FoodItem } from '@/lib/types';
import WaterTrackerCard from '@/components/tracking/WaterTrackerCard';
import SupplementTrackerCard from '@/components/supplements/SupplementTrackerCard';
import CopyDayModal from '@/components/planner/CopyDayModal';

type Supplement = {
  id: string; name: string; dosage_amount: number | null; dosage_unit: string | null;
  calories_per_serving: number | null; protein_g_per_serving: number | null;
};

// Enhanced Stat Card with progress ring and better animations
const StatCard = ({ icon, label, value, target, unit, colorClass, accentColor }: any) => {
  const percentage = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  const strokeDasharray = 2 * Math.PI * 36; // circumference for r=36
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;
  
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border-slate-700/50">
      <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="none" className="text-slate-700" />
                <circle
                  cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="none"
                  strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset}
                  className={`${colorClass.split(' ')[1]} transition-all duration-700 ease-out`}
                  strokeLinecap="round"
                />
              </svg>
              <div className={`absolute inset-0 flex items-center justify-center w-16 h-16 rounded-full ${colorClass}`}>{icon}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-bold text-white mt-1">
                {value.toLocaleString()}
                <span className="text-base text-slate-400 font-normal ml-1">{unit}</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass.split(' ')[0]}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400">{Math.round(percentage)}%</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Target</div>
            <div className="text-sm font-semibold text-slate-300">{target.toLocaleString()}{unit}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Quick Action Button Component
const QuickActionButton = ({ icon, label, primary = false }: any) => (
  <button
    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
      primary 
        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/25' 
        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'
    } hover:scale-105 hover:shadow-lg`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

interface DashboardClientPageProps {
  initialMeals: Meal[]; 
  foodItems: FoodItem[]; 
  date: { displayDateString: string; displayDateLocale: string; prevDay: string; nextDay: string; };
  dayStatus: 'pending' | 'complete'; 
  dailyTotals: { consumedCalories: number; consumedProtein: number; consumedCarbs: number; consumedFat: number; };
  targets: { calories: number; protein: number; carbs: number; fat: number; }; 
  totalWaterMl: number; 
  dailyWaterGoalMl: number;
  activeSupplements: Supplement[]; 
  loggedSupplementIds: string[];
}

export default function DashboardClientPage({ 
  initialMeals, foodItems, date, dayStatus, dailyTotals, targets, totalWaterMl, dailyWaterGoalMl, activeSupplements, loggedSupplementIds
}: DashboardClientPageProps) {
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); setMeals(initialMeals); }, [initialMeals]);

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

  const completedMeals = meals.filter(m => m.status === 'done').length;
  const totalMeals = meals.length;
  const mealCompletionRate = totalMeals > 0 ? (completedMeals / totalMeals) * 100 : 0;
  const hasMeals = meals.length > 0;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Header />
        
        <main className="container mx-auto p-4 md:p-8 space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center bg-slate-800/50 rounded-xl p-1">
                    <Link href={`/?date=${date.prevDay}`} className="p-3 rounded-lg hover:bg-slate-700 transition-colors"><ChevronLeft size={24} className="text-slate-300" /></Link>
                    <div className="px-6">
                      <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{date.displayDateLocale}</h1>
                      <p className="text-slate-400 text-sm mt-1">{completedMeals} of {totalMeals} meals completed</p>
                    </div>
                    <Link href={`/?date=${date.nextDay}`} className="p-3 rounded-lg hover:bg-slate-700 transition-colors"><ChevronRight size={24} className="text-slate-300" /></Link>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CopyDayModal sourceDate={date.displayDateString} hasMeals={hasMeals}>
                    <button
                      disabled={!hasMeals}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md transition flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Copy size={16} />
                      Copy Day
                    </button>
                  </CopyDayModal>
                  <SaveDayAsTemplateModal date={date.displayDateString} hasMeals={hasMeals} />
                </div>
              </div>
              {totalMeals > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm text-slate-400 mb-2"><span>Daily Progress</span><span>{Math.round(mealCompletionRate)}% Complete</span></div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${mealCompletionRate}%` }} /></div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Flame size={24} />} label="Calories" value={Math.round(dailyTotals.consumedCalories)} target={targets.calories} unit="kcal" colorClass="bg-orange-500/20 text-orange-400" accentColor="from-orange-500/20 to-red-500/20" />
            <StatCard icon={<Drumstick size={24} />} label="Protein" value={Math.round(dailyTotals.consumedProtein)} target={targets.protein} unit="g" colorClass="bg-red-500/20 text-red-400" accentColor="from-red-500/20 to-pink-500/20" />
            <StatCard icon={<Zap size={24} />} label="Carbs" value={Math.round(dailyTotals.consumedCarbs)} target={targets.carbs} unit="g" colorClass="bg-blue-500/20 text-blue-400" accentColor="from-blue-500/20 to-cyan-500/20" />
            <StatCard icon={<Apple size={24} />} label="Fat" value={Math.round(dailyTotals.consumedFat)} target={targets.fat} unit="g" colorClass="bg-yellow-500/20 text-yellow-400" accentColor="from-yellow-500/20 to-orange-500/20" />
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3 space-y-6">
              <Card className="overflow-hidden bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border-slate-700/50">
                <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-transparent">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-500/20 rounded-lg"><Target size={24} className="text-cyan-400" /></div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Today's Meals</h2>
                        <p className="text-slate-400 text-sm">Plan and track your nutrition</p>
                      </div>
                    </div>
                    
                    <AddMealModal date={date.displayDateString}>
                      <QuickActionButton 
                        icon={<Plus size={20} />}
                        label="Add Meal"
                        primary={true}
                      />
                    </AddMealModal>

                  </div>
                </div>
                
                <div className="p-6">
                  {meals.length > 0 ? (
                    <SortableContext items={meals.map(m => m.id)} strategy={verticalListSortingStrategy}>
                      <div className='space-y-6'>
                        {meals.map((meal) => (<DraggableMealCard key={meal.id} meal={meal} foodItems={foodItems} />))}
                      </div>
                    </SortableContext>
                  ) : (
                    <div className="text-center py-16">
                      <div className="mb-6">
                        <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4"><Calendar size={24} className="text-slate-400" /></div>
                        <h3 className="text-xl font-semibold text-white mb-2">No meals planned yet</h3>
                        <p className="text-slate-400 max-w-sm mx-auto">
                          Start building your nutrition plan by adding your first meal.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
            
            <div className="xl:col-span-1 space-y-6">
              <WaterTrackerCard totalWaterMl={totalWaterMl} dailyWaterGoalMl={dailyWaterGoalMl} date={date.displayDateString} />
              <SupplementTrackerCard activeSupplements={activeSupplements} loggedSupplementIds={loggedSupplementIds} date={date.displayDateString} />
            </div>
          </div>
        </main>
      </div>
    </DndContext>
  );
}