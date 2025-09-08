// src/components/meals/MealStatusToggleButton.tsx
'use client';

import { useTransition } from 'react';
import { toggleMealStatus } from '@/app/actions/meals';
import { CheckCircle2, Circle } from 'lucide-react';

interface MealStatusToggleButtonProps {
  mealId: string;
  status: 'pending' | 'done';
}

export default function MealStatusToggleButton({ mealId, status }: MealStatusToggleButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent other click events on the card
    startTransition(() => {
      toggleMealStatus(mealId, status);
    });
  };

  const isDone = status === 'done';

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-2 text-sm p-1 rounded-md transition-colors ${
        isDone 
          ? 'text-green-400 hover:bg-green-500/10' 
          : 'text-gray-400 hover:bg-slate-700 hover:text-white'
      }`}
    >
      {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
    </button>
  );
}