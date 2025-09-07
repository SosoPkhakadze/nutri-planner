// src/app/page.tsx (SIMPLIFIED BACK)
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }
  
  // The original, simple check
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!userProfile) {
    return redirect('/onboarding/1');
  }

  // --- User is valid and has completed onboarding ---
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Nutri-Planner
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-2">
            Hello <span className="font-semibold text-cyan-600 dark:text-cyan-400">{user.email}</span>!
          </p>
        </div>
        
        <div className="text-center">
            <SignOutButton />
        </div>
      </main>
    </div>
  );
}