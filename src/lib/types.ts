// src/lib/types.ts

// The core food item from your database
export interface FoodItem {
    id: string;
    owner_user_id: string | null;
    name: string;
    brand: string | null;
    serving_size: number;
    serving_unit: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    tags: string[] | null;
    verified: boolean;
    base_food_item_id: string | null;
    created_at: string;
    updated_at: string;
  }
  
  // An entry linking a food item to a specific meal, with weight
  export interface MealFood {
    id: string;
    meal_id: string;
    food_item_id: string;
    weight_g: number;
    order_index: number | null;
    food_items: FoodItem; // Supabase fetches the related food item
  }
  
  // A meal for a specific day
  export interface Meal {
    id: string;
    user_id: string;
    date: string;
    time: string;
    name: string;
    order_index: number | null;
    status: 'pending' | 'done';
    meal_foods: MealFood[];
  }

  export interface Supplement {
    id: string;
    user_id: string;
    name: string;
    dosage_amount: number | null;
    dosage_unit: string | null;
    calories_per_serving: number | null;
    protein_g_per_serving: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }