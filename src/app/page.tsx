// src/app/page.tsx (DASHBOARD REFACTOR)
import Header from "@/components/Header";
import Card from "@/components/ui/Card";
import ProgressRing from "@/components/ui/ProgressRing";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BarChart, Droplet, PlusCircle } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }
  
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('*') // Fetch all profile data now
    .eq('id', user.id)
    .single();

  if (!userProfile) {
    return redirect('/onboarding/1');
  }

  // --- Mock Data (for now) ---
  const consumedCalories = 1250;
  const targetCalories = userProfile.baseline_calories || 2000;
  const calorieProgress = (consumedCalories / targetCalories) * 100;

  const consumedProtein = 90;
  const targetProtein = 150;

  const consumedCarbs = 150;
  const targetCarbs = 200;
  
  const consumedFat = 45;
  const targetFat = 60;
  
  // --- End Mock Data ---

  return (
    <div>
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        {/* Top Header Row */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Today's Dashboard</h1>
            <p className="text-muted-gray">Welcome back, {user.email}</p>
          </div>
          <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition flex items-center gap-2">
            <PlusCircle size={18} />
            Quick Add
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Schedule */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
              <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-lg">
                <p className="text-muted-gray">No meals scheduled for today.</p>
                <button className="mt-4 text-cyan-400 hover:underline">
                  Add your first meal
                </button>
              </div>
            </Card>
          </div>

          {/* Right Column: Stats */}
          <div className="space-y-6">
            <Card className="p-6 flex flex-col items-center justify-center text-center">
              <h2 className="text-xl font-semibold mb-4">Calories</h2>
              <div className="relative">
                <ProgressRing progress={calorieProgress} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{consumedCalories}</span>
                  <span className="text-sm text-muted-gray">/ {targetCalories}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Macros</h2>
              <div className="space-y-4">
                {/* Protein */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Protein</span>
                    <span className="font-semibold">{consumedProtein}g / {targetProtein}g</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${(consumedProtein/targetProtein)*100}%` }}></div>
                  </div>
                </div>
                {/* Carbs */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Carbs</span>
                    <span className="font-semibold">{consumedCarbs}g / {targetCarbs}g</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${(consumedCarbs/targetCarbs)*100}%` }}></div>
                  </div>
                </div>
                {/* Fat */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fat</span>
                    <span className="font-semibold">{consumedFat}g / {targetFat}g</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${(consumedFat/targetFat)*100}%` }}></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}