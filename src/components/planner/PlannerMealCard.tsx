// src/components/planner/PlannerMealCard.tsx
import MealStatusToggleButton from '../meals/MealStatusToggleButton';
import { Clock, Utensils, CheckCircle2 } from 'lucide-react';

interface PlannerMealCardProps {
  meal: {
    id: string;
    name: string;
    time: string;
    date: string;
    status: 'pending' | 'done';
    meal_foods: any[];
  };
}

export default function PlannerMealCard({ meal }: PlannerMealCardProps) {
  const displayTime = meal.time ? new Date(`1970-01-01T${meal.time}Z`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }) : '';
  const totalItems = meal.meal_foods.length;
  const isDone = meal.status === 'done';

  return (
    <div className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] ${
      isDone ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20' : 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 hover:from-slate-700/50 hover:to-slate-600/50'
    } border backdrop-blur-sm`}>
      {/* Status indicator */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r transition-all duration-300 ${
        isDone ? 'from-green-500 to-emerald-500' : 'from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100'
      }`}></div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <MealStatusToggleButton mealId={meal.id} status={meal.status} />
            <div className="min-w-0 flex-1">
              <h4 className={`font-semibold truncate transition-all duration-200 ${
                isDone ? 'line-through text-green-400/80' : 'text-white'
              }`}>
                {meal.name}
              </h4>
            </div>
          </div>
          
          {displayTime && (
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 rounded-full">
              <Clock size={12} className="text-slate-400" />
              <span className="text-xs text-slate-400 font-medium">{displayTime}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <div className={`p-1 rounded ${isDone ? 'bg-green-500/20' : 'bg-slate-700/50'}`}>
              <Utensils size={12} className={isDone ? 'text-green-400' : 'text-slate-400'} />
            </div>
            <span className={`font-medium ${
              isDone ? 'text-green-400/80 line-through' : 'text-slate-300'
            }`}>
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>
          
          {isDone && (
            <div className="flex items-center gap-1">
              <CheckCircle2 size={14} className="text-green-400" />
              <span className="text-xs text-green-400 font-medium">Complete</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-cyan-500/5 to-blue-500/5"></div>
    </div>
  );
}