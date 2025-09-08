// src/app/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClientPage from "./DashboardClientPage";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }
  
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!userProfile) {
    return redirect("/onboarding/1");
  }

  const params = await searchParams;
  const toISODate = (date: Date) => date.toISOString().split("T")[0];

  let displayDate: Date;
  if (params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
      displayDate = new Date(params.date);
  } else {
      const today = new Date();
      displayDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  }

  if (isNaN(displayDate.getTime())) {
      const today = new Date();
      displayDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  }

  const displayDateString = toISODate(displayDate);

  const prevDay = new Date(displayDate);
  prevDay.setUTCDate(prevDay.getUTCDate() - 1);
  const nextDay = new Date(displayDate);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  // --- DATA FETCHING ---
  const [
    mealsRes, 
    waterRes, 
    foodItemsRes, 
    dayStatusRes, 
    supplementsRes, 
    supplementLogsRes
  ] = await Promise.all([
    supabase
      .from("meals")
      .select(`*, meal_foods (*, food_items (*))`)
      .eq("user_id", user.id)
      .eq("date", displayDateString)
      .order("order_index", { ascending: true }),
    supabase
      .from("water_entries")
      .select("amount_ml")
      .eq("user_id", user.id)
      .eq("date", displayDateString),
    supabase
      .from("food_items")
      .select("*")
      .or(`owner_user_id.eq.${user.id},verified.eq.true`),
    supabase
      .from("daily_log_status")
      .select("status")
      .eq("user_id", user.id)
      .eq("date", displayDateString)
      .single(),
    supabase
      .from("supplements")
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true),
    supabase
      .from("supplement_logs")
      .select('supplement_id')
      .eq('user_id', user.id)
      .eq('date', displayDateString)
  ]);
    
  // --- DATA PROCESSING ---
  const mealsData = mealsRes.data;
  const meals =
    mealsData?.map((meal) => ({
      ...meal,
      meal_foods: meal.meal_foods.sort(
        (a: { order_index?: number | null }, b: { order_index?: number | null }) =>
          (a.order_index ?? 0) - (b.order_index ?? 0)
      ),
    })) || [];
  
  const totalWaterMl = waterRes.data?.reduce((sum, entry) => sum + entry.amount_ml, 0) || 0;
  const foodItems = foodItemsRes.data ?? [];
  const dayStatus = (dayStatusRes.data?.status as "pending" | "complete") || "pending";
  const activeSupplements = supplementsRes.data || [];
  const loggedSupplementIds = supplementLogsRes.data?.map(log => log.supplement_id) || [];
  
  // Create a map for easy lookup
  const supplementMap = new Map(activeSupplements.map(s => [s.id, s]));

  // --- DAILY TOTALS CALCULATION ---
  let consumedCalories = 0,
    consumedProtein = 0,
    consumedCarbs = 0,
    consumedFat = 0;

  // Add calories/protein from meals
  if (meals) {
    for (const meal of meals) {
      if (meal.status === "done") { // Only 'done' meals are counted
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
  }

  // Add calories/protein from LOGGED supplements
  for (const supplementId of loggedSupplementIds) {
    const supplement = supplementMap.get(supplementId);
    if (supplement) {
      // This is the crucial part that adds supplement nutrition
      consumedCalories += supplement.calories_per_serving || 0;
      consumedProtein += supplement.protein_g_per_serving || 0;
      // Note: We don't add carbs or fat from supplements unless we add those fields later
    }
  }

  // --- PROPS FOR CLIENT COMPONENT ---
  const props = {
    initialMeals: meals,
    foodItems,
    date: {
      displayDateString,
      displayDateLocale: displayDate.toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", timeZone: "UTC",
      }),
      prevDay: toISODate(prevDay),
      nextDay: toISODate(nextDay),
    },
    dayStatus,
    dailyTotals: { consumedCalories, consumedProtein, consumedCarbs, consumedFat },
    targets: {
      calories: userProfile.baseline_calories || 2500,
      protein: userProfile.baseline_macros?.protein_g || 150,
      carbs: userProfile.baseline_macros?.carbs_g || 300,
      fat: userProfile.baseline_macros?.fat_g || 70,
    },
    totalWaterMl,
    dailyWaterGoalMl: userProfile.daily_water_goal_ml || 3000,
    // New props for supplements
    activeSupplements,
    loggedSupplementIds,
  };

  return <DashboardClientPage {...props} />;
}