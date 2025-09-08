// src/lib/calorieCalculator.ts

interface UserProfileData {
    dob: string;
    gender: 'male' | 'female' | 'other';
    height_cm: number;
    current_weight_kg: number;
    activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    goal_type: 'cut' | 'maintain' | 'bulk' | 'recomp';
  }
  
  interface CaloricTargets {
    tdee: number;
    targetCalories: number;
  }
  
  interface MacroTargets {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }
  
  // Activity level multipliers - These are standard and remain the same.
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  
  // Goal-based calorie adjustments - These are standard and remain the same.
  const goalAdjustments = {
    cut: -500, // 500 calorie deficit for weight loss
    maintain: 0,
    bulk: 300, // A more conservative surplus to minimize fat gain
    recomp: 0, // Body recomp aims for maintenance calories
  };
  
  /**
   * Calculates the age of a person based on their date of birth.
   * @param dobString - Date of birth in 'YYYY-MM-DD' format.
   * @returns The age in years.
   */
  function calculateAge(dobString: string): number {
    const dob = new Date(dobString);
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  }
  
  /**
   * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation.
   * @param weight - Weight in kg.
   * @param height - Height in cm.
   * @param age - Age in years.
   * @param gender - 'male' or 'female'.
   * @returns The BMR value.
   */
  function calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female' | 'other'): number {
    if (gender === 'male') {
      // Male formula: 10 * weight + 6.25 * height - 5 * age + 5
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      // Female formula: 10 * weight + 6.25 * height - 5 * age - 161
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }
  
  /**
   * Calculates TDEE and target calories based on user profile data.
   * This function remains the same.
   * @param profile - The user's profile data.
   * @returns An object containing TDEE and target calories.
   */
  export function calculateCaloricTargets(profile: UserProfileData): CaloricTargets {
    const age = calculateAge(profile.dob);
    const bmr = calculateBMR(profile.current_weight_kg, profile.height_cm, age, profile.gender);
    
    const activityMultiplier = activityMultipliers[profile.activity_level];
    const tdee = Math.round(bmr * activityMultiplier);
  
    const goalAdjustment = goalAdjustments[profile.goal_type];
    const targetCalories = tdee + goalAdjustment;
  
    return { tdee, targetCalories };
  }
  
  /**
   * Calculates macronutrient targets based on target calories and body weight,
   * using a bodyweight-centric approach for protein and fat.
   * @param targetCalories - The daily target calorie intake.
   * @param weight_kg - The user's current weight in kg.
   * @param goal_type - The user's goal ('cut', 'maintain', 'bulk', 'recomp')
   * @returns An object containing protein, carbs, and fat targets in grams.
   */
  export function calculateMacroTargets(targetCalories: number, weight_kg: number, goal_type: 'cut' | 'maintain' | 'bulk' | 'recomp'): MacroTargets {
    
    // Protein: Higher end for cutting/recomp to preserve muscle, moderate for bulk/maintain.
    // Using 2.0g/kg for cut/recomp and 1.8g/kg for maintain/bulk.
    const proteinMultiplier = (goal_type === 'cut' || goal_type === 'recomp') ? 2.0 : 1.8;
    const protein_g = Math.round(proteinMultiplier * weight_kg);
    const proteinCalories = protein_g * 4;
  
    // Fat: Higher end for general health, slightly lower during a bulk to prioritize carbs.
    // Using 0.8g/kg as a healthy baseline.
    const fatMultiplier = 0.8;
    const fat_g = Math.round(fatMultiplier * weight_kg);
    const fatCalories = fat_g * 9;
  
    // Carbs: The remaining calories are allocated to carbohydrates for energy.
    const carbCalories = targetCalories - proteinCalories - fatCalories;
    // It's important to ensure carb calories don't go below zero on very aggressive cuts.
    const positiveCarbCalories = Math.max(0, carbCalories);
    const carbs_g = Math.round(positiveCarbCalories / 4);
  
    return { protein_g, carbs_g, fat_g };
  }