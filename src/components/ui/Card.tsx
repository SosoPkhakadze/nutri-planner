// src/components/ui/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-700 ${className}`}>
      {children}
    </div>
  );
}