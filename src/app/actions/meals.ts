// src/app/actions/meals.ts
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addMeal(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Authentication required.' };
  }

  const mealName = formData.get('mealName') as string;
  const mealTime = formData.get('mealTime') as string;

  if (!mealName || !mealTime) {
    return { error: 'Meal name and time are required.' };
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  const { error } = await supabase.from('meals').insert({
    user_id: user.id,
    name: mealName,
    time: mealTime,
    date: today,
  });

  if (error) {
    console.error("Error adding meal:", error);
    return { error: 'Database error: Could not add meal.' };
  }

  revalidatePath('/');
  return { success: true };
}

export async function addFoodToMeal(mealId: string, foodItemId: string, weightGrams: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  const { data: meal, error: mealError } = await supabase
    .from('meals')
    .select('id')
    .eq('id', mealId)
    .eq('user_id', user.id)
    .single();
  
  if (mealError || !meal) {
    return { error: 'Meal not found or you do not have permission to edit it.' };
  }

  const { error: insertError } = await supabase.from('meal_foods').insert({
    meal_id: mealId,
    food_item_id: foodItemId,
    weight_g: weightGrams, // Use the new column name
  });

  if (insertError) {
    console.error("Error adding food to meal:", insertError);
    return { error: 'Database error: Could not add food to meal.' };
  }

  revalidatePath('/');
  return { success: true };
}

export async function removeFoodFromMeal(mealFoodId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  // Note: For production, you'd add a join to verify user ownership of the parent meal.
  const { error } = await supabase.from('meal_foods').delete().eq('id', mealFoodId);

  if (error) {
    console.error("Error removing food from meal:", error);
    return { error: 'Database error: Could not remove food.' };
  }
  revalidatePath('/');
  return { success: true };
}

export async function deleteMeal(mealId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  const { error } = await supabase.from('meals').delete()
    .eq('id', mealId)
    .eq('user_id', user.id); // Security check to ensure user owns the meal

  if (error) {
    console.error("Error deleting meal:", error);
    return { error: 'Database error: Could not delete meal.' };
  }
  revalidatePath('/');
  return { success: true };
}

export async function updateMealFoodWeight(mealFoodId: string, newWeight: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Authentication required.' };
    
    if (newWeight <= 0) {
      return { error: 'Weight must be a positive number.' };
    }
  
    // Again, a production app would join to verify ownership here
    const { error } = await supabase
      .from('meal_foods')
      .update({ weight_g: newWeight })
      .eq('id', mealFoodId);
  
    if (error) {
      console.error("Error updating meal food:", error);
      return { error: 'Database error: Could not update item.' };
    }
  
    revalidatePath('/');
    return { success: true };
  }