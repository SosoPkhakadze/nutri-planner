// src/app/actions/settings.ts
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateBaselineGoals(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  const profileData = {
    baseline_calories: Number(formData.get('baseline_calories')),
    daily_water_goal_ml: Number(formData.get('daily_water_goal_ml')),
    baseline_macros: {
      protein_g: Number(formData.get('protein_g')),
      carbs_g: Number(formData.get('carbs_g')),
      fat_g: Number(formData.get('fat_g')),
    },
  };

  const { error } = await supabase
    .from('user_profiles')
    .update(profileData)
    .eq('id', user.id);

  if (error) {
    console.error("Error updating baseline goals:", error);
    return { error: 'Database error: Could not save baseline goals.' };
  }
  
  revalidatePath('/settings');
  revalidatePath('/'); // Revalidate dashboard to reflect new baseline
  return { success: true };
}


export async function updateDailyGoal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  const date = formData.get('date') as string;
  if (!date) return { error: 'Date is required.' };
  
  // Helper to convert empty strings to null
  const getNullOrNumber = (value: FormDataEntryValue | null) => {
    const str = String(value);
    return str === '' ? null : Number(str);
  };

  const dailyGoalData = {
    user_id: user.id,
    date: date,
    calories: getNullOrNumber(formData.get('calories')),
    protein_g: getNullOrNumber(formData.get('protein_g')),
    carbs_g: getNullOrNumber(formData.get('carbs_g')),
    fat_g: getNullOrNumber(formData.get('fat_g')),
    water_ml: getNullOrNumber(formData.get('water_ml')),
  };

  const { error } = await supabase
    .from('daily_goals')
    .upsert(dailyGoalData, { onConflict: 'user_id,date' });

  if (error) {
    console.error("Error updating daily goal:", error);
    return { error: 'Database error: Could not save daily goal.' };
  }
  
  revalidatePath('/settings');
  revalidatePath('/'); // Revalidate dashboard to reflect new daily goal
  return { success: true };
}