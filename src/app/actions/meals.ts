// src/app/actions/meals.ts
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addMeal(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Authentication required.' };
  }

  const mealName = formData.get('mealName') as string;
  const mealTime = formData.get('mealTime') as string;

  if (!mealName || !mealTime) {
    return { error: 'Meal name and time are required.' };
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  const { error } = await supabase.from('meals').insert({
    user_id: user.id,
    name: mealName,
    time: mealTime,
    date: today,
  });

  if (error) {
    console.error("Error adding meal:", error);
    return { error: 'Database error: Could not add meal.' };
  }

  // Revalidate the dashboard page to show the new meal immediately
  revalidatePath('/');

  return { success: true };
}