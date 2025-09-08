// src/components/supplements/SupplementList.tsx
'use client';

import { useState, useTransition } from 'react';
import Card from '../ui/Card';
import RemoveButton from '../ui/RemoveButton';
import { deleteSupplement, toggleSupplementActive } from '@/app/actions/tracking';
import { Pencil } from 'lucide-react';
import EditSupplementModal from './EditSupplementModal';
import AddSupplementModal from './AddSupplementModal';
import { type Supplement } from '@/lib/types'; // Import the centralized type

interface SupplementListProps {
  initialSupplements: Supplement[];
}

// Helper function to format the dosage string more intelligently
function formatDosage(sup: Supplement): string {
    if (sup.dosage_amount !== null && sup.dosage_amount > 0) {
        return [sup.dosage_amount, sup.dosage_unit].filter(Boolean).join(' ');
    }
    if (sup.dosage_unit) {
        return sup.dosage_unit;
    }
    return '';
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
    return parts.join(' • ');
}

export default function SupplementList({ initialSupplements }: SupplementListProps) {
  const [supplements, setSupplements] = useState<Supplement[]>(initialSupplements);
  const [, startTransition] = useTransition();

  const handleAddSuccess = (newSupplement: Supplement) => {
    setSupplements(currentSupps => [...currentSupps, newSupplement].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
  };

  const handleUpdateSuccess = (updatedSupplement: Supplement) => {
    setSupplements(currentSupps => 
      currentSupps.map(s => s.id === updatedSupplement.id ? { ...s, ...updatedSupplement } : s)
    );
  };

  // FIX: The action passed to RemoveButton needs to be a function that doesn't return a value.
  const handleDelete = (id: string) => {
    // This function will be called by the RemoveButton
    const action = () => { // This 'action' function returns void
        // Optimistic UI update
        setSupplements(currentSupps => currentSupps.filter(s => s.id !== id));
        
        // The server call is wrapped in startTransition
        startTransition(() => {
            deleteSupplement(id); 
        });
    };
    // We return the 'action' function to be used by the RemoveButton
    return action;
  };
  
  const handleToggle = (id: string, currentState: boolean) => {
    setSupplements(supps => supps.map(s => s.id === id ? { ...s, is_active: !currentState } : s));
    // FIX: Wrap the server action in an anonymous function.
    startTransition(() => {
        toggleSupplementActive(id, !currentState);
    });
  };
  
  return (
    <>
      <div className="mb-4 text-right">
        <AddSupplementModal onSuccess={handleAddSuccess} />
      </div>
      <Card>
        {supplements.length > 0 ? (
          <ul className="divide-y divide-slate-700">
            {supplements.map(sup => {
              const dosageString = formatDosage(sup);
              const nutritionString = formatNutrition(sup);
              const fullDescription = [dosageString, nutritionString].filter(Boolean).join(' • ');

              return (
                <li key={sup.id} className="p-4 flex justify-between items-center group">
                  <div className="flex items-center gap-4 min-w-0">
                    <input
                      type="checkbox"
                      checked={sup.is_active}
                      onChange={() => handleToggle(sup.id, sup.is_active)}
                      title={sup.is_active ? 'Mark as inactive' : 'Mark as active'}
                      className="h-5 w-5 rounded bg-slate-600 border-slate-500 text-cyan-500 focus:ring-cyan-600 cursor-pointer flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{sup.name}</p>
                      {fullDescription && (
                          <p className="text-sm text-gray-400 truncate">
                              {fullDescription}
                          </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pl-2">
                      <EditSupplementModal supplement={sup} onSuccess={handleUpdateSuccess}>
                        <Pencil size={16} />
                      </EditSupplementModal>
                      {/* Pass the function directly */}
                      <RemoveButton 
            action={handleDelete(sup.id)} // This is now valid
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