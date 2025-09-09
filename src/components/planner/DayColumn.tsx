// src/components/planner/DayColumn.tsx
import Link from 'next/link';
import { GlassCard } from '@/components/ui/Card';
import PlannerMealCard from './PlannerMealCard';
import ProgressRing from '@/components/ui/ProgressRing'; // We'll reuse this!
import { Utensils, Flame } from 'lucide-react';

interface DayColumnProps {
  day: Date;
  isToday: boolean;
  meals: any[];
  dailyTotals: {
    calories: number;
    protein: number;
  };
  targets: {
    calories: number;
    protein: number;
  };
}

export default function DayColumn({ day, isToday, meals, dailyTotals, targets }: DayColumnProps) {
  const dateStr = day.toISOString().split('T')[0];
  const calorieProgress = targets.calories > 0 ? (dailyTotals.calories / targets.calories) * 100 : 0;
  const proteinProgress = targets.protein > 0 ? (dailyTotals.protein / targets.protein) * 100 : 0;

  return (
    <Link href={`/?date=${dateStr}`} className="block h-full">
      <GlassCard 
        hover={true} 
        className={`h-full flex flex-col p-4 transition-all duration-300 ${isToday ? 'border-cyan-500/50' : 'border-slate-700/50'}`}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <p className="text-sm font-semibold text-slate-400">
            {day.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })}
          </p>
          <div className={`mt-2 w-10 h-10 mx-auto rounded-full flex items-center justify-center text-lg font-bold transition-colors duration-300 ${
            isToday 
              ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25' 
              : 'bg-slate-700/50 text-slate-200'
          }`}>
            {day.getUTCDate()}
          </div>
        </div>

        {/* Meal Cards */}
        <div className="flex-grow space-y-2">
          {meals.length > 0 ? (
            meals.map(meal => <PlannerMealCard key={meal.id} meal={meal} />)
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 pt-8">
              <Utensils size={24} />
              <p className="text-xs mt-2">No Meals</p>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="flex justify-around items-center">
            <div className="text-center">
              <div className="relative w-12 h-12">
                <ProgressRing progress={calorieProgress} size={48} strokeWidth={4} />
                <Flame size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-400" />
              </div>
              <p className="text-xs text-slate-300 mt-1 font-bold">{Math.round(dailyTotals.calories)}</p>
              <p className="text-3xs text-slate-500">kcal</p>
            </div>
            <div className="text-center">
              <div className="relative w-12 h-12">
                <ProgressRing progress={proteinProgress} size={48} strokeWidth={4} />
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-400 font-bold text-sm">P</div>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-bold">{Math.round(dailyTotals.protein)}g</p>
              <p className="text-3xs text-slate-500">protein</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}