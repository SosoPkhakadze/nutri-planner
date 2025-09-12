// src/app/planner/page.tsx
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getWeekDays, getStartOfWeek } from '@/lib/dateUtils';
import PlannerClientPage from "./PlannerClientPage";

interface PlannerPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function PlannerPage({ searchParams }: PlannerPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const params = await searchParams;
  
  const toISODate = (date: Date) => date.toISOString().split('T')[0];
  
  // This server-side "today" is in UTC. The client will handle local "today".
  const serverTodayUTC = new Date(new Date().toISOString().split('T')[0]);

  let referenceDate: Date;
  if (params?.week && typeof params.week === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(params.week)) {
    // Parse the week start date from URL as UTC
    referenceDate = new Date(`${params.week}T00:00:00.000Z`);
  } else {
    referenceDate = serverTodayUTC;
  }
  if (isNaN(referenceDate.getTime())) referenceDate = serverTodayUTC;

  const startOfWeek = getStartOfWeek(referenceDate);
  const days = getWeekDays(startOfWeek);
  
  const prevWeekStart = new Date(startOfWeek);
  prevWeekStart.setUTCDate(prevWeekStart.getUTCDate() - 7);
  const nextWeekStart = new Date(startOfWeek);
  nextWeekStart.setUTCDate(nextWeekStart.getUTCDate() + 7);

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

  // Props for the client component
  const clientProps = {
    initialDays: days.map(d => d.toISOString()), // Pass dates as strings
    initialMealsByDate: mealsByDate,
    initialFoodItemsById: foodItemsById,
    targets,
    weekNav: {
      prevWeek: toISODate(prevWeekStart),
      nextWeek: toISODate(nextWeekStart),
    },
  };

  return (
    <div>
      <Header /> 
      <main className="container mx-auto p-4 md:p-8">
        <PlannerClientPage {...clientProps} />
      </main>
    </div>
  );
}