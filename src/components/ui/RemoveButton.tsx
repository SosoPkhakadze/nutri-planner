// src/components/ui/RemoveButton.tsx
'use client';
import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';

interface RemoveButtonProps {
  // Allow the action to return a Promise or nothing (void)
  action: () => Promise<any> | void; 
  itemDescription: string;
}

export default function RemoveButton({ action, itemDescription }: RemoveButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (confirm(`Are you sure you want to remove ${itemDescription}?`)) {
      // The action itself now handles startTransition if needed,
      // but we can still wrap it here for actions that don't.
      // This is safe because the action can now be void.
      startTransition(() => {
        action();
      });
    }
  };

  return (
    <button 
      onClick={handleClick} 
      disabled={isPending} 
      className="text-red-500 hover:text-red-400 disabled:text-gray-500 p-1 rounded-md hover:bg-red-500/10"
    >
      <Trash2 size={16} />
    </button>
  );
}