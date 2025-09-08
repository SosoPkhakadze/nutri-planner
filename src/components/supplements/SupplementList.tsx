// src/components/supplements/SupplementList.tsx
'use client';

import { useState, useTransition } from 'react';
import Card from '../ui/Card';
import RemoveButton from '../ui/RemoveButton';
import { deleteSupplement, toggleSupplementActive } from '@/app/actions/tracking';
import { Pencil } from 'lucide-react';
import EditSupplementModal from './EditSupplementModal';

type Supplement = {
  id: string;
  name: string;
  dosage_amount: number | null;
  dosage_unit: string | null;
  calories_per_serving: number | null;
  protein_g_per_serving: number | null;
  is_active: boolean;
};

interface SupplementListProps {
  initialSupplements: Supplement[];
}

// Helper function to format the dosage string more intelligently
function formatDosage(sup: Supplement): string {
    const parts = [];
    if (sup.dosage_amount) {
        parts.push(sup.dosage_amount);
    }
    if (sup.dosage_unit) {
        parts.push(sup.dosage_unit);
    }
    return parts.join(' '); // "5 g", "1 capsule", "5", "g"
}

// Helper function to format the nutrition string
function formatNutrition(sup: Supplement): string {
    const parts = [];
    if (sup.calories_per_serving && sup.calories_per_serving > 0) {
        parts.push(`${sup.calories_per_serving} kcal`);
    }
    if (sup.protein_g_per_serving && sup.protein_g_per_serving > 0) {
        parts.push(`${sup.protein_g_per_serving}g Protein`);
    }
    return parts.join(' • '); // "120 kcal • 24g Protein"
}


export default function SupplementList({ initialSupplements }: SupplementListProps) {
  const [supplements, setSupplements] = useState(initialSupplements);
  const [, startTransition] = useTransition();

  const handleToggle = (id: string, currentState: boolean) => {
    // Optimistic update
    setSupplements(supps => supps.map(s => s.id === id ? { ...s, is_active: !currentState } : s));
    
    startTransition(async () => {
      await toggleSupplementActive(id, !currentState);
    });
  };

  return (
    <Card>
      {supplements.length > 0 ? (
        <ul className="divide-y divide-slate-700">
          {supplements.map(sup => {
            const dosageString = formatDosage(sup);
            const nutritionString = formatNutrition(sup);
            const fullDescription = [dosageString, nutritionString].filter(Boolean).join(' • ');

            return (
                <li key={sup.id} className="p-4 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                    <input
                    type="checkbox"
                    checked={sup.is_active}
                    onChange={() => handleToggle(sup.id, sup.is_active)}
                    title={sup.is_active ? 'Mark as inactive' : 'Mark as active'}
                    className="h-5 w-5 rounded bg-slate-600 border-slate-500 text-cyan-500 focus:ring-cyan-600 cursor-pointer flex-shrink-0"
                    />
                    <div>
                    <p className="font-semibold">{sup.name}</p>
                    {fullDescription && (
                        <p className="text-sm text-gray-400">
                            {fullDescription}
                        </p>
                    )}
                    </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditSupplementModal supplement={sup}>
                    <Pencil size={16} />
                    </EditSupplementModal>
                    <RemoveButton 
                    action={() => deleteSupplement(sup.id)} 
                    itemDescription={`the supplement "${sup.name}"`} 
                    />
                </div>
                </li>
            )
          })}
        </ul>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500">You haven't added any supplements yet.</p>
          <p className="text-gray-500 text-sm mt-2">Click "Add Supplement" to get started.</p>
        </div>
      )}
    </Card>
  );
}