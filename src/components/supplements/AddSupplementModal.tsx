// src/components/supplements/AddSupplementModal.tsx
'use client';

import { useRef, useTransition } from 'react';
import { addSupplement } from '@/app/actions/tracking';
import { PlusCircle } from 'lucide-react';

export default function AddSupplementModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      const result = await addSupplement(formData);
      if (result?.success) {
        dialogRef.current?.close();
        formRef.current?.reset();
      } else {
        alert(result?.error || 'Failed to add supplement.');
      }
    });
  };

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition flex items-center gap-2"
      >
        <PlusCircle size={18} />
        Add Supplement
      </button>
      
      <dialog ref={dialogRef} className="bg-slate-800 text-white p-0 rounded-lg shadow-xl backdrop:bg-black/50 w-full max-w-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Add a New Supplement</h2>
            <button onClick={() => dialogRef.current?.close()} className="text-gray-400 hover:text-white">&times;</button>
          </div>

          <form ref={formRef} action={handleAction} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">Supplement Name</label>
              <input type="text" name="name" required placeholder="e.g., Creatine Monohydrate" className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dosage_amount" className="block text-sm font-medium">Dosage</label>
                <input type="number" step="0.1" name="dosage_amount" placeholder="e.g., 5" className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
              </div>
              <div>
                <label htmlFor="dosage_unit" className="block text-sm font-medium">Unit</label>
                <input type="text" name="dosage_unit" placeholder="g, mg, capsule" className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
              </div>
            </div>

            <p className="text-sm text-gray-400 pt-2">Optional: If this supplement contains calories (like protein powder), add them below.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="calories_per_serving" className="block text-sm font-medium">Calories per Serving</label>
                <input type="number" name="calories_per_serving" defaultValue="0" className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
              </div>
              <div>
                <label htmlFor="protein_g_per_serving" className="block text-sm font-medium">Protein (g) per Serving</label>
                <input type="number" step="0.1" name="protein_g_per_serving" defaultValue="0" className="mt-1 w-full bg-slate-700 p-2 rounded-md" />
              </div>
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 rounded-md text-gray-300 hover:bg-slate-700">Cancel</button>
              <button type="submit" disabled={isPending} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 font-semibold rounded-md">
                {isPending ? 'Saving...' : 'Save Supplement'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}