// src/app/actions/progress.ts
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addWeightLog(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  const date = formData.get('date') as string;
  const weight_kg = Number(formData.get('weight_kg'));

  if (!date || !weight_kg || weight_kg <= 0) {
    return { error: 'Valid date and positive weight are required.' };
  }

  const { data, error } = await supabase
    .from('weight_log')
    .upsert({ user_id: user.id, date, weight_kg }, { onConflict: 'user_id,date' })
    .select()
    .single();

  if (error) {
    console.error("Error adding weight log:", error);
    return { error: 'Database error: Could not save weight entry.' };
  }

  revalidatePath('/progress');
  return { success: true, data };
}

export async function deleteWeightLog(logId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  const { error } = await supabase
    .from('weight_log')
    .delete()
    .eq('id', logId)
    .eq('user_id', user.id);

  if (error) {
    console.error("Error deleting weight log:", error);
    return { error: 'Database error: Could not delete weight entry.' };
  }

  revalidatePath('/progress');
  return { success: true };
}