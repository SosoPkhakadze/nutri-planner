// src/app/actions/meals.ts
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Action to reorder meals for a specific day
export async function reorderMeals(date: string, orderedMealIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  // Create an array of update promises
  const updates = orderedMealIds.map((id, index) =>
    supabase
      .from('meals')
      .update({ order_index: index })
      .eq('user_id', user.id)
      .eq('id', id)
      .eq('date', date)
  );

  const results = await Promise.all(updates);
  const error = results.find(res => res.error);

  if (error) {
    console.error('Error reordering meals:', error);
    return { error: 'Failed to reorder meals.' };
  }

  revalidatePath('/');
  return { success: true };
}

// Action to reorder food items within a meal
export async function reorderMealFoods(mealId: string, orderedMealFoodIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };
  
  // Security check could be added here to ensure user owns the meal
  
  const updates = orderedMealFoodIds.map((id, index) =>
    supabase
      .from('meal_foods')
      .update({ order_index: index })
      .eq('id', id)
      .eq('meal_id', mealId)
  );

  const results = await Promise.all(updates);
  const error = results.find(res => res.error);

  if (error) {
    console.error('Error reordering meal foods:', error);
    return { error: 'Failed to reorder items in meal.' };
  }

  revalidatePath('/');
  return { success: true };
}


// ... [existing meal actions: addMeal, addFoodToMeal, etc.] ...

export async function addMeal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };
  const mealName = formData.get('mealName') as string;
  const mealTime = formData.get('mealTime') as string;
  if (!mealName || !mealTime) return { error: 'Meal name and time are required.' };
  const today = new Date().toISOString().split('T')[0];
  const { error } = await supabase.from('meals').insert({ user_id: user.id, name: mealName, time: mealTime, date: today });
  if (error) { console.error("Error adding meal:", error); return { error: 'Database error: Could not add meal.' }; }
  revalidatePath('/'); return { success: true };
}

export async function addFoodToMeal(mealId: string, foodItemId: string, weightGrams: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };
  const { data: meal, error: mealError } = await supabase.from('meals').select('id').eq('id', mealId).eq('user_id', user.id).single();
  if (mealError || !meal) return { error: 'Meal not found or you do not have permission to edit it.' };
  const { error: insertError } = await supabase.from('meal_foods').insert({ meal_id: mealId, food_item_id: foodItemId, weight_g: weightGrams });
  if (insertError) { console.error("Error adding food to meal:", insertError); return { error: 'Database error: Could not add food to meal.' }; }
  revalidatePath('/'); return { success: true };
}

export async function removeFoodFromMeal(mealFoodId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };
  const { error } = await supabase.from('meal_foods').delete().eq('id', mealFoodId);
  if (error) { console.error("Error removing food from meal:", error); return { error: 'Database error: Could not remove food.' }; }
  revalidatePath('/'); return { success: true };
}

export async function deleteMeal(mealId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };
  const { error } = await supabase.from('meals').delete().eq('id', mealId).eq('user_id', user.id);
  if (error) { console.error("Error deleting meal:", error); return { error: 'Database error: Could not delete meal.' }; }
  revalidatePath('/'); return { success: true };
}

export async function updateMealFoodWeight(mealFoodId: string, newWeight: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Authentication required.' };
    if (newWeight <= 0) return { error: 'Weight must be a positive number.' };
    const { error } = await supabase.from('meal_foods').update({ weight_g: newWeight }).eq('id', mealFoodId);
    if (error) { console.error("Error updating meal food:", error); return { error: 'Database error: Could not update item.' }; }
    revalidatePath('/'); return { success: true };
  }

export async function toggleMealStatus(mealId: string, currentStatus: 'pending' | 'done') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Authentication required.' };
    const newStatus = currentStatus === 'pending' ? 'done' : 'pending';
    const { error } = await supabase.from('meals').update({ status: newStatus }).eq('id', mealId).eq('user_id', user.id);
    if (error) { console.error("Error updating meal status:", error); return { error: 'Database error: Could not update status.' }; }
    revalidatePath('/'); return { success: true };
  }