// src/app/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClientPage from "./DashboardClientPage";

// The type here is now a Promise that resolves to the object
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

  // 👇 Await the searchParams promise here
  const params = await searchParams;
  const toISODate = (date: Date) => date.toISOString().split("T")[0];

  let displayDate: Date;
  // Check if a valid date string is provided, otherwise use today
  if (params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
      // Using new Date('YYYY-MM-DD') parses the date as UTC midnight, which is what we want.
      displayDate = new Date(params.date);
  } else {
      // If no date or invalid format, use today's UTC date.
      const today = new Date();
      displayDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  }

  // Fallback for any invalid date parsing
  if (isNaN(displayDate.getTime())) {
      const today = new Date();
      displayDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  }

  const displayDateString = toISODate(displayDate);

  const prevDay = new Date(displayDate);
  prevDay.setUTCDate(prevDay.getUTCDate() - 1);
  const nextDay = new Date(displayDate);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  // Fetch meals and water data in parallel
  const [mealsRes, waterRes] = await Promise.all([
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
      .eq("date", displayDateString)
  ]);
    
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

  const { data: foodItemsData } = await supabase
    .from("food_items")
    .select("*")
    .or(`owner_user_id.eq.${user.id},verified.eq.true`);
  const foodItems = foodItemsData ?? [];

  const { data: dayStatusData } = await supabase
    .from("daily_log_status")
    .select("status")
    .eq("user_id", user.id)
    .eq("date", displayDateString)
    .single();

  const dayStatus = (dayStatusData?.status as "pending" | "complete") || "pending";

  let consumedCalories = 0,
    consumedProtein = 0,
    consumedCarbs = 0,
    consumedFat = 0;

  if (meals) {
    for (const meal of meals) {
      if (meal.status === "done") {
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

  const props = {
    initialMeals: meals,
    foodItems,
    date: {
      displayDateString,
      displayDateLocale: displayDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: "UTC", // Specify UTC timezone for consistent display
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
    totalWaterMl, // Pass the new data as a prop
  };

  return <DashboardClientPage {...props} />;
}