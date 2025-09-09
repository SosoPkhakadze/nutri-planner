// src/app/settings/page.tsx
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsClientPage from "./SettingsClientPage";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userProfile) {
    // This shouldn't happen if they are logged in, but it's a good safeguard
    return redirect('/onboarding/1');
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <SettingsClientPage userProfile={userProfile} />
      </main>
    </div>
  );
}