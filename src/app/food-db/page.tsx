// src/app/food-db/page.tsx
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";
// We will create these components next
import AddFoodItemModal from "@/components/food-db/AddFoodItemModal";

export default async function FoodDbPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Fetch food items owned by the user OR global verified items
  const { data: foodItems } = await supabase
    .from('food_items')
    .select('*')
    .or(`owner_user_id.eq.${user.id},verified.eq.true`)
    .order('name', { ascending: true });

  return (
    <div>
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Food Database</h1>
          <AddFoodItemModal />
        </div>

        <Card className="p-6">
          {foodItems && foodItems.length > 0 ? (
            <ul>
              {foodItems.map((item) => (
                <li key={item.id} className="p-3 border-b border-slate-700 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{item.name} <span className="text-sm font-normal text-gray-400">{item.brand ? `- ${item.brand}` : ''}</span></p>
                      <p className="text-sm text-gray-400">
                        {item.serving_size}{item.serving_unit} &bull; {item.calories} kcal &bull; P:{item.protein_g}g C:{item.carbs_g}g F:{item.fat_g}g
                      </p>
                    </div>
                    {/* Actions will go here */}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-8">Your food database is empty. Add your first item!</p>
          )}
        </Card>
      </main>
    </div>
  );
}