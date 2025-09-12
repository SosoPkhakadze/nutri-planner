// src/app/planner/PlannerClientPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DayColumn from '@/components/planner/DayColumn';
import { getLocalStartOfWeek } from '@/lib/dateUtils';

interface PlannerClientPageProps {
  initialDays: string[];
  initialMealsByDate: { [key: string]: any[] };
  initialFoodItemsById: { [key: string]: any };
  targets: {
    calories: number;
    protein: number;
  };
  weekNav: {
    prevWeek: string;
    nextWeek: string;
  };
}

const toISODate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function PlannerClientPage({ 
  initialDays, 
  initialMealsByDate, 
  initialFoodItemsById, 
  targets, 
  weekNav 
}: PlannerClientPageProps) {
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasWeekParam = searchParams.has('week');

  const [localToday, setLocalToday] = useState('');

  useEffect(() => {
    const today = new Date();
    setLocalToday(toISODate(today));

    if (!hasWeekParam) {
      const startOfCurrentUserWeek = getLocalStartOfWeek(today);
      router.replace(`/planner?week=${toISODate(startOfCurrentUserWeek)}`);
    }
  }, [hasWeekParam, router]);

  if (!hasWeekParam) {
    return (
      <>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="h-9 w-64 bg-slate-700 rounded-md animate-pulse"></div>
            <div className="h-5 w-72 bg-slate-700 rounded-md animate-pulse mt-2"></div>
          </div>
          <div className="h-14 w-80 bg-slate-800 rounded-xl animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="bg-slate-800/50 rounded-xl p-4 min-h-[300px] flex flex-col animate-pulse"></div>
            ))}
        </div>
      </>
    );
  }

  // FIX: Correctly parse the full ISO string from the server without adding extra parts.
  const days = initialDays.map(d => new Date(d));
  
  const weekStart = days[0];
  const weekEnd = days[6];

  const weekTitle = `${weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`;

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Weekly Planner</h1>
          <p className="text-slate-400 mt-1">Plan your nutrition for the week ahead.</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-slate-800 rounded-xl border border-slate-700">
          <Link href={`/planner?week=${weekNav.prevWeek}`} className="p-3 rounded-lg hover:bg-slate-700 transition-colors"><ChevronLeft size={20} /></Link>
          <div className="px-4 text-center">
            <span className="font-semibold text-lg">{weekTitle}</span>
          </div>
          <Link href={`/planner?week=${weekNav.nextWeek}`} className="p-3 rounded-lg hover:bg-slate-700 transition-colors"><ChevronRight size={20} /></Link>
        </div>
      </div>

      {/* Grid of Day Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {days.map(day => {
          const dateStr = day.toISOString().split('T')[0];
          const dayMeals = initialMealsByDate[dateStr] || [];
          
          const dailyTotals = dayMeals.reduce((acc: { calories: number; protein: number }, meal: any) => {
            if (meal.status === 'done') {
              (meal.meal_foods || []).forEach((mf: any) => {
                const foodItem = initialFoodItemsById[mf.food_item_id];
                if (foodItem) {
                  const multiplier = mf.weight_g / 100;
                  acc.calories += Math.round(foodItem.calories * multiplier);
                  acc.protein += foodItem.protein_g * multiplier;
                }
              });
            }
            return acc;
          }, { calories: 0, protein: 0 });

          return (
            <DayColumn 
              key={dateStr}
              day={day}
              isToday={dateStr === localToday}
              meals={dayMeals}
              dailyTotals={dailyTotals}
              targets={targets}
            />
          );
        })}
      </div>
    </>
  );
}