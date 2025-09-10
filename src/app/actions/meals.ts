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

// --- NEW ACTIONS ---

export async function copyMealToDate(mealId: string, targetDate: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  // 1. Fetch the original meal and its foods
  const { data: originalMeal, error: fetchError } = await supabase
    .from('meals')
    .select('*, meal_foods(*)')
    .eq('id', mealId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !originalMeal) {
    return { error: 'Original meal not found.' };
  }

  // 2. Prepare the new meal data
  const { id, created_at, updated_at, date, ...clonableMealData } = originalMeal;
  const newMealData = {
    ...clonableMealData,
    date: targetDate,
    user_id: user.id,
    status: 'pending' as const,
  };

  // 3. Insert the new meal
  const { data: newMeal, error: insertMealError } = await supabase
    .from('meals')
    .insert(newMealData)
    .select('id')
    .single();

  if (insertMealError || !newMeal) {
    console.error("Error copying meal:", insertMealError);
    return { error: 'Database error: Could not copy meal.' };
  }

  // 4. Prepare and insert the new meal foods
  if (originalMeal.meal_foods && originalMeal.meal_foods.length > 0) {
    const newMealFoodsData = originalMeal.meal_foods.map((food: any) => ({
      meal_id: newMeal.id,
      food_item_id: food.food_item_id,
      weight_g: food.weight_g,
      order_index: food.order_index,
      custom_nutrition: food.custom_nutrition,
    }));

    const { error: insertFoodsError } = await supabase
      .from('meal_foods')
      .insert(newMealFoodsData);

    if (insertFoodsError) {
      console.error("Error copying meal foods:", insertFoodsError);
      await supabase.from('meals').delete().eq('id', newMeal.id);
      return { error: 'Database error: Could not copy foods for the meal.' };
    }
  }

  revalidatePath('/');
  revalidatePath('/planner');
  return { success: true };
}

export async function copyDayToDate(sourceDate: string, targetDate: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Authentication required.' };
    if (sourceDate === targetDate) return { error: 'Source and target dates cannot be the same.' };

    const { data: sourceMeals, error: fetchError } = await supabase
        .from('meals')
        .select('*, meal_foods(*)')
        .eq('user_id', user.id)
        .eq('date', sourceDate);

    if (fetchError) {
        console.error("Error fetching source day meals:", fetchError);
        return { error: 'Could not retrieve data for the source day.' };
    }
    if (!sourceMeals || sourceMeals.length === 0) {
        return { error: 'No meals found on the source date to copy.' };
    }

    const { error: deleteError } = await supabase
        .from('meals')
        .delete()
        .eq('user_id', user.id)
        .eq('date', targetDate);
    
    if (deleteError) {
        console.error("Error clearing existing meals on target date:", deleteError);
        return { error: 'Could not clear existing meals for the target day.' };
    }
  
    const newMealsToInsert = sourceMeals.map(meal => ({
      user_id: user.id,
      date: targetDate,
      name: meal.name,
      time: meal.time,
      notes: meal.notes,
      order_index: meal.order_index,
      status: 'pending' as const,
    }));
  
    const { data: insertedMeals, error: insertMealsError } = await supabase
      .from('meals')
      .insert(newMealsToInsert)
      .select('id');
  
    if (insertMealsError || !insertedMeals) {
      console.error("Error inserting copied meals:", insertMealsError);
      return { error: 'Could not create new meals for the target day.' };
    }
  
    const newMealFoods: any[] = [];
    for (let i = 0; i < sourceMeals.length; i++) {
        const sourceMeal = sourceMeals[i];
        const newMeal = insertedMeals[i];
        
        if (sourceMeal.meal_foods && sourceMeal.meal_foods.length > 0) {
            for (const food of sourceMeal.meal_foods) {
                newMealFoods.push({
                    meal_id: newMeal.id,
                    food_item_id: food.food_item_id,
                    weight_g: food.weight_g,
                    custom_nutrition: food.custom_nutrition,
                    order_index: food.order_index,
                });
            }
        }
    }
  
    if (newMealFoods.length > 0) {
        const { error: insertFoodsError } = await supabase
            .from('meal_foods')
            .insert(newMealFoods);
    
        if (insertFoodsError) {
            console.error("Error inserting copied foods:", insertFoodsError);
            return { error: 'Could not add foods from the source day.' };
        }
    }
    
    revalidatePath('/');
    revalidatePath('/planner');
    return { success: true };
}