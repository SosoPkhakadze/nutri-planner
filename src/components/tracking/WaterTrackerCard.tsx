// src/components/tracking/WaterTrackerCard.tsx
'use client';

import { useTransition } from 'react';
import Card from '../ui/Card';
import { Droplet, Plus } from 'lucide-react';
import { addWaterEntry } from '@/app/actions/tracking';

interface WaterTrackerCardProps {
  totalWaterMl: number;
  date: string;
}

const quickAddAmounts = [250, 500, 750];

export default function WaterTrackerCard({ totalWaterMl, date }: WaterTrackerCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleAddWater = (amount: number) => {
    startTransition(async () => {
      await addWaterEntry(amount, date);
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Droplet className="text-cyan-400" />
        Water Intake
      </h2>
      <div className="text-center mb-4">
        <p className="text-4xl font-bold">
          {totalWaterMl.toLocaleString()} <span className="text-lg text-gray-400">ml</span>
        </p>
        <p className="text-gray-400">of your goal</p>
      </div>
      <div className="flex justify-center gap-3">
        {quickAddAmounts.map(amount => (
          <button
            key={amount}
            onClick={() => handleAddWater(amount)}
            disabled={isPending}
            className="flex items-center gap-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 font-semibold rounded-md transition disabled:opacity-50"
          >
            <Plus size={16} /> {amount}ml
          </button>
        ))}
      </div>
    </Card>
  );
}