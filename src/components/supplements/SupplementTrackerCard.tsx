// src/components/supplements/SupplementTrackerCard.tsx
'use client';

import { useTransition } from 'react';
import Card from '../ui/Card';
import { Pill } from 'lucide-react';
import { logSupplement, unlogSupplement } from '@/app/actions/tracking';
import Link from 'next/link';

// Use a more specific type that matches all the data we need
type Supplement = {
  id: string;
  name: string;
  dosage_amount: number | null;
  dosage_unit: string | null;
  calories_per_serving: number | null; // Add this
  protein_g_per_serving: number | null; // Add this
};

interface SupplementTrackerCardProps {
  activeSupplements: Supplement[];
  loggedSupplementIds: string[];
  date: string;
}

// Re-use the same clear formatting logic here
function formatDosage(sup: Supplement): string {
    const amount = sup.dosage_amount;
    const unit = sup.dosage_unit;
    if (amount && unit) return `${amount} ${unit}`;
    if (amount) return `${amount}`;
    if (unit) return unit;
    return '';
}

// Add the nutrition formatter here too
function formatNutrition(sup: Supplement): string {
    const parts = [];
    if (sup.calories_per_serving && sup.calories_per_serving > 0) {
        parts.push(`${sup.calories_per_serving} kcal`);
    }
    if (sup.protein_g_per_serving && sup.protein_g_per_serving > 0) {
        parts.push(`${sup.protein_g_per_serving}g Protein`);
    }
    return parts.join(' • ');
}


export default function SupplementTrackerCard({ 
  activeSupplements, 
  loggedSupplementIds, 
  date 
}: SupplementTrackerCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (supplementId: string, isLogged: boolean) => {
    startTransition(() => {
      if (isLogged) {
        unlogSupplement(supplementId, date);
      } else {
        logSupplement(supplementId, date);
      }
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Pill className="text-cyan-400" />
        Daily Supplements
      </h2>
      
      {activeSupplements.length > 0 ? (
        <ul className="space-y-3">
          {activeSupplements.map(sup => {
            const isLogged = loggedSupplementIds.includes(sup.id);
            const dosageString = formatDosage(sup);
            const nutritionString = formatNutrition(sup); // Use the helper
            return (
              <li key={sup.id}>
                <label className="flex items-center p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={isLogged}
                    onChange={() => handleToggle(sup.id, isLogged)}
                    disabled={isPending}
                    className="h-5 w-5 rounded bg-slate-600 border-slate-500 text-cyan-500 focus:ring-cyan-600 flex-shrink-0"
                  />
                  <div className="ml-3 min-w-0">
                    <p className={`font-medium truncate ${isLogged ? 'line-through text-gray-400' : ''}`}>{sup.name}</p>
                    {dosageString && (
                      <p className={`text-sm text-gray-400 truncate ${isLogged ? 'line-through' : ''}`}>
                        {dosageString}
                      </p>
                    )}
                    {/* ADDED: Display nutrition string if it exists */}
                    {nutritionString && (
                        <p className={`text-xs text-cyan-400/70 truncate mt-1 ${isLogged ? 'line-through' : ''}`}>
                            {nutritionString}
                        </p>
                    )}
                  </div>
                </label>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="text-center py-4 text-sm text-gray-400">
          <p>No active supplements.</p>
          <Link href="/supplements" className="text-cyan-400 hover:underline">
            Manage your supplements
          </Link>
        </div>
      )}
    </Card>
  );
}