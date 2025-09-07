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