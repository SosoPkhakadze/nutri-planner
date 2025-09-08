// src/app/page.tsx (FULL FILE)
import Header from "@/components/Header";
import Card from "@/components/ui/Card";
import ProgressRing from "@/components/ui/ProgressRing";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AddMealModal from "@/components/meals/AddMealModal";
import MealCard from "@/components/meals/MealCard";
import SaveDayAsTemplateModal from "@/components/templates/SaveDayAsTemplateModal";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default async function DashboardPage({ searchParams }: { searchParams: { date?: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) { return redirect("/login"); }
  
  const { data: userProfile } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
  if (!userProfile) { return redirect('/onboarding/1'); }

  // --- DATE LOGIC ---
  const toISODate = (date: Date) => date.toISOString().split('T')[0];
  const displayDate = searchParams.date ? new Date(searchParams.date) : new Date();
  const displayDateString = toISODate(displayDate);

  const prevDay = new Date(displayDate);
  prevDay.setDate(prevDay.getDate() - 1);
  const nextDay = new Date(displayDate);
  nextDay.setDate(nextDay.getDate() + 1);
  // --- END DATE LOGIC ---

  const { data: meals } = await supabase.from('meals')
    .select(`*, meal_foods (*, food_items (*))`)
    .eq('user_id', user.id)
    .eq('date', displayDateString) // Use the dynamic date
    .order('time', { ascending: true });

  const { data: foodItems } = await supabase.from('food_items').select('*').or(`owner_user_id.eq.${user.id},verified.eq.true`);

  let consumedCalories = 0, consumedProtein = 0, consumedCarbs = 0, consumedFat = 0;
  if (meals) {
    for (const meal of meals) {
      for (const mealFood of meal.meal_foods) {
        if (mealFood.food_items) {
          const multiplier = mealFood.weight_g / 100;
          consumedCalories += Math.round(mealFood.food_items.calories * multiplier);
          consumedProtein += mealFood.food_items.protein_g * multiplier;
          consumedCarbs += mealFood.food_items.carbs_g * multiplier;
          consumedFat += mealFood.food_items.fat_g * multiplier;
        }
      }
    }
  }

  const targetCalories = userProfile.baseline_calories || 2500;
  const targetProtein = userProfile.baseline_macros?.protein_g || 150;
  const targetCarbs = userProfile.baseline_macros?.carbs_g || 300;
  const targetFat = userProfile.baseline_macros?.fat_g || 70;
  const calorieProgress = targetCalories > 0 ? (consumedCalories / targetCalories) * 100 : 0;

  return (
    <div>
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          {/* DATE NAVIGATION */}
          <div className="flex items-center gap-4">
            <Link href={`/?date=${toISODate(prevDay)}`} className="p-2 rounded-md hover:bg-slate-700"><ChevronLeft /></Link>
            <h1 className="text-3xl font-bold">
              {displayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h1>
            <Link href={`/?date=${toISODate(nextDay)}`} className="p-2 rounded-md hover:bg-slate-700"><ChevronRight /></Link>
          </div>
          <div className="flex items-center gap-2">
            <SaveDayAsTemplateModal date={displayDateString} hasMeals={(meals?.length || 0) > 0} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Schedule</h2>
                {meals && meals.length > 0 && <AddMealModal />}
              </div>
              {meals && meals.length > 0 ? (
                <div>{meals.map((meal) => <MealCard key={meal.id} meal={meal} foodItems={foodItems || []} />)}</div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-lg">
                  <p className="text-gray-500">No meals scheduled for this day.</p><AddMealModal />
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            {/* CALORIES CARD - with overflow fix */}
            <Card className="p-6 flex flex-col items-center justify-center text-center">
                <h2 className="text-xl font-semibold mb-4">Calories</h2>
                <div className="relative">
                    <ProgressRing progress={calorieProgress > 100 ? 100 : calorieProgress} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`font-bold ${consumedCalories > 9999 ? 'text-xl' : 'text-2xl'}`}>{Math.round(consumedCalories).toLocaleString()}</span>
                    <span className="text-sm text-gray-400">/ {targetCalories.toLocaleString()}</span>
                    </div>
                </div>
            </Card>

            {/* MACROS CARD - with overflow fix */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Macros</h2>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1"><span>Protein</span><span className="font-semibold">{Math.round(consumedProtein)}g / {targetProtein}g</span></div>
                        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden"><div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${targetProtein > 0 ? Math.min(100, (consumedProtein/targetProtein)*100) : 0}%` }}></div></div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1"><span>Carbs</span><span className="font-semibold">{Math.round(consumedCarbs)}g / {targetCarbs}g</span></div>
                        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden"><div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${targetCarbs > 0 ? Math.min(100, (consumedCarbs/targetCarbs)*100) : 0}%` }}></div></div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1"><span>Fat</span><span className="font-semibold">{Math.round(consumedFat)}g / {targetFat}g</span></div>
                        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden"><div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${targetFat > 0 ? Math.min(100, (consumedFat/targetFat)*100) : 0}%` }}></div></div>
                    </div>
                </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}