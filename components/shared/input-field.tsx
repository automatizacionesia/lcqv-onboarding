'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import ErrorMessage from './error-message';

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
  prefix?: string;
  onBlur?: () => void;
  min?: number;
  max?: number;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  required = false,
  className,
  prefix,
  onBlur,
  min,
  max,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };
  
  return (
    <div className={cn('form-control', className)}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className={cn('relative', { 'border-agilidad rounded-md': prefix })}>
        {prefix && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-electricidad/60">
            {prefix}
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'form-input',
            {
              'pl-8': prefix,
              'border-red-500': error,
              'border-agilidad': isFocused && !error,
            }
          )}
          required={required}
          onFocus={handleFocus}
          onBlur={handleBlur}
          min={min}
          max={max}
        />
      </div>
      <ErrorMessage message={error || ''} />
    </div>
  );
};

export default InputField;
