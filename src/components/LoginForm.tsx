// src/components/LoginForm.tsx (CORRECTED)
'use client';

import { createClient } from '@/lib/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation'; // Import useRouter
import { useEffect } from 'react'; // Import useEffect

export default function LoginForm() {
  const supabase = createClient();
  const router = useRouter(); // Initialize the router

  // Add the listener back in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // A session is active. This can be after a sign-in or sign-up.
        // router.push('/') would work, but router.refresh() is often better
        // as it forces a server-side re-render, ensuring our server components
        // get the latest auth state.
        router.refresh();
      }
    });

    // Cleanup the subscription when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-8 text-center border-b border-gray-200 dark:border-slate-700">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Nutri-Planner
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Sign in to your nutrition dashboard
            </p>
          </div>
          <div className="p-8">
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              theme="dark"
              providers={['google']}
              redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`}
            />
          </div>
          <div className="p-6 bg-gray-50 dark:bg-slate-700/50 text-center border-t border-gray-200 dark:border-slate-600">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Secure authentication powered by Supabase
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}