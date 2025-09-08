// src/components/ui/DayStatusToggleButton.tsx
'use client';

import { useTransition } from 'react';
import { toggleDayStatus } from '@/app/actions/onboarding';
import { CheckCircle2, CircleDashed } from 'lucide-react';

interface DayStatusToggleButtonProps {
  date: string;
  status: 'pending' | 'complete';
}

export default function DayStatusToggleButton({ date, status }: DayStatusToggleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const isComplete = status === 'complete';

  const handleClick = () => {
    startTransition(() => {
      toggleDayStatus(date, status);
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`px-4 py-2 font-semibold rounded-md transition-all duration-200 flex items-center gap-2 text-sm border ${
        isComplete
          ? 'bg-brand-green/20 text-brand-green border-brand-green/30 hover:bg-brand-green/30'
          : 'bg-slate-600 hover:bg-slate-700 text-white border-slate-500'
      } disabled:opacity-70`}
    >
      {isComplete ? <CheckCircle2 size={16} /> : <CircleDashed size={16} />}
      {isPending ? 'Updating...' : (isComplete ? 'Day Complete' : 'Mark as Complete')}
    </button>
  );
}