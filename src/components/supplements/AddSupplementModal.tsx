// src/components/supplements/AddSupplementModal.tsx
'use client';

import { useRef, useTransition, ReactNode } from 'react';
import { addSupplement } from '@/app/actions/tracking';
import { type Supplement } from '@/lib/types';
import PrimaryButton from '../ui/PrimaryButton';
import { X } from 'lucide-react';

interface AddSupplementModalProps {
  children: ReactNode;
  onSuccess?: (newSupplement: Supplement) => void;
}

export default function AddSupplementModal({ children, onSuccess }: AddSupplementModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      const result = await addSupplement(formData);
      if (result?.success && result.newSupplement) {
        onSuccess?.(result.newSupplement);
        dialogRef.current?.close();
        formRef.current?.reset();
      } else {
        alert(result?.error || 'Failed to add supplement.');
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
           <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-transparent flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Add New Supplement</h2>
              <p className="text-slate-400 mt-1">Define the supplement and its dosage.</p>
            </div>
            <button onClick={() => dialogRef.current?.close()} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
              <X size={20} />
            </button>
          </div>

          <form ref={formRef} action={handleAction}>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-400 mb-1">Supplement Name</label>
                <input type="text" name="name" required placeholder="e.g., Creatine Monohydrate" className="w-full bg-slate-800 border border-slate-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dosage_amount" className="block text-sm font-medium text-slate-400 mb-1">Dosage Amount</label>
                  <input type="number" step="any" name="dosage_amount" placeholder="e.g., 5" className="w-full bg-slate-800 border border-slate-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label htmlFor="dosage_unit" className="block text-sm font-medium text-slate-400 mb-1">Dosage Unit</label>
                  <input type="text" name="dosage_unit" placeholder="g, mg, capsule" className="w-full bg-slate-800 border border-slate-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm text-slate-400">Optional: If this supplement contains calories (like protein powder), add them below.</p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label htmlFor="calories_per_serving" className="block text-sm font-medium text-slate-400 mb-1">Calories per Serving</label>
                    <input type="number" name="calories_per_serving" defaultValue="0" className="w-full bg-slate-800 border border-slate-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                  </div>
                  <div>
                    <label htmlFor="protein_g_per_serving" className="block text-sm font-medium text-slate-400 mb-1">Protein (g) per Serving</label>
                    <input type="number" step="0.1" name="protein_g_per_serving" defaultValue="0" className="w-full bg-slate-800 border border-slate-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-900/70 border-t border-slate-700/50 flex justify-end gap-3">
              <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 rounded-xl text-slate-300 bg-slate-800/50 hover:bg-slate-800 transition-colors">Cancel</button>
              <PrimaryButton type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Supplement'}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}