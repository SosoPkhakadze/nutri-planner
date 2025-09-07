// src/app/actions/food.ts
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addFoodItem(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  const foodData = {
    name: formData.get('name') as string,
    brand: formData.get('brand') as string,
    serving_size: parseFloat(formData.get('serving_size') as string),
    serving_unit: formData.get('serving_unit') as string,
    calories: parseInt(formData.get('calories') as string),
    protein_g: parseFloat(formData.get('protein_g') as string),
    carbs_g: parseFloat(formData.get('carbs_g') as string),
    fat_g: parseFloat(formData.get('fat_g') as string),
    owner_user_id: user.id, // Assign ownership to the current user
  };

  // Basic validation
  if (!foodData.name || !foodData.serving_size || !foodData.serving_unit || isNaN(foodData.calories)) {
    return { error: 'Please fill out all required fields.' };
  }

  const { error } = await supabase.from('food_items').insert(foodData);

  if (error) {
    console.error("Error adding food item:", error);
    return { error: 'Database error: Could not save food item.' };
  }

  revalidatePath('/food-db'); // Revalidate the food DB page
  return { success: true };
}