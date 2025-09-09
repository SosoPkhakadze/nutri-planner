// src/components/supplements/SupplementList.tsx
'use client';

import { useState, useTransition } from 'react';
import { GlassCard } from '../ui/Card';
import RemoveButton from '../ui/RemoveButton';
import { deleteSupplement, toggleSupplementActive } from '@/app/actions/tracking';
import { Pencil, Plus, Pill, Zap, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import EditSupplementModal from './EditSupplementModal';
import AddSupplementModal from './AddSupplementModal';
import { type Supplement } from '@/lib/types';

interface SupplementListProps {
  initialSupplements: Supplement[];
}

function formatDosage(sup: Supplement): string {
  const amount = sup.dosage_amount;
  const unit = sup.dosage_unit;
  if (amount && unit) return `${amount} ${unit}`;
  if (amount) return `${amount}`;
  if (unit) return `${unit}`;
  return 'Dosage not set';
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
  const activeSupplements = sortedSupplements.filter(s => s.is_active);
  const inactiveSupplements = sortedSupplements.filter(s => !s.is_active);

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Supplements
          </h1>
          <p className="text-slate-400 mt-1">Manage your daily supplements</p>
        </div>
        <AddSupplementModal onSuccess={handleAddSuccess} />
      </div>

      {/* Active Supplements */}
      {activeSupplements.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 size={20} className="text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Active Supplements</h2>
              <p className="text-sm text-slate-400">{activeSupplements.length} supplements in your routine</p>
            </div>
          </div>
          
          <GlassCard className="overflow-hidden">
            <div className="divide-y divide-slate-700/50">
              {activeSupplements.map(sup => {
                const dosageString = formatDosage(sup);
                const nutritionString = formatNutrition(sup);

                return (
                  <div key={sup.id} className="group p-6 hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Toggle */}
                      <div className="flex-shrink-0 pt-1">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sup.is_active}
                            onChange={() => handleToggle(sup.id, sup.is_active)}
                            disabled={isPending}
                            className="sr-only peer"
                          />
                          <div className="relative w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-600 peer-checked:to-blue-600"></div>
                        </label>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                            <Pill size={18} className="text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white truncate">{sup.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Activity size={14} className="text-slate-400" />
                              <span className="text-slate-400 text-sm">{dosageString}</span>
                            </div>
                          </div>
                        </div>

                        {/* Nutrition info */}
                        {nutritionString && (
                          <div className="flex items-center gap-2 mb-3">
                            <Zap size={14} className="text-cyan-400" />
                            <span className="text-cyan-400/80 text-sm">{nutritionString}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <EditSupplementModal supplement={sup} onSuccess={handleUpdateSuccess}>
                          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                            <Pencil size={16} />
                          </button>
                        </EditSupplementModal>
                        <RemoveButton 
                          action={handleDeleteAction(sup.id)} 
                          itemDescription={`the supplement "${sup.name}"`} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Inactive Supplements */}
      {inactiveSupplements.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-500/20 rounded-lg">
              <AlertCircle size={20} className="text-slate-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Inactive Supplements</h2>
              <p className="text-sm text-slate-400">{inactiveSupplements.length} supplements not in use</p>
            </div>
          </div>
          
          <GlassCard className="overflow-hidden opacity-75">
            <div className="divide-y divide-slate-700/30">
              {inactiveSupplements.map(sup => {
                const dosageString = formatDosage(sup);
                const nutritionString = formatNutrition(sup);

                return (
                  <div key={sup.id} className="group p-6 hover:bg-slate-800/20 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Toggle */}
                      <div className="flex-shrink-0 pt-1">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sup.is_active}
                            onChange={() => handleToggle(sup.id, sup.is_active)}
                            disabled={isPending}
                            className="sr-only peer"
                          />
                          <div className="relative w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-600 peer-checked:to-blue-600"></div>
                        </label>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 bg-slate-600/20 rounded-lg">
                            <Pill size={18} className="text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-slate-300 truncate">{sup.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Activity size={14} className="text-slate-500" />
                              <span className="text-slate-500 text-sm">{dosageString}</span>
                            </div>
                          </div>
                        </div>

                        {/* Nutrition info */}
                        {nutritionString && (
                          <div className="flex items-center gap-2 mb-3">
                            <Zap size={14} className="text-slate-500" />
                            <span className="text-slate-500 text-sm">{nutritionString}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <EditSupplementModal supplement={sup} onSuccess={handleUpdateSuccess}>
                          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                            <Pencil size={16} />
                          </button>
                        </EditSupplementModal>
                        <RemoveButton 
                          action={handleDeleteAction(sup.id)} 
                          itemDescription={`the supplement "${sup.name}"`} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Empty State */}
      {supplements.length === 0 && (
        <GlassCard className="text-center py-16">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-6">
              <Pill size={32} className="text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No supplements yet</h3>
            <p className="text-slate-400 mb-6">
              Start tracking your daily supplements to monitor their nutritional impact.
            </p>
            <AddSupplementModal onSuccess={handleAddSuccess} />
          </div>
        </GlassCard>
      )}
    </div>
  );
}