// src/app/settings/SettingsClientPage.tsx
'use client';

import { useState, useTransition, useEffect } from 'react';
import { GlassCard } from '@/components/ui/Card';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { updateBaselineGoals, updateDailyGoal } from '../actions/settings';
import { createClient } from '@/lib/supabase/client';
import { Target, Calendar, Droplet } from 'lucide-react';

type UserProfile = {
  baseline_calories: number | null;
  baseline_macros: { protein_g: number; carbs_g: number; fat_g: number; } | null;
  daily_water_goal_ml: number | null;
  [key: string]: any;
};

type DailyGoal = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  water_ml: number;
};

export default function SettingsClientPage({ userProfile }: { userProfile: UserProfile }) {
  const [isBaselinePending, startBaselineTransition] = useTransition();
  const [isDailyPending, startDailyTransition] = useTransition();
  
  const [baselineCalories, setBaselineCalories] = useState(userProfile.baseline_calories || 2500);
  const [baselineProtein, setBaselineProtein] = useState(userProfile.baseline_macros?.protein_g || 150);
  const [baselineCarbs, setBaselineCarbs] = useState(userProfile.baseline_macros?.carbs_g || 300);
  const [baselineFat, setBaselineFat] = useState(userProfile.baseline_macros?.fat_g || 70);
  const [baselineWater, setBaselineWater] = useState(userProfile.daily_water_goal_ml || 3000);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyGoal, setDailyGoal] = useState<Partial<DailyGoal>>({});
  const [isFetchingGoal, setIsFetchingGoal] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchDailyGoal = async () => {
      if (!selectedDate) return;
      setIsFetchingGoal(true);
      const { data } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('date', selectedDate)
        .single();
      
      setDailyGoal(data || {});
      setIsFetchingGoal(false);
    };
    fetchDailyGoal();
  }, [selectedDate, supabase]);

  const handleBaselineSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startBaselineTransition(() => {
      const formData = new FormData(e.currentTarget);
      updateBaselineGoals(formData).then(res => {
        if (res.success) alert('Baseline goals updated!');
        else alert(res.error);
      });
    });
  };

  const handleDailySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startDailyTransition(() => {
      const formData = new FormData(e.currentTarget);
      formData.append('date', selectedDate);
      updateDailyGoal(formData).then(res => {
        if (res.success) alert(`Goals for ${selectedDate} saved!`);
        else alert(res.error);
      });
    });
  };

  const currentDailyCalories = dailyGoal?.calories ?? baselineCalories;
  const currentDailyProtein = dailyGoal?.protein_g ?? baselineProtein;
  const currentDailyCarbs = dailyGoal?.carbs_g ?? baselineCarbs;
  const currentDailyFat = dailyGoal?.fat_g ?? baselineFat;
  const currentDailyWater = dailyGoal?.water_ml ?? baselineWater;
  
  return (
    <>
      <div className="mb-12">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Settings & Goals
        </h1>
        <p className="text-slate-400 mt-1">Adjust your baseline targets and set goals for specific days.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Baseline Goals Section */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg"><Target size={20} className="text-purple-400" /></div>
            <h2 className="text-xl font-semibold text-white">Baseline Daily Goals</h2>
          </div>
          <GlassCard className="p-6">
            <form onSubmit={handleBaselineSubmit} className="space-y-4">
              <InputField label="Calories (kcal)" name="baseline_calories" type="number" value={baselineCalories} onChange={e => setBaselineCalories(Number(e.target.value))} />
              <InputField label="Protein (g)" name="protein_g" type="number" value={baselineProtein} onChange={e => setBaselineProtein(Number(e.target.value))} />
              <InputField label="Carbs (g)" name="carbs_g" type="number" value={baselineCarbs} onChange={e => setBaselineCarbs(Number(e.target.value))} />
              <InputField label="Fat (g)" name="fat_g" type="number" value={baselineFat} onChange={e => setBaselineFat(Number(e.target.value))} />
              <InputField label="Water (ml)" name="daily_water_goal_ml" type="number" value={baselineWater} onChange={e => setBaselineWater(Number(e.target.value))} />
              <div className="pt-4">
                <PrimaryButton type="submit" disabled={isBaselinePending} className="w-full">
                  {isBaselinePending ? 'Saving...' : 'Save Baseline Goals'}
                </PrimaryButton>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Daily Goals Override Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cyan-500/20 rounded-lg"><Calendar size={20} className="text-cyan-400" /></div>
            <h2 className="text-xl font-semibold text-white">Daily Goal Overrides</h2>
          </div>
          <GlassCard className="p-6">
            <div className="mb-6">
              <label htmlFor="date-picker" className="block text-sm font-medium text-slate-300 mb-2">Select a date to set or view specific goals. Future dates only.</label>
              <input 
                type="date" 
                id="date-picker"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto bg-slate-800 border border-slate-700 rounded-lg p-2"
              />
            </div>
            
            {isFetchingGoal ? <div className="text-center p-8">Loading daily goal...</div> :
            <form onSubmit={handleDailySubmit} className="space-y-4">
              <p className="text-sm text-slate-400">Leave fields blank to use the baseline goal for that metric.</p>
              <InputField label="Calories (kcal)" name="calories" type="number" placeholder={String(currentDailyCalories)} defaultValue={dailyGoal?.calories || ''} />
              <InputField label="Protein (g)" name="protein_g" type="number" placeholder={String(currentDailyProtein)} defaultValue={dailyGoal?.protein_g || ''} />
              <InputField label="Carbs (g)" name="carbs_g" type="number" placeholder={String(currentDailyCarbs)} defaultValue={dailyGoal?.carbs_g || ''} />
              <InputField label="Fat (g)" name="fat_g" type="number" placeholder={String(currentDailyFat)} defaultValue={dailyGoal?.fat_g || ''} />
              <InputField label="Water (ml)" name="water_ml" type="number" placeholder={String(currentDailyWater)} defaultValue={dailyGoal?.water_ml || ''} />
              <div className="pt-4">
                <PrimaryButton type="submit" disabled={isDailyPending} className="w-full">
                  {isDailyPending ? 'Saving...' : `Save Goals for ${selectedDate}`}
                </PrimaryButton>
              </div>
            </form>
            }
          </GlassCard>
        </div>
      </div>
    </>
  );
}

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <div>
    <label htmlFor={props.name} className="block text-sm font-medium text-slate-400">{props.label}</label>
    <input 
      id={props.name}
      className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-cyan-500/50"
      {...props}
    />
  </div>
);