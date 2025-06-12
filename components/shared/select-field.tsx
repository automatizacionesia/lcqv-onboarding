'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import ErrorMessage from './error-message';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  className,
  placeholder = 'Selecciona una opción',
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
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'form-select',
          {
            'border-red-500': error,
            'border-agilidad': isFocused && !error,
          }
        )}
        required={required}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {/* <option value="" disabled>{placeholder}</option> */}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ErrorMessage message={error || ''} />
    </div>
  );
};

export default SelectField;
