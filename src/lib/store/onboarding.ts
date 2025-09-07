// src/lib/store/onboarding.ts
import { create } from 'zustand';

// Define the shape of your onboarding data based on your DB schema
interface OnboardingState {
  dob?: string;
  gender?: string;
  height_cm?: number;
  current_weight_kg?: number;
  body_fat_percent?: number;
  activity_level?: string;
  goal_type?: string;
  goal_rate?: number;
  dietary_preferences?: Record<string, any>;
  supplements?: any[];
  
  // Function to update the state
  setData: (data: Partial<OnboardingState>) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  setData: (data) => set((state) => ({ ...state, ...data })),
}));