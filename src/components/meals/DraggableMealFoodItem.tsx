// src/components/meals/DraggableMealFoodItem.tsx
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { ReactNode } from 'react';
import type { MealFood } from '@/lib/types';

interface DraggableMealFoodItemProps {
  children: ReactNode;
  foodItem: MealFood;
}

export function DraggableMealFoodItem({ children, foodItem }: DraggableMealFoodItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: foodItem.id,
    data: {
      type: 'foodItem',
      mealId: foodItem.meal_id,
      foodItem,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="flex items-center bg-slate-800 rounded-md hover:bg-slate-700/50">
      <button 
        {...attributes} 
        {...listeners} 
        className="p-2 text-slate-500 cursor-grab touch-none hover:text-white rounded-l-md"
        aria-label="Drag to reorder food item"
      >
        <GripVertical size={16} />
      </button>
      <div className="flex-grow">
        {children}
      </div>
    </li>
  );
}