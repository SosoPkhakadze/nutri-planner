// src/components/onboarding/Step3Finish.tsx
'use client';

import { useOnboardingStore } from '@/lib/store/onboarding';
import { completeOnboarding } from '@/app/actions/onboarding'; // We'll create this server action
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTransition } from 'react';

export default function Step3Finish() {
  const store = useOnboardingStore();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleComplete = () => {
    startTransition(async () => {
      const result = await completeOnboarding(store);
      if (result?.success) {
        router.push('/');
      } else {
        // Handle error, e.g., show a toast notification
        alert(result?.error || 'An unexpected error occurred.');
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-semibold">Ready to Go!</h2>
      <p className="text-gray-300">
        Based on your information, we've set up your initial profile. You can change these details anytime in your settings.
      </p>

      {/* You can optionally display a summary of the data from the store here */}
      <ul className="text-sm space-y-2 bg-slate-700 p-4 rounded-md">
        <li><strong>Goal:</strong> <span className="capitalize">{store.goal_type}</span></li>
        <li><strong>Activity:</strong> <span className="capitalize">{store.activity_level?.replace('_', ' ')}</span></li>
        <li><strong>Weight:</strong> {store.current_weight_kg} kg</li>
      </ul>

      <div className="flex items-center justify-between">
        <Link href="/onboarding/2" className="text-sm text-cyan-400 hover:underline">
          &larr; Back to Goals
        </Link>
        <button
          onClick={handleComplete}
          disabled={isPending}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving...' : 'Complete Setup'}
        </button>
      </div>
    </div>
  );
}