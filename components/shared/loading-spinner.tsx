'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };
  
  const colorClasses = {
    primary: 'border-t-agilidad border-r-agilidad border-b-agilidad',
    white: 'border-t-white border-r-white border-b-white',
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={cn(
          'rounded-full border-l-transparent animate-spin',
          sizeClasses[size],
          colorClasses[color]
        )}
      />
      {text && <p className="mt-2 text-sm text-electricidad">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
