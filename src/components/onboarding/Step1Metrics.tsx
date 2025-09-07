// src/components/onboarding/Step1Metrics.tsx
'use client';

import { useOnboardingStore } from '@/lib/store/onboarding';
import { useRouter } from 'next/navigation';

export default function Step1Metrics() {
  const { setData, dob, gender, height_cm, current_weight_kg } = useOnboardingStore();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would add validation
    router.push('/onboarding/2'); // Navigate to the next step
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-semibold">Tell us about yourself</h2>
      
      <div>
        <label htmlFor="dob" className="block text-sm font-medium text-gray-400">Date of Birth</label>
        <input 
          type="date" 
          id="dob"
          value={dob || ''}
          onChange={(e) => setData({ dob: e.target.value })}
          className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2"
          required 
        />
      </div>

      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-400">Gender (Optional)</label>
        <select
          id="gender"
          value={gender || ''}
          onChange={(e) => setData({ gender: e.target.value })}
          className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2"
        >
          <option value="">Select...</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="height" className="block text-sm font-medium text-gray-400">Height (cm)</label>
        <input 
          type="number" 
          id="height"
          value={height_cm || ''}
          onChange={(e) => setData({ height_cm: parseFloat(e.target.value) })}
          className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2"
          required 
        />
      </div>

      <div>
        <label htmlFor="weight" className="block text-sm font-medium text-gray-400">Current Weight (kg)</label>
        <input 
          type="number" 
          id="weight"
          value={current_weight_kg || ''}
          onChange={(e) => setData({ current_weight_kg: parseFloat(e.target.value) })}
          className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2"
          required 
        />
      </div>

      <button 
        type="submit"
        className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition"
      >
        Next: Your Goals
      </button>
    </form>
  );
}