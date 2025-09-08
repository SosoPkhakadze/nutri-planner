// src/components/templates/SaveMealAsTemplateModal.tsx
'use client';

import { useRef, useTransition } from 'react';
import { saveMealAsTemplate } from '@/app/actions/templates';
import { Bookmark } from 'lucide-react';

interface SaveMealAsTemplateModalProps {
  mealId: string;
  hasFoods: boolean;
}

export default function SaveMealAsTemplateModal({ mealId, hasFoods }: SaveMealAsTemplateModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      const result = await saveMealAsTemplate(mealId, formData);
      if (result?.success) {
        dialogRef.current?.close();
        formRef.current?.reset();
        alert('Meal template saved successfully!');
      } else {
        alert(result?.error || 'Failed to save meal template.');
      }
    });
  };

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); dialogRef.current?.showModal(); }}
        disabled={!hasFoods}
        title="Save as meal template"
        className="p-1 rounded-md text-gray-400 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Bookmark size={16} />
      </button>

      <dialog ref={dialogRef} onClick={(e) => e.stopPropagation()} className="bg-slate-800 text-white p-0 rounded-lg shadow-xl backdrop:bg-black/50 w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Save Meal as Template</h2>
          <form ref={formRef} action={handleAction} className="space-y-4">
            <div>
              <label htmlFor="templateName" className="block text-sm font-medium text-gray-300">Template Name</label>
              <input
                type="text"
                id="templateName"
                name="templateName"
                required
                className="mt-1 block w-full bg-slate-700 p-2 rounded-md"
                placeholder="e.g., Protein Oatmeal, Quick Lunch"
              />
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 rounded-md hover:bg-slate-700">Cancel</button>
              <button type="submit" disabled={isPending} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 font-semibold rounded-md">
                {isPending ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}