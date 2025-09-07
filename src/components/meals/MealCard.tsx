// src/components/meals/MealCard.tsx
import Card from "../ui/Card";
import { Clock, PlusCircle } from "lucide-react";

// Define the type for a meal object based on our DB schema
export type Meal = {
  id: string;
  name: string;
  time: string;
  // We will add foods later
};

interface MealCardProps {
  meal: Meal;
}

export default function MealCard({ meal }: MealCardProps) {
  // Format time for display
  const displayTime = meal.time ? new Date(`1970-01-01T${meal.time}Z`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }) : 'Any time';
  
  return (
    <Card className="mb-4">
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-3">
          <h3 className="text-lg font-bold">{meal.name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock size={16} />
            <span>{displayTime}</span>
          </div>
        </div>
        {/* Body (for food items) */}
        <div className="text-center text-gray-500 py-4">
          <p>No food items added yet.</p>
        </div>
        {/* Footer / Actions */}
        <div className="pt-3">
          <button className="w-full text-cyan-400 flex items-center justify-center gap-2 p-2 rounded-md hover:bg-slate-700 transition">
            <PlusCircle size={18} />
            Add Food
          </button>
        </div>
      </div>
    </Card>
  );
}