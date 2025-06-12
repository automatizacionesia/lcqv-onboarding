'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import ErrorMessage from './error-message';

interface TextareaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
  rows?: number;
}

const TextareaField: React.FC<TextareaFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className,
  rows = 4,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  
  return (
    <div className={cn('form-control', className)}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'form-textarea',
          {
            'border-red-500': error,
            'border-agilidad': isFocused && !error,
          }
        )}
        required={required}
        onFocus={handleFocus}
        onBlur={handleBlur}
        rows={rows}
      />
      <ErrorMessage message={error || ''} />
    </div>
  );
};

export default TextareaField;
