// src/components/onboarding/Step2Goals.tsx
'use client';

import { useOnboardingStore } from '@/lib/store/onboarding';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise' },
  { value: 'light', label: 'Lightly Active', description: 'Exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderately Active', description: 'Exercise 3-5 days/week' },
  { value: 'active', label: 'Active', description: 'Exercise 6-7 days/week' },
  { value: 'very_active', label: 'Very Active', description: 'Hard exercise or physical job' },
];

const goals = [
  { value: 'cut', label: 'Lose Weight (Cut)' },
  { value: 'maintain', label: 'Maintain Weight' },
  { value: 'bulk', label: 'Gain Weight (Bulk)' },
  { value: 'recomp', label: 'Body Recomposition' },
];

export default function Step2Goals() {
  const { setData, activity_level, goal_type } = useOnboardingStore();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/onboarding/3'); // Navigate to the next step
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold mb-2">What's your activity level?</h2>
        <div className="space-y-3">
          {activityLevels.map((level) => (
            <label key={level.value} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${activity_level === level.value ? 'bg-cyan-600 border-cyan-500' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}>
              <input
                type="radio"
                name="activityLevel"
                value={level.value}
                checked={activity_level === level.value}
                onChange={(e) => setData({ activity_level: e.target.value })}
                className="sr-only" // Hide the default radio button
              />
              <div>
                <span className="font-medium">{level.label}</span>
                <p className="text-sm text-gray-300">{level.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-2">What's your primary goal?</h2>
        <div className="grid grid-cols-2 gap-3">
          {goals.map((goal) => (
            <label key={goal.value} className={`text-center p-4 rounded-lg border cursor-pointer transition-all ${goal_type === goal.value ? 'bg-cyan-600 border-cyan-500' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}>
              <input
                type="radio"
                name="goalType"
                value={goal.value}
                checked={goal_type === goal.value}
                onChange={(e) => setData({ goal_type: e.target.value })}
                className="sr-only"
              />
              <span className="font-medium">{goal.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link href="/onboarding/1" className="text-sm text-cyan-400 hover:underline">
          &larr; Back to Metrics
        </Link>
        <button
          type="submit"
          disabled={!activity_level || !goal_type}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          Next: Preferences
        </button>
      </div>
    </form>
  );
}