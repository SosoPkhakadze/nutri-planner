// src/app/planner/page.tsx
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getWeekDays, getStartOfWeek } from '@/lib/dateUtils';
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DayColumn from "@/components/planner/DayColumn"; // Import our new component

interface PlannerPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function PlannerPage({ searchParams }: PlannerPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  // ✅ Await searchParams
  const params = await searchParams;
  
  // --- Date Calculation ---
  const toISODate = (date: Date) => date.toISOString().split('T')[0];
  const todayUTC = new Date(new Date().toISOString().split('T')[0]);

  let referenceDate: Date;
  if (params?.week && typeof params.week === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(params.week)) {
    referenceDate = new Date(params.week);
  } else {
    referenceDate = todayUTC;
  }
  if (isNaN(referenceDate.getTime())) referenceDate = todayUTC;

  const startOfWeek = getStartOfWeek(referenceDate);
  const days = getWeekDays(startOfWeek);
  
  const prevWeek = new Date(startOfWeek);
  prevWeek.setUTCDate(prevWeek.getUTCDate() - 7);
  const nextWeek = new Date(startOfWeek);
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);

  // --- Data Fetching ---
  const [profileRes, mealsRes, foodItemsRes] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("id", user.id).single(),
    supabase.from('meals').select(`*, meal_foods(*)`).eq('user_id', user.id).gte('date', toISODate(days[0])).lte('date', toISODate(days[6])).order('time', { ascending: true }),
    supabase.from('food_items').select('*').or(`owner_user_id.eq.${user.id},verified.eq.true`)
  ]);

  const userProfile = profileRes.data;
  if (!userProfile) return redirect('/onboarding/1');

  const meals = mealsRes.data || [];
  const foodItems = foodItemsRes.data || [];

  // --- Data Processing ---
  const foodItemsById = foodItems.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as { [key: string]: any });

  const mealsByDate = meals.reduce((acc, meal) => {
    if (!acc[meal.date]) acc[meal.date] = [];
    acc[meal.date].push(meal);
    return acc;
  }, {} as { [key: string]: any[] });

  const targets = {
    calories: userProfile.baseline_calories || 2500,
    protein: userProfile.baseline_macros?.protein_g || 150,
  };

  return (
    <div>
      <Header /> 
      <main className="container mx-auto p-4 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Weekly Planner</h1>
            <p className="text-slate-400 mt-1">Plan your nutrition for the week ahead.</p>
          </div>
          <div className="flex items-center gap-2 p-1 bg-slate-800 rounded-xl border border-slate-700">
            <Link href={`/planner?week=${toISODate(prevWeek)}`} className="p-3 rounded-lg hover:bg-slate-700 transition-colors"><ChevronLeft size={20} /></Link>
            <div className="px-4 text-center">
              <span className="font-semibold text-lg">{days[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
              <span className="text-slate-400"> - </span>
              <span className="font-semibold text-lg">{days[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</span>
            </div>
            <Link href={`/planner?week=${toISODate(nextWeek)}`} className="p-3 rounded-lg hover:bg-slate-700 transition-colors"><ChevronRight size={20} /></Link>
          </div>
        </div>

        {/* Grid of Day Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {days.map(day => {
            const dateStr = toISODate(day);
            const dayMeals = mealsByDate[dateStr] || [];
            
            // Calculate daily totals for completed meals
            const dailyTotals = dayMeals.reduce((acc: { calories: number; protein: number }, meal: any) => {
              if (meal.status === 'done') {
                meal.meal_foods.forEach((mf: any) => {
                  const foodItem = foodItemsById[mf.food_item_id];
                  if (foodItem) {
                    const multiplier = mf.weight_g / 100;
                    acc.calories += Math.round(foodItem.calories * multiplier);
                    acc.protein += foodItem.protein_g * multiplier;
                  }
                });
              }
              return acc;
            }, { calories: 0, protein: 0 });

            return (
              <DayColumn 
                key={dateStr}
                day={day}
                isToday={dateStr === toISODate(todayUTC)}
                meals={dayMeals}
                dailyTotals={dailyTotals}
                targets={targets}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}