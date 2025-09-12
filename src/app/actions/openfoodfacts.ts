// src/app/actions/openfoodfacts.ts
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Type definition for a simplified product from Open Food Facts API
interface OFFProduct {
  code: string;
  product_name: string;
  brands?: string;
  nutriments: {
    'energy-kcal_100g'?: number;
    'proteins_100g'?: number;
    'carbohydrates_100g'?: number;
    'fat_100g'?: number;
  };
  serving_size?: string; // e.g. "100 g"
}

// Type for the formatted food item ready for our database
interface FormattedFoodItem {
  name: string;
  brand?: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

/**
 * Searches the Open Food Facts API for a given query.
 * @param query The search term.
 * @returns A promise that resolves to an array of formatted food items.
 */
export async function searchOpenFoodFacts(query: string): Promise<FormattedFoodItem[]> {
  if (!query) return [];

  const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`;

  try {
    const response = await fetch(searchUrl);
    if (!response.ok) {
      console.error('Failed to fetch from Open Food Facts API');
      return [];
    }
    const data = await response.json();
    
    // Filter and format the products
    const formattedProducts = data.products
      .filter((product: OFFProduct) => 
        product.product_name &&
        product.nutriments['energy-kcal_100g'] &&
        product.nutriments['proteins_100g'] !== undefined &&
        product.nutriments['carbohydrates_100g'] !== undefined &&
        product.nutriments['fat_100g'] !== undefined
      )
      .map((product: OFFProduct): FormattedFoodItem => ({
        name: product.product_name,
        brand: product.brands || 'Unknown',
        serving_size: 100, // OFF data is per 100g
        serving_unit: 'g',
        calories: Math.round(product.nutriments['energy-kcal_100g']!),
        protein_g: Number(product.nutriments['proteins_100g']!.toFixed(1)),
        carbs_g: Number(product.nutriments['carbohydrates_100g']!.toFixed(1)),
        fat_g: Number(product.nutriments['fat_100g']!.toFixed(1)),
      }));

    return formattedProducts;

  } catch (error) {
    console.error('Error searching Open Food Facts:', error);
    return [];
  }
}

/**
 * Imports a selected food item from Open Food Facts into the user's personal food database.
 * @param foodData The formatted food item data to import.
 * @returns A promise that resolves with success status.
 */
export async function importFoodFromOFF(foodData: FormattedFoodItem) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  const foodToInsert = {
    ...foodData,
    owner_user_id: user.id,
    verified: false, // Items from OFF are user-owned, not globally verified by us
  };

  const { error } = await supabase.from('food_items').insert(foodToInsert);

  if (error) {
    console.error("Error importing food item:", error);
    return { error: 'Database error: Could not save imported food item.' };
  }

  revalidatePath('/food-db');
  return { success: true };
}