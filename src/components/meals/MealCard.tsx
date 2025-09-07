// src/components/meals/MealCard.tsx (UPDATED)
import Card from "../ui/Card";
import { Clock } from "lucide-react";
import AddFoodToMealModal from "./AddFoodToMealModal"; // Import the new modal

// Add foodItems to the props
interface MealCardProps {
  meal: any; // Using 'any' for now as we'll add more fields
  foodItems: any[];
}

export default function MealCard({ meal, foodItems }: MealCardProps) {
  const displayTime = meal.time ? new Date(`1970-01-01T${meal.time}Z`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }) : 'Any time';
  
  return (
    <Card className="mb-4">
      <div className="p-4">
        <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-3">
          <h3 className="text-lg font-bold">{meal.name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400"><Clock size={16} /><span>{displayTime}</span></div>
        </div>
        <div className="text-center text-gray-500 py-4"><p>No food items added yet.</p></div>
        <div className="pt-3">
          {/* Pass props to the new modal */}
          <AddFoodToMealModal mealId={meal.id} foodItems={foodItems} />
        </div>
      </div>
    </Card>
  );
}