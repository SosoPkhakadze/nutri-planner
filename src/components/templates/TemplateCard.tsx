// src/components/templates/TemplateCard.tsx
'use client';

import { useState, useRef, useTransition, useMemo } from 'react';
import { GlassCard } from "@/components/ui/Card";
import RemoveButton from "@/components/ui/RemoveButton";
import { CalendarDays, Utensils, Clock, Sparkles, ChevronDown, CheckCircle2, X } from "lucide-react";
import { applyTemplateToDate, deleteTemplate } from '@/app/actions/templates';
import { useRouter } from 'next/navigation';
import type { FoodItem } from '@/lib/types';
import PrimaryButton from '../ui/PrimaryButton';

interface TemplateCardProps {
  template: any;
  foodItemsById: { [key: string]: FoodItem };
}

export default function TemplateCard({ template, foodItemsById }: TemplateCardProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  
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

  const templateTotals = useMemo(() => {
    const dataToCalculate = isDayTemplate ? template.data.flatMap((meal: any) => meal.foods) : template.data.foods;
    if (!dataToCalculate) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    return dataToCalculate.reduce((acc: any, food: any) => {
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
          {/* Header */}
          <header 
            className="relative p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-slate-700/50 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
              <RemoveButton
                action={() => deleteTemplate(template.id)}
                itemDescription={`the "${template.title}" template`}
              />
            </div>

            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="p-3 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl shadow-lg">
                  {isDayTemplate ? <CalendarDays size={24} className="text-white" /> : <Utensils size={24} className="text-white" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 truncate">{template.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock size={14} />
                    <span>{isDayTemplate ? `${template.data.length} Meals` : 'Single Meal'}</span>
                  </div>
                </div>
              </div>
              <ChevronDown size={24} className={`text-slate-400 transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`} />
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs font-medium">
              <span className="text-orange-400">{templateTotals.calories.toFixed(0)} kcal</span>
              <span className="text-red-400">{templateTotals.protein.toFixed(0)}g P</span>
              <span className="text-blue-400">{templateTotals.carbs.toFixed(0)}g C</span>
              <span className="text-yellow-400">{templateTotals.fat.toFixed(0)}g F</span>
            </div>
          </header>

          {/* Expandable Content */}
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[3000px]' : 'max-h-0'}`}>
            <div className="p-6 space-y-4">
              {isDayTemplate ? (
                template.data.map((meal: any) => (
                  <div key={meal.name} className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">{meal.name}</h4>
                    <ul className="space-y-1 text-sm text-slate-400">
                      {meal.foods.map((food: any, index: number) => {
                        const foodItem = foodItemsById[food.food_item_id];
                        return (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle2 size={12} className="text-cyan-400" />
                            <span>{food.weight_g}g of {foodItem ? foodItem.name : '[Deleted Food]'}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))
              ) : (
                <ul className="space-y-1 text-sm text-slate-300">
                  {template.data.foods.map((food: any, index: number) => {
                    const foodItem = foodItemsById[food.food_item_id];
                    return (
                      <li key={index} className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-md">
                        <CheckCircle2 size={14} className="text-cyan-400" />
                        <span>{food.weight_g}g of {foodItem ? foodItem.name : '[Deleted Food]'}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-700/50">
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
      <dialog ref={dialogRef} className="bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-sm p-4 w-full max-w-md rounded-2xl">
        <div className="bg-slate-900/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl w-full border border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-transparent flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Apply Template</h2>
              <p className="text-slate-400 mt-1 truncate">"{template.title}"</p>
            </div>
            <button onClick={() => dialogRef.current?.close()} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label htmlFor="applyDate" className="block text-sm font-medium text-slate-300 mb-2">
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
          
          <div className="p-6 bg-slate-900/70 border-t border-slate-700/50 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => dialogRef.current?.close()} 
              className="px-4 py-2 rounded-xl text-slate-300 bg-slate-800/50 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <PrimaryButton onClick={handleApply} disabled={isPending}>
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Applying...
                </div>
              ) : (
                'Apply to Date'
              )}
            </PrimaryButton>
          </div>
        </div>
      </dialog>
    </>
  );
}