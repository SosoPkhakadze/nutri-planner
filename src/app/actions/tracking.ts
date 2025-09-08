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