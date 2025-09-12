// src/components/food-db/ImportFoodModal.tsx
'use client';

import { useRef, useState, useTransition, ReactNode } from 'react';
import { searchOpenFoodFacts, importFoodFromOFF } from '@/app/actions/openfoodfacts';
import { X, Search, Plus, Loader2 } from 'lucide-react';
import PrimaryButton from '../ui/PrimaryButton';

interface FormattedFoodItem {
  name: string;
  brand?: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface ImportFoodModalProps {
  children: ReactNode;
}

export default function ImportFoodModal({ children }: ImportFoodModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isSearching, startSearchTransition] = useTransition();
  const [isImporting, startImportTransition] = useTransition();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<FormattedFoodItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    startSearchTransition(async () => {
      setError(null);
      const searchResults = await searchOpenFoodFacts(searchTerm);
      if (searchResults.length === 0) {
        setError("No results found. Try a different search term.");
      }
      setResults(searchResults);
    });
  };
  
  const handleImport = (foodItem: FormattedFoodItem) => {
    startImportTransition(async () => {
        const result = await importFoodFromOFF(foodItem);
        if (result.success) {
            alert(`Successfully imported "${foodItem.name}"!`);
            handleClose();
        } else {
            alert(result.error || "Failed to import item.");
        }
    });
  };

  const handleClose = () => {
    dialogRef.current?.close();
    setSearchTerm('');
    setResults([]);
    setError(null);
  }

  return (
    <>
      <div onClick={() => dialogRef.current?.showModal()} className="cursor-pointer">
        {children}
      </div>
      
      <dialog ref={dialogRef} onClose={handleClose} className="bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-sm p-4 w-full max-w-2xl rounded-2xl">
        <div className="bg-slate-900/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl w-full border border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-white">Import from Global Database</h2>
                <p className="text-slate-400 mt-1">Search Open Food Facts and add to your personal DB.</p>
            </div>
            <button onClick={handleClose} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., Quest protein bar"
                className="w-full bg-slate-800 border border-slate-700 p-2 rounded-md"
              />
              <PrimaryButton onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
              </PrimaryButton>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                {isSearching && <div className="text-center p-8 text-slate-400">Searching...</div>}
                {error && <div className="text-center p-8 text-amber-400">{error}</div>}
                {results.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="p-4 bg-slate-800/50 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{item.name} <span className="text-sm text-slate-400 font-normal">- {item.brand}</span></p>
                            <p className="text-xs text-slate-400 mt-1 font-mono">
                                {item.calories}kcal • {item.protein_g}g P • {item.carbs_g}g C • {item.fat_g}g F (per 100g)
                            </p>
                        </div>
                        <button 
                            onClick={() => handleImport(item)}
                            disabled={isImporting}
                            className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 hover:text-cyan-300 transition-colors disabled:opacity-50"
                            title="Import this item"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}