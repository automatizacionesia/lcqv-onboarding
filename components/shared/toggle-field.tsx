'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import ErrorMessage from './error-message';

interface ToggleFieldProps {
  id: string;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  className?: string;
}

const ToggleField: React.FC<ToggleFieldProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  className,
}) => {
  return (
    <div className={cn('form-control', className)}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="form-label cursor-pointer">
          {label}
        </label>
        <button
          type="button"
          role="switch"
          aria-checked={value}
          onClick={() => onChange(!value)}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            value ? 'bg-agilidad' : 'bg-gray-200'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              value ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>
      <ErrorMessage message={error || ''} />
    </div>
  );
};

export default ToggleField;
