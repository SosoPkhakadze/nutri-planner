// src/components/planner/PlannerMealCard.tsx
import Link from "next/link";

interface PlannerMealCardProps {
  meal: {
    id: string;
    name: string;
    time: string;
    date: string; // The date is needed for the link
    meal_foods: any[];
  };
}

export default function PlannerMealCard({ meal }: PlannerMealCardProps) {
  const displayTime = meal.time ? new Date(`1970-01-01T${meal.time}Z`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }) : '';
  
  const totalItems = meal.meal_foods.length;

  return (
    // Wrap the entire card in a Link component
    <Link 
      href={`/?date=${meal.date}`} 
      className="block bg-slate-700 p-2 rounded-md text-sm cursor-pointer hover:bg-slate-600 transition-colors"
    >
      <div className="flex justify-between items-center">
        <span className="font-semibold truncate">{meal.name}</span>
        {displayTime && <span className="text-xs text-gray-400">{displayTime}</span>}
      </div>
      <p className="text-xs text-gray-400 mt-1">
        {totalItems} {totalItems === 1 ? 'item' : 'items'}
      </p>
    </Link>
  );
}