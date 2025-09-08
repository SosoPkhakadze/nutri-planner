// src/app/food-db/page.tsx
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import AddFoodItemModal from "@/components/food-db/AddFoodItemModal";
import RemoveButton from "@/components/ui/RemoveButton"; // Import
import { Pencil } from "lucide-react"; // Import

// We'll create this server action in the next step
// import { deleteFoodItem } from "@/app/actions/food";

export default async function FoodDbPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) { return redirect('/login'); }

  const { data: foodItems } = await supabase
    .from('food_items')
    .select('*')
    .or(`owner_user_id.eq.${user.id},verified.eq.true`)
    .order('name', { ascending: true });

  return (
    <div>
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-3xl font-bold">Food Database</h1>
          <div className="flex items-center gap-4">
            <input type="search" placeholder="Search foods..." className="bg-slate-700 p-2 rounded-md" />
            <AddFoodItemModal />
          </div>
        </div>

        <Card>
          {foodItems && foodItems.length > 0 ? (
            <ul className="divide-y divide-slate-700">
              {foodItems.map((item) => (
                <li key={item.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{item.name} <span className="text-sm font-normal text-gray-400">{item.brand ? `- ${item.brand}` : ''}</span></p>
                    <p className="text-sm text-gray-400 font-mono">
                      100g: {item.calories}kcal | P:{item.protein_g}g C:{item.carbs_g}g F:{item.fat_g}g
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="text-gray-400 hover:text-white"><Pencil size={16} /></button>
                    {/* The RemoveButton will be wired up in the next step */}
                    {/* <RemoveButton action={() => deleteFoodItem(item.id)} itemDescription={item.name} /> */}
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