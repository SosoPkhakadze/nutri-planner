// src/app/actions/food.ts
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// This action is for creating a personal, editable copy of a global food item.
export async function cloneFoodItem(foodItemId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  // 1. Fetch the original food item to clone
  const { data: originalFood, error: fetchError } = await supabase
    .from('food_items')
    .select('*')
    .eq('id', foodItemId)
    .single();

  if (fetchError || !originalFood) {
    return { error: 'Original food item not found.' };
  }

  // 2. Prepare the new food data, assigning ownership to the current user
  const { id, created_at, updated_at, ...clonableData } = originalFood;
  const newFoodData = {
    ...clonableData,
    owner_user_id: user.id,
    verified: false, // User's copy is not verified
    base_food_item_id: originalFood.id, // Link back to the original
  };

  // 3. Insert the new cloned item
  const { data: clonedFood, error: insertError } = await supabase
    .from('food_items')
    .insert(newFoodData)
    .select('id')
    .single();

  if (insertError) {
    console.error("Error cloning food item:", insertError);
    return { error: 'Database error: Could not clone food item.' };
  }

  revalidatePath('/food-db');
  return { success: true, newFoodItemId: clonedFood.id };
}

// This action resets a user's customized food item back to the original's stats.
export async function resetFoodItem(foodItemId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  // 1. Fetch the user's item to find the base_food_item_id
  const { data: userFood, error: userFoodError } = await supabase
    .from('food_items')
    .select('base_food_item_id')
    .eq('id', foodItemId)
    .eq('owner_user_id', user.id)
    .single();

  if (userFoodError || !userFood || !userFood.base_food_item_id) {
    return { error: 'Cannot reset this item. Original not found.' };
  }

  // 2. Fetch the original food data
  const { data: originalFood, error: originalFoodError } = await supabase
    .from('food_items')
    .select('*')
    .eq('id', userFood.base_food_item_id)
    .single();

  if (originalFoodError || !originalFood) {
    return { error: 'Original food data could not be retrieved.' };
  }

  // 3. Prepare data for the update (excluding identifying/metadata fields)
  const { id, owner_user_id, base_food_item_id, verified, created_at, updated_at, ...resettableData } = originalFood;

  // 4. Update the user's food item
  const { error: updateError } = await supabase
    .from('food_items')
    .update(resettableData)
    .eq('id', foodItemId)
    .eq('owner_user_id', user.id);
  
  if (updateError) {
    console.error("Error resetting food item:", updateError);
    return { error: 'Database error: Could not reset food item.' };
  }

  revalidatePath('/food-db');
  revalidatePath('/');
  return { success: true };
}


// Other actions (add, delete, update) remain largely the same
// ... [addFoodItem, deleteFoodItem, updateFoodItem code from previous step] ...

export async function addFoodItem(formData: FormData) {
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
    owner_user_id: user.id,
    tags: tags,
  };

  if (!foodData.name || !foodData.serving_size || !foodData.serving_unit || isNaN(foodData.calories)) {
    return { error: 'Please fill out all required fields.' };
  }

  const { error } = await supabase.from('food_items').insert(foodData);

  if (error) {
    console.error("Error adding food item:", error);
    return { error: 'Database error: Could not save food item.' };
  }

  revalidatePath('/food-db');
  return { success: true };
}

export async function deleteFoodItem(foodItemId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  // This will now delete both user-created and user-cloned food items.
  const { error } = await supabase.from('food_items').delete()
    .eq('id', foodItemId)
    .eq('owner_user_id', user.id);

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
      .eq('owner_user_id', user.id);
  
    if (error) {
      console.error("Error updating food item:", error);
      return { error: 'Database error: Could not update food item.' };
    }
  
    revalidatePath('/food-db');
    revalidatePath('/');
    return { success: true };
  }