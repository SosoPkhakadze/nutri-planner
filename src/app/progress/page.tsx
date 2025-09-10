// src/app/progress/page.tsx
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProgressClientPage from "./ProgressClientPage";

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: weightLogs } = await supabase
    .from('weight_log')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true });

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('current_weight_kg')
    .eq('id', user.id)
    .single();

  return (
    <div>
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <ProgressClientPage 
          initialLogs={weightLogs || []} 
          initialWeight={userProfile?.current_weight_kg || 0}
        />
      </main>
    </div>
  );
}