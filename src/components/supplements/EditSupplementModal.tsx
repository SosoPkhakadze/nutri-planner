// src/components/supplements/EditSupplementModal.tsx
'use client';

import { useRef, useTransition, ReactNode } from 'react';
import { updateSupplement } from '@/app/actions/tracking';
import { type Supplement } from '@/lib/types';
import { X } from 'lucide-react';
import PrimaryButton from '../ui/PrimaryButton';

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
      <div onClick={() => dialogRef.current?.showModal()} className="cursor-pointer">
        {children}
      </div>
      
      <dialog ref={dialogRef} className="bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-sm p-4 w-full max-w-lg rounded-2xl">
        <div className="bg-slate-900/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl w-full border border-slate-700/50 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-transparent flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Edit Supplement</h2>
              <p className="text-slate-400 mt-1 truncate">"{supplement.name}"</p>
            </div>
            <button onClick={() => dialogRef.current?.close()} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
              <X size={20} />
            </button>
          </div>

          <form ref={formRef} action={handleAction}>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Supplement Name</label>
                <input type="text" name="name" required defaultValue={supplement.name} className="w-full bg-slate-800 border border-slate-700 p-2 rounded-md" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dosage_amount" className="block text-sm font-medium mb-1">Dosage Amount</label>
                  <input type="number" step="any" name="dosage_amount" defaultValue={supplement.dosage_amount || ''} className="w-full bg-slate-800 border border-slate-700 p-2 rounded-md" />
                </div>
                <div>
                  <label htmlFor="dosage_unit" className="block text-sm font-medium mb-1">Dosage Unit</label>
                  <input type="text" name="dosage_unit" defaultValue={supplement.dosage_unit || ''} className="w-full bg-slate-800 border border-slate-700 p-2 rounded-md" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="calories_per_serving" className="block text-sm font-medium mb-1">Calories per Serving</label>
                  <input type="number" name="calories_per_serving" defaultValue={supplement.calories_per_serving || 0} className="w-full bg-slate-800 border border-slate-700 p-2 rounded-md" />
                </div>
                <div>
                  <label htmlFor="protein_g_per_serving" className="block text-sm font-medium mb-1">Protein (g) per Serving</label>
                  <input type="number" step="0.1" name="protein_g_per_serving" defaultValue={supplement.protein_g_per_serving || 0} className="w-full bg-slate-800 border border-slate-700 p-2 rounded-md" />
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-900/70 border-t border-slate-700/50 flex justify-end gap-3">
              <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 rounded-xl text-slate-300 bg-slate-800/50 hover:bg-slate-800 transition-colors">Cancel</button>
              <PrimaryButton type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}