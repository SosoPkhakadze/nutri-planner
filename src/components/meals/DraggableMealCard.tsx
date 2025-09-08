// src/components/meals/DraggableMealCard.tsx
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MealCard from './MealCard';
import { GripVertical } from 'lucide-react';
import type { Meal, FoodItem } from '@/lib/types';

interface DraggableMealCardProps {
  meal: Meal;
  foodItems: FoodItem[];
}

export function DraggableMealCard({ meal, foodItems }: DraggableMealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: meal.id,
    data: {
      type: 'meal',
      meal,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <button 
        {...attributes} 
        {...listeners}
        className="absolute top-6 left-2 p-2 text-slate-500 hover:text-white cursor-grab touch-none focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-md"
        aria-label="Drag to reorder meal"
      >
        <GripVertical size={20} />
      </button>
      <div className="ml-8">
        <MealCard meal={meal} foodItems={foodItems} />
      </div>
    </div>
  );
}