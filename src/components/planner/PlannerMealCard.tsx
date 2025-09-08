// src/components/planner/PlannerMealCard.tsx
import MealStatusToggleButton from '../meals/MealStatusToggleButton'; // Import the new component

interface PlannerMealCardProps {
    meal: {
      id: string;
      name: string;
      time: string;
      date: string;
      status: 'pending' | 'done'; // Add status prop
      meal_foods: any[];
    };
  }
  
  export default function PlannerMealCard({ meal }: PlannerMealCardProps) {
    const displayTime = meal.time ? new Date(`1970-01-01T${meal.time}Z`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }) : '';
    const totalItems = meal.meal_foods.length;
    const isDone = meal.status === 'done';
  
    return (
      <div className={`p-2 rounded-md text-sm cursor-pointer group-hover:bg-slate-600 transition-all duration-200 ${isDone ? 'bg-green-900/30' : 'bg-slate-700'}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MealStatusToggleButton mealId={meal.id} status={meal.status} />
            <span className={`font-semibold truncate ${isDone ? 'line-through text-gray-400' : ''}`}>{meal.name}</span>
          </div>
          {displayTime && <span className="text-xs text-gray-400">{displayTime}</span>}
        </div>
        <p className={`text-xs text-gray-400 mt-1 pl-8 ${isDone ? 'line-through' : ''}`}>
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </p>
      </div>
    );
  }