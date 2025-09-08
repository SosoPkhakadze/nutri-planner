// src/app/actions/onboarding.ts
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { calculateCaloricTargets, calculateMacroTargets } from "@/lib/calorieCalculator";

interface OnboardingData {
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  height_cm?: number;
  current_weight_kg?: number;
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal_type?: 'cut' | 'maintain' | 'bulk' | 'recomp';
}

export async function completeOnboarding(data: OnboardingData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in to complete onboarding.' };

  const requiredFields: (keyof OnboardingData)[] = ['dob', 'gender', 'height_cm', 'current_weight_kg', 'activity_level', 'goal_type'];
  for (const field of requiredFields) {
    if (!data[field]) {
      return { error: `Missing required information: ${field}. Please go back and complete all steps.` };
    }
  }

  const calculationData = data as Required<OnboardingData>;

  const { targetCalories } = calculateCaloricTargets(calculationData);

  // *** THE ONLY CHANGE IS HERE: Pass the goal type to the macro calculator ***
  const baseline_macros = calculateMacroTargets(
    targetCalories,
    calculationData.current_weight_kg,
    calculationData.goal_type // Pass the goal
  );

  const profileData = {
    id: user.id,
    ...data,
    baseline_calories: targetCalories,
    baseline_macros: baseline_macros,
  };

  const { error } = await supabase.from('user_profiles').insert(profileData);
  
  if (error) { 
    console.error('Error completing onboarding:', error); 
    if (error.code === '23505') {
        return { error: 'A profile already exists for this user.' };
    }
    return { error: 'Failed to save profile. Please try again.' }; 
  }

  return { success: true };
}

// toggleDayStatus remains unchanged
export async function toggleDayStatus(date: string, currentStatus: 'pending' | 'complete') {
    // ... code is unchanged
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Authentication required.' };
  
    const newStatus = currentStatus === 'pending' ? 'complete' : 'pending';
  
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