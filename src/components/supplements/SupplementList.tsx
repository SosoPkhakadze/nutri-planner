// src/components/supplements/SupplementList.tsx
'use client';

import { useState, useTransition } from 'react';
import Card from '../ui/Card';
import RemoveButton from '../ui/RemoveButton';
import { deleteSupplement, toggleSupplementActive } from '@/app/actions/tracking';
import { Pencil } from 'lucide-react';
// We will create the EditSupplementModal next
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

export default function SupplementList({ initialSupplements }: SupplementListProps) {
  const [supplements, setSupplements] = useState(initialSupplements);
  const [isPending, startTransition] = useTransition();

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
          {supplements.map(sup => (
            <li key={sup.id} className="p-4 flex justify-between items-center group">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={sup.is_active}
                  onChange={() => handleToggle(sup.id, sup.is_active)}
                  disabled={isPending}
                  title={sup.is_active ? 'Mark as inactive' : 'Mark as active'}
                  className="h-5 w-5 rounded bg-slate-600 border-slate-500 text-cyan-500 focus:ring-cyan-600 cursor-pointer"
                />
                <div>
                  <p className="font-semibold">{sup.name}</p>
                  <p className="text-sm text-gray-400">
                    {sup.dosage_amount} {sup.dosage_unit}
                    {sup.calories_per_serving && sup.calories_per_serving > 0 ? ` • ${sup.calories_per_serving} kcal` : ''}
                    {sup.protein_g_per_serving && sup.protein_g_per_serving > 0 ? ` • ${sup.protein_g_per_serving}g Protein` : ''}
                  </p>
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
          ))}
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