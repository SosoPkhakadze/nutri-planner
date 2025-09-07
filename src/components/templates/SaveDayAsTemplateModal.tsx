// src/components/templates/SaveDayAsTemplateModal.tsx
'use client';

import { useRef, useTransition } from 'react';
import { saveDayAsTemplate } from '@/app/actions/templates';
import { Bookmark } from 'lucide-react';

interface SaveDayAsTemplateModalProps {
  date: string; // YYYY-MM-DD format
  hasMeals: boolean;
}

export default function SaveDayAsTemplateModal({ date, hasMeals }: SaveDayAsTemplateModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    // We need to pass the date along with the form data
    formData.append('date', date);

    startTransition(async () => {
      const result = await saveDayAsTemplate(formData);
      if (result?.success) {
        dialogRef.current?.close();
        formRef.current?.reset();
        alert('Template saved successfully!'); // simple feedback for now
      } else {
        alert(result?.error || 'Failed to save template.');
      }
    });
  };

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        disabled={!hasMeals}
        className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md transition flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Bookmark size={16} />
        Save Day as Template
      </button>

      <dialog ref={dialogRef} className="bg-slate-800 text-white p-0 rounded-lg shadow-xl backdrop:bg-black/50 w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Save Day as Template</h2>
            <button onClick={() => dialogRef.current?.close()} className="text-gray-400 hover:text-white">&times;</button>
          </div>
          
          <form ref={formRef} action={handleAction} className="space-y-4">
            <div>
              <label htmlFor="templateName" className="block text-sm font-medium text-gray-300">Template Name</label>
              <input
                type="text"
                id="templateName"
                name="templateName"
                required
                className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2"
                placeholder="e.g., High-Protein Rest Day, Monday Special"
              />
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 rounded-md text-gray-300 hover:bg-slate-700">Cancel</button>
              <button type="submit" disabled={isPending} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition disabled:bg-slate-600">
                {isPending ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}