// src/components/supplements/EditSupplementModal.tsx
'use client';

import { useRef, useTransition, ReactNode } from 'react';
import { updateSupplement } from '@/app/actions/tracking';
import { type Supplement } from '@/lib/types'; // Import the centralized type

interface EditSupplementModalProps {
  supplement: Supplement;
  children: ReactNode;
  onSuccess?: (updatedSupplement: Supplement) => void;
}

export default function EditSupplementModal({ supplement, children, onSuccess }: EditSupplementModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateSupplement(supplement.id, formData);
      if (result?.success && result.updatedSupplement) {
        onSuccess?.(result.updatedSupplement);
        dialogRef.current?.close();
      } else {
        alert(result?.error || 'Failed to update supplement.');
      }
    });
  };

  return (
    <>
      <button onClick={() => dialogRef.current?.showModal()} className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-slate-700">
        {children}
      </button>
      
      <dialog ref={dialogRef} className="bg-slate-800 text-white p-0 rounded-lg shadow-xl backdrop:bg-black/50 w-full max-w-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Edit "{supplement.name}"</h2>
          </div>

          <form ref={formRef} action={handleAction} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">Supplement Name</label>
              <input type="text" name="name" required defaultValue={supplement.name} className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dosage_amount" className="block text-sm font-medium">Dosage</label>
                <input type="number" step="0.1" name="dosage_amount" defaultValue={supplement.dosage_amount || ''} className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
              </div>
              <div>
                <label htmlFor="dosage_unit" className="block text-sm font-medium">Unit</label>
                <input type="text" name="dosage_unit" defaultValue={supplement.dosage_unit || ''} className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="calories_per_serving" className="block text-sm font-medium">Calories per Serving</label>
                <input type="number" name="calories_per_serving" defaultValue={supplement.calories_per_serving || 0} className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
              </div>
              <div>
                <label htmlFor="protein_g_per_serving" className="block text-sm font-medium">Protein (g) per Serving</label>
                <input type="number" step="0.1" name="protein_g_per_serving" defaultValue={supplement.protein_g_per_serving || 0} className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
              </div>
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 rounded-md text-gray-300 hover:bg-slate-700">Cancel</button>
              <button type="submit" disabled={isPending} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 font-semibold rounded-md">
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}