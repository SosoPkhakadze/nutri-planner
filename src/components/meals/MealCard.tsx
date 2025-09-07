// src/components/meals/MealCard.tsx
import Card from "../ui/Card";
import { Clock } from "lucide-react";
import AddFoodToMealModal from "./AddFoodToMealModal";
import RemoveButton from "../ui/RemoveButton";
import { deleteMeal, removeFoodFromMeal } from "@/app/actions/meals";

interface MealCardProps {
  meal: any;
  foodItems: any[];
}

export default function MealCard({ meal, foodItems }: MealCardProps) {
  const displayTime = meal.time ? new Date(`1970-01-01T${meal.time}Z`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }) : 'Any time';
  
  return (
    <Card className="mb-4">
      <div className="p-4">
        <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-3">
          <div className="flex items-center gap-2 group">
            <h3 className="text-lg font-bold">{meal.name}</h3>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <RemoveButton action={() => deleteMeal(meal.id)} itemDescription={`the "${meal.name}" meal`} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock size={16} />
            <span>{displayTime}</span>
          </div>
        </div>

        {meal.meal_foods && meal.meal_foods.length > 0 ? (
          <ul className="space-y-2 my-3">
            {meal.meal_foods.map((mf: any) => {
              const multiplier = mf.weight_g / 100;
              const calories = Math.round(mf.food_items.calories * multiplier);
              return (
                <li key={mf.id} className="text-sm flex justify-between items-center group">
                  <div>
                    <span className="font-medium">{mf.food_items.name}</span>
                    <span className="text-gray-400 text-xs ml-2">({mf.weight_g}g)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-300">{calories} kcal</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                       <RemoveButton action={() => removeFoodFromMeal(mf.id)} itemDescription={`${mf.weight_g}g of ${mf.food_items.name}`} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center text-gray-500 py-4"><p>No food items added yet.</p></div>
        )}
        
        <div className="pt-3 border-t border-slate-700">
          <AddFoodToMealModal mealId={meal.id} foodItems={foodItems} />
        </div>
      </div>
    </Card>
  );
}