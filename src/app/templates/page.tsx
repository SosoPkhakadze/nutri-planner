// src/app/templates/page.tsx
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TemplateCard from "@/components/templates/TemplateCard"; // We'll create this

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div>
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Templates</h1>
          {/* A button to create a new template from scratch could go here in the future */}
        </div>

        {templates && templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-800 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">No Templates Yet</h2>
            <p className="text-gray-400">Save a day's plan from the dashboard to reuse it later.</p>
          </div>
        )}
      </main>
    </div>
  );
}