// src/components/planner/PlannerMealCard.tsx
// No Link component here anymore

interface PlannerMealCardProps {
    meal: {
      id: string;
      name: string;
      time: string;
      date: string;
      meal_foods: any[];
    };
  }
  
  export default function PlannerMealCard({ meal }: PlannerMealCardProps) {
    const displayTime = meal.time ? new Date(`1970-01-01T${meal.time}Z`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }) : '';
    const totalItems = meal.meal_foods.length;
  
    return (
      // This is now a simple div, as the parent is the link
      <div className="bg-slate-700 p-2 rounded-md text-sm cursor-pointer group-hover:bg-slate-600 transition-colors">
        <div className="flex justify-between items-center">
          <span className="font-semibold truncate">{meal.name}</span>
          {displayTime && <span className="text-xs text-gray-400">{displayTime}</span>}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </p>
      </div>
    );
  }