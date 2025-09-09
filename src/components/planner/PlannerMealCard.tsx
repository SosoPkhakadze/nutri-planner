// src/components/planner/PlannerMealCard.tsx
import { Check } from 'lucide-react';

interface PlannerMealCardProps {
  meal: {
    name: string;
    status: 'pending' | 'done';
  };
}

export default function PlannerMealCard({ meal }: PlannerMealCardProps) {
  const isDone = meal.status === 'done';

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg transition-colors text-sm ${
      isDone 
        ? 'bg-green-500/10 text-green-300' 
        : 'bg-slate-700/40 text-slate-300'
    }`}>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
        isDone ? 'bg-green-500' : 'border-2 border-slate-500'
      }`}>
        {isDone && <Check size={10} className="text-white" />}
      </div>
      <span className={`truncate ${isDone ? 'line-through' : ''}`}>{meal.name}</span>
    </div>
  );
}