// src/app/actions/tracking.ts
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- WATER ACTIONS (from previous step) ---
export async function addWaterEntry(amount_ml: number, date: string) {
  // ... (code from previous step, no changes needed)
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

export async function removeLastWaterEntry(date: string) {
  // ... (code from previous step, no changes needed)
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

// --- NEW SUPPLEMENT ACTIONS ---

export async function addSupplement(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  const supplementData = {
    user_id: user.id,
    name: formData.get('name') as string,
    dosage_amount: Number(formData.get('dosage_amount')) || null,
    dosage_unit: formData.get('dosage_unit') as string || null,
    calories_per_serving: parseInt(formData.get('calories_per_serving') as string) || 0,
    protein_g_per_serving: parseFloat(formData.get('protein_g_per_serving') as string) || 0,
  };

  if (!supplementData.name) {
    return { error: 'Supplement name is required.' };
  }

  const { error } = await supabase.from('supplements').insert(supplementData);
  if (error) {
    console.error('Error adding supplement:', error);
    return { error: 'Database error: Could not save supplement.' };
  }

  revalidatePath('/supplements');
  return { success: true };
}

export async function updateSupplement(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  const supplementData = {
    name: formData.get('name') as string,
    dosage_amount: Number(formData.get('dosage_amount')) || null,
    dosage_unit: formData.get('dosage_unit') as string || null,
    calories_per_serving: parseInt(formData.get('calories_per_serving') as string) || 0,
    protein_g_per_serving: parseFloat(formData.get('protein_g_per_serving') as string) || 0,
  };

  if (!supplementData.name) {
    return { error: 'Supplement name is required.' };
  }

  const { error } = await supabase.from('supplements').update(supplementData)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating supplement:', error);
    return { error: 'Database error: Could not update supplement.' };
  }

  revalidatePath('/supplements');
  return { success: true };
}

export async function deleteSupplement(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  const { error } = await supabase.from('supplements').delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting supplement:', error);
    return { error: 'Database error: Could not delete supplement.' };
  }

  revalidatePath('/supplements');
  return { success: true };
}

export async function toggleSupplementActive(id: string, newStatus: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  const { error } = await supabase.from('supplements').update({ is_active: newStatus })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error toggling supplement status:', error);
    return { error: 'Database error: Could not update supplement.' };
  }

  revalidatePath('/supplements');
  return { success: true };
}