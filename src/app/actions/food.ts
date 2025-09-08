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

export async function deleteFoodItem(foodItemId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  // Security check: only allow users to delete their own food items.
  // We prevent deleting global 'verified' items for now.
  const { error } = await supabase.from('food_items').delete()
    .eq('id', foodItemId)
    .eq('owner_user_id', user.id); // Ensures you can't delete others' items

  if (error) {
    console.error("Error deleting food item:", error);
    return { error: 'Database error: Could not delete food item.' };
  }

  revalidatePath('/food-db');
  return { success: true };
}

export async function updateFoodItem(foodItemId: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Authentication required.' };
  
    // Parse and clean tags
    const tagsString = formData.get('tags') as string;
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(Boolean) : [];
  
    const foodData = {
      name: formData.get('name') as string,
      brand: formData.get('brand') as string,
      serving_size: parseFloat(formData.get('serving_size') as string),
      serving_unit: formData.get('serving_unit') as string,
      calories: parseInt(formData.get('calories') as string),
      protein_g: parseFloat(formData.get('protein_g') as string),
      carbs_g: parseFloat(formData.get('carbs_g') as string),
      fat_g: parseFloat(formData.get('fat_g') as string),
      tags: tags,
    };
  
    const { error } = await supabase.from('food_items').update(foodData)
      .eq('id', foodItemId)
      .eq('owner_user_id', user.id); // Security check
  
    if (error) {
      console.error("Error updating food item:", error);
      return { error: 'Database error: Could not update food item.' };
    }
  
    revalidatePath('/food-db');
    revalidatePath('/'); // Revalidate dashboard in case the food is used there
    return { success: true };
  }