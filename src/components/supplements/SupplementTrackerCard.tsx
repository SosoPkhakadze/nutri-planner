// src/components/supplements/SupplementTrackerCard.tsx
'use client';

import { useTransition } from 'react';
import Card from '../ui/Card';
import { Pill } from 'lucide-react';
import { logSupplement, unlogSupplement } from '@/app/actions/tracking';
import Link from 'next/link';

type Supplement = {
  id: string;
  name: string;
  dosage_amount: number | null;
  dosage_unit: string | null;
};

interface SupplementTrackerCardProps {
  activeSupplements: Supplement[];
  loggedSupplementIds: string[];
  date: string;
}

export default function SupplementTrackerCard({ 
  activeSupplements, 
  loggedSupplementIds, 
  date 
}: SupplementTrackerCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (supplementId: string, isLogged: boolean) => {
    startTransition(() => {
      if (isLogged) {
        unlogSupplement(supplementId, date);
      } else {
        logSupplement(supplementId, date);
      }
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Pill className="text-cyan-400" />
        Daily Supplements
      </h2>
      
      {activeSupplements.length > 0 ? (
        <ul className="space-y-3">
          {activeSupplements.map(sup => {
            const isLogged = loggedSupplementIds.includes(sup.id);
            return (
              <li key={sup.id}>
                <label className="flex items-center p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={isLogged}
                    onChange={() => handleToggle(sup.id, isLogged)}
                    disabled={isPending}
                    className="h-5 w-5 rounded bg-slate-600 border-slate-500 text-cyan-500 focus:ring-cyan-600"
                  />
                  <div className="ml-3">
                    <p className={`font-medium ${isLogged ? 'line-through text-gray-400' : ''}`}>{sup.name}</p>
                    {sup.dosage_amount && sup.dosage_unit && (
                      <p className={`text-sm text-gray-400 ${isLogged ? 'line-through' : ''}`}>
                        {sup.dosage_amount} {sup.dosage_unit}
                      </p>
                    )}
                  </div>
                </label>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="text-center py-4 text-sm text-gray-400">
          <p>No active supplements.</p>
          <Link href="/supplements" className="text-cyan-400 hover:underline">
            Manage your supplements
          </Link>
        </div>
      )}
    </Card>
  );
}