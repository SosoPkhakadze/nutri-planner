// src/app/actions/onboarding.ts
'use server';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// This is the data type we expect from the client-side store
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

  if (!user) {
    return { error: 'You must be logged in to complete onboarding.' };
  }

  const { error } = await supabase.from('user_profiles').insert({
    id: user.id, // Link to the user's auth ID
    // Spread the rest of the data from the form
    ...data,
  });

  if (error) {
    console.error('Error completing onboarding:', error);
    return { error: 'Failed to save profile. Please try again.' };
  }
  
  return { success: true };
}