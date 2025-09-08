// src/app/templates/page.tsx
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TemplateCard from "@/components/templates/TemplateCard";
import type { FoodItem } from "@/lib/types";
import { Utensils, CalendarDays } from "lucide-react";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Fetch templates and all of the user's food items in parallel
  const [templatesRes, foodItemsRes] = await Promise.all([
    supabase
      .from('templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('food_items')
      .select('*')
      .or(`owner_user_id.eq.${user.id},verified.eq.true`)
  ]);

  const templates = templatesRes.data || [];
  const foodItems = foodItemsRes.data || [];

  // Create a map for quick lookups to calculate meal template macros
  const foodItemsById = foodItems.reduce((acc: { [key: string]: FoodItem }, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

  // Separate templates by type
  const dayTemplates = templates.filter(t => t.type === 'day');
  const mealTemplates = templates.filter(t => t.type === 'meal');

  return (
    <div>
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Templates</h1>
        </div>

        {templates.length > 0 ? (
          <div className="space-y-12">
            {/* Day Templates Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3"><CalendarDays /> Day Templates</h2>
              {dayTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dayTemplates.map(template => (
                    <TemplateCard key={template.id} template={template} foodItemsById={foodItemsById} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No day templates found. Save a day's plan from the dashboard to create one.</p>
              )}
            </section>

            {/* Meal Templates Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3"><Utensils /> Meal Templates</h2>
              {mealTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mealTemplates.map(template => (
                    <TemplateCard key={template.id} template={template} foodItemsById={foodItemsById} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No meal templates found. Save a meal from the dashboard to create one.</p>
              )}
            </section>
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-800 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">No Templates Yet</h2>
            <p className="text-gray-400">Save a day's plan or a specific meal from the dashboard to reuse it later.</p>
          </div>
        )}
      </main>
    </div>
  );
}