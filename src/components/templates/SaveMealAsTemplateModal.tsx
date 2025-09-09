// src/components/templates/SaveMealAsTemplateModal.tsx
'use client';

import { useRef, useTransition } from 'react';
import { saveMealAsTemplate } from '@/app/actions/templates';
import { Bookmark, X } from 'lucide-react';
import PrimaryButton from '../ui/PrimaryButton';

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

      <dialog ref={dialogRef} onClick={(e) => e.stopPropagation()} className="bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-sm p-4 w-full max-w-md rounded-2xl">
        <div className="bg-slate-900/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl w-full border border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-transparent flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Save Meal as Template</h2>
              <p className="text-slate-400 mt-1">Create a reusable meal template.</p>
            </div>
            <button onClick={() => dialogRef.current?.close()} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
              <X size={20} />
            </button>
          </div>
          <form ref={formRef} action={handleAction}>
            <div className="p-6">
              <label htmlFor="templateName" className="block text-sm font-medium text-slate-400 mb-1">Template Name</label>
              <input
                type="text"
                id="templateName"
                name="templateName"
                required
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded-md"
                placeholder="e.g., Protein Oatmeal, Quick Lunch"
              />
            </div>
            <div className="p-6 bg-slate-900/70 border-t border-slate-700/50 flex justify-end gap-3">
              <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 rounded-xl text-slate-300 bg-slate-800/50 hover:bg-slate-800 transition-colors">Cancel</button>
              <PrimaryButton type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Template'}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}