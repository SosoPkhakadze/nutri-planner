// src/components/supplements/SupplementList.tsx
'use client';

import { useState, useTransition } from 'react';
import Card from '../ui/Card';
import RemoveButton from '../ui/RemoveButton';
import { deleteSupplement, toggleSupplementActive } from '@/app/actions/tracking';
import { Pencil } from 'lucide-react';
import EditSupplementModal from './EditSupplementModal';
import AddSupplementModal from './AddSupplementModal';
import { type Supplement } from '@/lib/types';

interface SupplementListProps {
  initialSupplements: Supplement[];
}

// FINAL, HUMAN-READABLE HELPER FUNCTIONS
function formatDosage(sup: Supplement): string {
    const amount = sup.dosage_amount;
    const unit = sup.dosage_unit;
    // Always prefix with "Take" for clarity
    if (amount && unit) return `Take: ${amount} ${unit}`;
    if (amount) return `Take: ${amount}`;
    if (unit) return `Take: ${unit}`;
    return 'Dosage not set'; // Fallback for clarity
}

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

export default function SupplementList({ initialSupplements }: SupplementListProps) {
  const [supplements, setSupplements] = useState<Supplement[]>(initialSupplements);
  const [isPending, startTransition] = useTransition();

  const handleAddSuccess = (newSupplement: Supplement) => {
    setSupplements(currentSupps => [...currentSupps, newSupplement]);
  };

  const handleUpdateSuccess = (updatedSupplement: Supplement) => {
    setSupplements(currentSupps => 
      currentSupps.map(s => s.id === updatedSupplement.id ? { ...s, ...updatedSupplement } : s)
    );
  };

  const handleDeleteAction = (id: string) => {
    return () => {
        const previousSupplements = supplements;
        setSupplements(currentSupps => currentSupps.filter(s => s.id !== id));
        
        startTransition(async () => {
            const result = await deleteSupplement(id);
            if (result?.error) {
                setSupplements(previousSupplements);
                alert(result.error);
            }
        });
    };
  };
  
  const handleToggle = (id: string, currentState: boolean) => {
    setSupplements(supps => supps.map(s => s.id === id ? { ...s, is_active: !currentState } : s));
    startTransition(() => {
        toggleSupplementActive(id, !currentState);
    });
  };
  
  const sortedSupplements = [...supplements].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <>
      <div className="mb-4 text-right">
        <AddSupplementModal onSuccess={handleAddSuccess} />
      </div>
      <Card>
        {sortedSupplements.length > 0 ? (
          <ul className="divide-y divide-slate-700">
            {sortedSupplements.map(sup => {
              const dosageString = formatDosage(sup);
              const nutritionString = formatNutrition(sup);
              const fullDescription = [dosageString, nutritionString].filter(s => s && s !== 'Dosage not set').join(' • ');

              return (
                <li key={sup.id} className="p-4 flex justify-between items-center group">
                  <div className="flex items-center gap-4 min-w-0">
                    <input
                      type="checkbox"
                      checked={sup.is_active}
                      onChange={() => handleToggle(sup.id, sup.is_active)}
                      disabled={isPending}
                      title={sup.is_active ? 'Mark as inactive' : 'Mark as active'}
                      className="h-5 w-5 rounded bg-slate-600 border-slate-500 text-cyan-500 focus:ring-cyan-600 cursor-pointer flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{sup.name}</p>
                      {/* Show dosage string directly, with a fallback */}
                      <p className="text-sm text-gray-400 truncate">
                        {dosageString}
                      </p>
                      {/* Show nutrition only if it exists */}
                      {nutritionString && (
                        <p className="text-xs text-cyan-400/70 truncate mt-1">
                          {nutritionString}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pl-2">
                      <EditSupplementModal supplement={sup} onSuccess={handleUpdateSuccess}>
                        <Pencil size={16} />
                      </EditSupplementModal>
                      <RemoveButton 
                        action={handleDeleteAction(sup.id)} 
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
    </>
  );
}