// src/components/templates/TemplateCard.tsx
'use client';

import { useState, useRef, useTransition, useMemo } from 'react';
import { GlassCard } from "@/components/ui/Card";
import RemoveButton from "@/components/ui/RemoveButton";
import { CalendarDays, Utensils, Clock, TrendingUp, Zap, Target, Sparkles } from "lucide-react";
import { applyTemplateToDate, deleteTemplate } from '@/app/actions/templates';
import { useRouter } from 'next/navigation';
import type { FoodItem } from '@/lib/types';

interface TemplateCardProps {
  template: any;
  foodItemsById: { [key: string]: FoodItem };
}

export default function TemplateCard({ template, foodItemsById }: TemplateCardProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const today = new Date().toISOString().split('T')[0];
  const [applyDate, setApplyDate] = useState(today);
  const isDayTemplate = template.type === 'day';

  const handleApply = () => {
    startTransition(async () => {
      const result = await applyTemplateToDate(template.id, applyDate);
      if (result?.success) {
        dialogRef.current?.close();
        router.push(`/planner?week=${applyDate}`);
        router.refresh();
      } else {
        alert(result?.error || 'Failed to apply template.');
      }
    });
  };

  const mealTemplateTotals = useMemo(() => {
    if (isDayTemplate || !template.data.foods) return null;

    return template.data.foods.reduce((acc: any, food: any) => {
      const foodItem = foodItemsById[food.food_item_id];
      if (foodItem) {
        const multiplier = food.weight_g / 100;
        acc.calories += Math.round(foodItem.calories * multiplier);
        acc.protein += foodItem.protein_g * multiplier;
        acc.carbs += foodItem.carbs_g * multiplier;
        acc.fat += foodItem.fat_g * multiplier;
      }
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [template, foodItemsById, isDayTemplate]);

  return (
    <>
      <div className="group relative">
        <GlassCard className="p-0 overflow-hidden hover:scale-[1.02] transition-all duration-300 hover:shadow-glow">
          {/* Header gradient */}
          <div className="relative p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-slate-700/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-2xl"></div>
            
            {/* Delete button */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
              <RemoveButton
                action={() => deleteTemplate(template.id)}
                itemDescription={`the "${template.title}" template`}
              />
            </div>

            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl shadow-lg">
                  {isDayTemplate ? (
                    <CalendarDays size={24} className="text-white" />
                  ) : (
                    <Utensils size={24} className="text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white mb-2 truncate">{template.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock size={14} />
                    <span>{isDayTemplate ? 'Full Day Plan' : 'Single Meal'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isDayTemplate ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                  <Target size={16} className="text-cyan-400" />
                  <span>Meals included</span>
                </div>
                <div className="grid gap-2">
                  {template.data.slice(0, 4).map((meal: any, index: number) => (
                    <div key={meal.name} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl">
                      <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
                      <span className="text-slate-300 truncate">{meal.name}</span>
                    </div>
                  ))}
                  {template.data.length > 4 && (
                    <div className="text-center text-sm text-slate-400 py-2">
                      +{template.data.length - 4} more meals
                    </div>
                  )}
                </div>
              </div>
            ) : (
              mealTemplateTotals && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                    <TrendingUp size={16} className="text-cyan-400" />
                    <span>Nutrition breakdown</span>
                  </div>
                  
                  {/* Nutrition stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-xs text-slate-400 uppercase tracking-wide">Calories</span>
                      </div>
                      <div className="text-lg font-bold text-white">{mealTemplateTotals.calories}</div>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-slate-400 uppercase tracking-wide">Protein</span>
                      </div>
                      <div className="text-lg font-bold text-white">{mealTemplateTotals.protein.toFixed(1)}g</div>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-slate-400 uppercase tracking-wide">Carbs</span>
                      </div>
                      <div className="text-lg font-bold text-white">{mealTemplateTotals.carbs.toFixed(1)}g</div>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs text-slate-400 uppercase tracking-wide">Fat</span>
                      </div>
                      <div className="text-lg font-bold text-white">{mealTemplateTotals.fat.toFixed(1)}g</div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Footer */}
          <div className="p-6 pt-0">
            <button
              onClick={() => dialogRef.current?.showModal()}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02]"
            >
              <Sparkles size={18} />
              Apply Template
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Modal */}
      <dialog ref={dialogRef} className="backdrop:bg-black/50 backdrop:backdrop-blur-sm p-0 bg-transparent">
        <div className="bg-slate-900/95 backdrop-blur-xl text-white p-0 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700/50">
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
            <h2 className="text-2xl font-bold text-white">Apply Template</h2>
            <p className="text-slate-400 mt-1">"{template.title}"</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label htmlFor="applyDate" className="block text-sm font-medium text-slate-300 mb-3">
                Select a date to apply this template:
              </label>
              <input
                type="date"
                id="applyDate"
                value={applyDate}
                onChange={(e) => setApplyDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl shadow-sm p-3 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-colors"
              />
            </div>
            
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div>
                  <h4 className="text-amber-400 font-medium">Warning</h4>
                  <p className="text-amber-300/80 text-sm mt-1">
                    This will overwrite any existing meals on the selected date.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 pt-0 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => dialogRef.current?.close()} 
              className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleApply} 
              disabled={isPending}
              className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Applying...
                </div>
              ) : (
                'Apply to Date'
              )}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}