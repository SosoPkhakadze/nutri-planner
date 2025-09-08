// src/app/planner/page.tsx
// NO 'use client' directive. This is a Server Component.

import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getWeekDays, getStartOfWeek } from '@/lib/dateUtils';
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PlannerMealCard from "@/components/planner/PlannerMealCard";

interface PlannerPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function PlannerPage({ searchParams }: PlannerPageProps) {
  const params = await searchParams;
  const weekQuery = params?.week;
  const toISODate = (date: Date) => date.toISOString().split('T')[0];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  let referenceDate: Date;
  if (weekQuery && typeof weekQuery === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(weekQuery)) {
    // new Date('YYYY-MM-DD') parses as UTC midnight, which is correct.
    referenceDate = new Date(weekQuery);
  } else {
    // If no date, use today's UTC date.
    const today = new Date();
    referenceDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  }

  // Fallback for any invalid date parsing
  if (isNaN(referenceDate.getTime())) {
    const today = new Date();
    referenceDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  }

  const startOfWeek = getStartOfWeek(referenceDate);
  const days = getWeekDays(startOfWeek);
  
  const prevWeek = new Date(startOfWeek);
  prevWeek.setUTCDate(prevWeek.getUTCDate() - 7);
  const nextWeek = new Date(startOfWeek);
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);

  const { data: meals } = await supabase
    .from('meals')
    .select(`*, meal_foods(*)`)
    .eq('user_id', user.id)
    .gte('date', toISODate(days[0]))
    .lte('date', toISODate(days[6]))
    .order('time', { ascending: true });

  const mealsByDate: { [key: string]: any[] } = {};
  if (meals) {
    for (const meal of meals) {
      if (!mealsByDate[meal.date]) {
        mealsByDate[meal.date] = [];
      }
      mealsByDate[meal.date].push(meal);
    }
  }

  return (
    <div>
      <Header /> 
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Weekly Planner</h1>
          <div className="flex items-center gap-4">
            <Link href={`/planner?week=${toISODate(prevWeek)}`} className="p-2 rounded-md hover:bg-slate-700"><ChevronLeft /></Link>
            <span className="font-semibold text-lg">{days[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })} - {days[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</span>
            <Link href={`/planner?week=${toISODate(nextWeek)}`} className="p-2 rounded-md hover:bg-slate-700"><ChevronRight /></Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {days.map(day => {
            const dateStr = toISODate(day);
            const dayMeals = mealsByDate[dateStr] || [];

            return (
              // This is the main day container, now wrapped in a Link
              <Link href={`/?date=${dateStr}`} key={dateStr} className="block bg-slate-800 rounded-lg p-3 min-h-[200px] hover:bg-slate-700/50 transition-colors">
                <h3 className="font-bold text-center mb-3">
                  {day.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })}
                  <span className="block text-sm text-gray-400 font-normal">{day.getUTCDate()}</span>
                </h3>
                <div className="space-y-2">
                  {dayMeals.length > 0 ? (
                    dayMeals.map(meal => (
                      // Each meal card can have its own interaction in the future
                      <PlannerMealCard key={meal.id} meal={meal} />
                    ))
                  ) : (
                    // Placeholder for empty days to ensure the link target is clickable
                    <div className="h-full"></div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}