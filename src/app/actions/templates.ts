// src/app/actions/templates.ts
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveDayAsTemplate(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  const templateName = formData.get('templateName') as string;
  const date = formData.get('date') as string;

  if (!templateName || !date) {
    return { error: 'Template name and date are required.' };
  }

  // 1. Fetch all meals and their foods for the given date
  const { data: meals, error: fetchError } = await supabase
    .from('meals')
    .select('*, meal_foods(*)')
    .eq('user_id', user.id)
    .eq('date', date);

  if (fetchError || !meals || meals.length === 0) {
    return { error: 'No meals found for the selected date to save.' };
  }

  // 2. Structure the data for the JSONB column
  // We only store the essential info, not user IDs or timestamps
  const templateData = meals.map(meal => ({
    name: meal.name,
    time: meal.time,
    order_index: meal.order_index,
    notes: meal.notes,
    foods: meal.meal_foods.map((mf: any) => ({
      food_item_id: mf.food_item_id,
      weight_g: mf.weight_g,
      custom_nutrition: mf.custom_nutrition,
    })),
  }));

  // 3. Insert into the templates table
  const { error: insertError } = await supabase.from('templates').insert({
    user_id: user.id,
    title: templateName,
    type: 'day', // This is a day template
    data: templateData, // Store the structured meal data
  });
  
  if (insertError) {
    console.error("Error saving template:", insertError);
    return { error: 'Database error: Could not save template.' };
  }

  // Revalidate the templates page when we build it
  // revalidatePath('/templates'); 

  return { success: true };
}

export async function applyTemplateToDate(templateId: string, date: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Authentication required.' };
  
    // 1. Fetch the template data, ensuring the user owns it
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('data')
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single();
  
    if (templateError || !template) {
      return { error: 'Template not found.' };
    }
  
    // 2. Delete any existing meals on the target date to prevent duplicates
    const { error: deleteError } = await supabase
      .from('meals')
      .delete()
      .eq('user_id', user.id)
      .eq('date', date);
    
    if (deleteError) {
      console.error("Error clearing existing meals:", deleteError);
      return { error: 'Could not clear existing meals for that day.' };
    }
  
    // 3. Create new meals based on the template data
    const templateMeals = template.data as any[];
    
    const newMeals = templateMeals.map(meal => ({
      user_id: user.id,
      date: date,
      name: meal.name,
      time: meal.time,
      notes: meal.notes,
      order_index: meal.order_index,
    }));
  
    const { data: insertedMeals, error: insertMealsError } = await supabase
      .from('meals')
      .insert(newMeals)
      .select();
  
    if (insertMealsError || !insertedMeals) {
      console.error("Error inserting template meals:", insertMealsError);
      return { error: 'Could not create new meals from the template.' };
    }
  
    // 4. Create the associated meal_foods for the new meals
    const newMealFoods: any[] = [];
    for (let i = 0; i < templateMeals.length; i++) {
      const templateMeal = templateMeals[i];
      const newMeal = insertedMeals[i];
      
      for (const food of templateMeal.foods) {
        newMealFoods.push({
          meal_id: newMeal.id,
          food_item_id: food.food_item_id,
          weight_g: food.weight_g,
          custom_nutrition: food.custom_nutrition,
        });
      }
    }
  
    if (newMealFoods.length > 0) {
      const { error: insertFoodsError } = await supabase
        .from('meal_foods')
        .insert(newMealFoods);
  
      if (insertFoodsError) {
        console.error("Error inserting template foods:", insertFoodsError);
        return { error: 'Could not add foods from the template.' };
      }
    }
    
    // 5. Revalidate paths to show the new data
    revalidatePath('/');
    revalidatePath('/planner');
    
    return { success: true };
  }

  export async function saveMealAsTemplate(mealId: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Authentication required.' };
  
    const templateName = formData.get('templateName') as string;
    if (!templateName) return { error: 'Template name is required.' };
  
    const { data: meal, error: fetchError } = await supabase
      .from('meals')
      .select('*, meal_foods(*)')
      .eq('user_id', user.id)
      .eq('id', mealId)
      .single();
  
    if (fetchError || !meal) {
      return { error: 'Meal not found or you do not have permission to save it.' };
    }
  
    if (meal.meal_foods.length === 0) {
      return { error: 'Cannot save an empty meal as a template.' };
    }
  
    const templateData = { // Note: data is an object, not an array
      name: meal.name,
      foods: meal.meal_foods.map((mf: any) => ({
        food_item_id: mf.food_item_id,
        weight_g: mf.weight_g,
      })),
    };
  
    const { error: insertError } = await supabase.from('templates').insert({
      user_id: user.id,
      title: templateName,
      type: 'meal', // This is a MEAL template
      data: templateData,
    });
  
    if (insertError) {
      console.error("Error saving meal template:", insertError);
      return { error: 'Database error: Could not save template.' };
    }
  
    revalidatePath('/templates');
    return { success: true };
  }