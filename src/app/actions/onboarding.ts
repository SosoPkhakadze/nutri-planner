// src/app/actions/onboarding.ts
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface OnboardingData {
  dob?: string;
  gender?: string;
  height_cm?: number;
  current_weight_kg?: number;
  activity_level?: string;
  goal_type?: string;
}

export async function completeOnboarding(data: OnboardingData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in to complete onboarding.' };
  const baselineData = { baseline_calories: 2500, baseline_macros: { protein_g: 180, carbs_g: 250, fat_g: 80 } };
  const { error } = await supabase.from('user_profiles').insert({ id: user.id, ...data, ...baselineData });
  if (error) { console.error('Error completing onboarding:', error); return { error: 'Failed to save profile. Please try again.' }; }
  return { success: true };
}

// New action to toggle the status of an entire day
export async function toggleDayStatus(date: string, currentStatus: 'pending' | 'complete') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  const newStatus = currentStatus === 'pending' ? 'complete' : 'pending';

  // "Upsert" operation: Insert a new status or update it if it already exists for that day.
  const { error } = await supabase
    .from('daily_log_status')
    .upsert({ user_id: user.id, date: date, status: newStatus }, { onConflict: 'user_id,date' });
  
  if (error) {
    console.error("Error updating day status:", error);
    return { error: 'Database error: Could not update day status.' };
  }

  revalidatePath('/');
  return { success: true };
}