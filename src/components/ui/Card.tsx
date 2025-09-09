// src/components/ui/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  hover?: boolean;
}

export default function Card({ children, className = '', variant = 'default', hover = false }: CardProps) {
  const baseClasses = 'rounded-xl transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700',
    glass: 'bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl',
    gradient: 'bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-slate-700/50 shadow-xl',
    elevated: 'bg-slate-800 border border-slate-700 shadow-2xl shadow-slate-900/50'
  };
  
  const hoverClasses = hover ? 'hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10' : '';
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
}

// Enhanced Card variants for specific use cases
export const GlassCard = ({ children, className = '', ...props }: Omit<CardProps, 'variant'>) => (
  <Card variant="glass" className={className} {...props}>
    {children}
  </Card>
);

export const GradientCard = ({ children, className = '', ...props }: Omit<CardProps, 'variant'>) => (
  <Card variant="gradient" className={className} {...props}>
    {children}
  </Card>
);

export const ElevatedCard = ({ children, className = '', ...props }: Omit<CardProps, 'variant'>) => (
  <Card variant="elevated" className={className} {...props}>
    {children}
  </Card>
);