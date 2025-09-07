// src/app/login/page.tsx (UPDATED)
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm'; // We will create this next

export default async function LoginPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // If user is already logged in, send them to the home page.
    // The home page will handle the onboarding redirect if needed.
    redirect('/');
  }

  return <LoginForm />;
}