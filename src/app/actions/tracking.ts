// src/app/actions/tracking.ts
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addWaterEntry(amount_ml: number, date: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  if (amount_ml <= 0) {
    return { error: 'Amount must be a positive number.' };
  }

  const { error } = await supabase.from('water_entries').insert({
    user_id: user.id,
    date: date,
    amount_ml: amount_ml,
  });

  if (error) {
    console.error("Error adding water entry:", error);
    return { error: 'Database error: Could not log water entry.' };
  }

  revalidatePath('/');
  return { success: true };
}

// NEW ACTION to remove the last entry for a specific day
export async function removeLastWaterEntry(date: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  // 1. Find the most recent water entry for the user on the given date
  const { data: lastEntry, error: fetchError } = await supabase
    .from('water_entries')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', date)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (fetchError || !lastEntry) {
    // This can happen if the user clicks undo when there's nothing to undo
    return { error: 'No water entry found to remove.' };
  }

  // 2. Delete that specific entry by its ID
  const { error: deleteError } = await supabase
    .from('water_entries')
    .delete()
    .eq('id', lastEntry.id);

  if (deleteError) {
    console.error("Error removing water entry:", deleteError);
    return { error: 'Database error: Could not remove water entry.' };
  }

  revalidatePath('/');
  return { success: true };
}