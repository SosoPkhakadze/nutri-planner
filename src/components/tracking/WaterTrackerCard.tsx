// src/components/tracking/WaterTrackerCard.tsx
'use client';

import { useState, useTransition } from 'react';
import Card from '../ui/Card';
import { Droplet, Plus, Undo2 } from 'lucide-react';
import { addWaterEntry, removeLastWaterEntry } from '@/app/actions/tracking';

interface WaterTrackerCardProps {
  totalWaterMl: number;
  dailyWaterGoalMl: number;
  date: string;
}

const quickAddAmounts = [250, 500, 750];

export default function WaterTrackerCard({ totalWaterMl, dailyWaterGoalMl, date }: WaterTrackerCardProps) {
  const [isPending, startTransition] = useTransition();
  const [customAmount, setCustomAmount] = useState('');

  const handleAddWater = (amount: number) => {
    startTransition(async () => {
      await addWaterEntry(amount, date);
    });
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(customAmount);
    if (!isNaN(amount) && amount > 0) {
      startTransition(async () => {
        await addWaterEntry(amount, date);
        setCustomAmount('');
      });
    }
  };

  const handleUndo = () => {
    startTransition(async () => {
      await removeLastWaterEntry(date);
    });
  };

  const progress = dailyWaterGoalMl > 0 ? (totalWaterMl / dailyWaterGoalMl) * 100 : 0;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Droplet className="text-cyan-400" />
          Water Intake
        </h2>
        <button
          onClick={handleUndo}
          disabled={isPending || totalWaterMl === 0}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Undo2 size={12} /> Undo
        </button>
      </div>

      <div className="text-center my-4">
        <p className="text-4xl font-bold">
          {totalWaterMl.toLocaleString()}
          <span className="text-lg text-gray-400"> / {dailyWaterGoalMl.toLocaleString()} ml</span>
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700 rounded-full h-2.5 mb-4">
        <div 
          className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${Math.min(100, progress)}%` }}>
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        {quickAddAmounts.map(amount => (
          <button
            key={amount}
            onClick={() => handleAddWater(amount)}
            disabled={isPending}
            className="flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 font-semibold rounded-md transition disabled:opacity-50 text-sm"
          >
            <Plus size={16} /> {amount}ml
          </button>
        ))}
      </div>

      <form onSubmit={handleCustomAdd} className="flex gap-2">
        <input
          type="number"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder="Custom ml"
          className="w-full bg-slate-700 p-2 rounded-md text-sm"
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={isPending || !customAmount}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 font-semibold rounded-md transition disabled:opacity-50 text-sm"
        >
          Add
        </button>
      </form>
    </Card>
  );
}