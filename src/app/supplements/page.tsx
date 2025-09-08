// src/app/supplements/page.tsx
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AddSupplementModal from "@/components/supplements/AddSupplementModal";
import SupplementList from "@/components/supplements/SupplementList";

export default async function SupplementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: supplements } = await supabase
    .from('supplements')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  return (
    <div>
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-3xl font-bold">Your Supplements</h1>
          <AddSupplementModal />
        </div>
        
        <SupplementList initialSupplements={supplements || []} />
      </main>
    </div>
  );
}