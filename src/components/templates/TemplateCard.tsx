// src/components/templates/TemplateCard.tsx
'use client';

import { useState, useRef, useTransition, useMemo } from 'react';
import Card from "@/components/ui/Card";
import RemoveButton from "@/components/ui/RemoveButton";
import { CalendarDays, Utensils } from "lucide-react";
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
        router.refresh(); // Force a refresh to show new data
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
      <Card className="p-5 flex flex-col justify-between hover:border-cyan-500 transition-colors relative group">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <RemoveButton
            action={() => deleteTemplate(template.id)}
            itemDescription={`the "${template.title}" template`}
          />
        </div>
        <div>
          <h3 className="text-xl font-bold mb-3">{template.title}</h3>

          {/* Conditional content based on template type */}
          {isDayTemplate ? (
            <div className='text-sm text-gray-300 space-y-1'>
              <p className="font-semibold mb-2">Meals included:</p>
              <ul className='list-disc list-inside'>
                {template.data.map((meal: any) => (
                  <li key={meal.name} className='truncate'>{meal.name}</li>
                ))}
              </ul>
            </div>
          ) : (
            mealTemplateTotals && (
              <div className="text-xs font-mono space-y-1 text-gray-400">
                <div className="flex justify-between"><span>Calories:</span> <span className='font-semibold text-white'>{mealTemplateTotals.calories.toFixed(0)} kcal</span></div>
                <div className="flex justify-between"><span>Protein:</span> <span>{mealTemplateTotals.protein.toFixed(1)} g</span></div>
                <div className="flex justify-between"><span>Carbs:</span> <span>{mealTemplateTotals.carbs.toFixed(1)} g</span></div>
                <div className="flex justify-between"><span>Fat:</span> <span>{mealTemplateTotals.fat.toFixed(1)} g</span></div>
              </div>
            )
          )}
        </div>
        <button
          onClick={() => dialogRef.current?.showModal()}
          className="mt-4 w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition"
        >
          Apply Template
        </button>
      </Card>

      <dialog ref={dialogRef} className="bg-slate-800 text-white p-0 rounded-lg shadow-xl backdrop:bg-black/50 w-full max-w-sm">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Apply "{template.title}"</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="applyDate" className="block text-sm font-medium text-gray-300">
                Select a date to apply this template to:
              </label>
              <input
                type="date"
                id="applyDate"
                value={applyDate}
                onChange={(e) => setApplyDate(e.target.value)}
                className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2"
              />
            </div>
            <p className="text-xs text-gray-400">
              Warning: This will overwrite any existing meals on the selected date.
            </p>
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 rounded-md text-gray-300 hover:bg-slate-700">Cancel</button>
              <button onClick={handleApply} disabled={isPending} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 font-semibold rounded-md">
                {isPending ? 'Applying...' : 'Apply to Date'}
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}