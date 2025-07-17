import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import ErrorMessage from './error-message';

interface Option {
  value: string;
  label: string;
}

interface AutocompleteFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  error?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

// Función para normalizar texto (eliminar tildes y pasar a minúsculas)
function normalize(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

const AutocompleteField: React.FC<AutocompleteFieldProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  placeholder = 'Selecciona un cliente',
  className,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [filtered, setFiltered] = useState<Option[]>(options);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setFiltered(
      options.filter(opt =>
        normalize(opt.label).includes(normalize(inputValue))
      )
    );
    setHighlighted(-1);
  }, [inputValue, options]);

  useEffect(() => {
    if (!showOptions) setInputValue(value ? options.find(o => o.value === value)?.label || '' : '');
  }, [showOptions, value, options]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowOptions(true);
  };

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setInputValue(option.label);
    setShowOptions(false);
  };

  const handleBlur = (e: React.FocusEvent) => {
    setTimeout(() => setShowOptions(false), 100); // Espera para permitir click
    if (!options.find(o => o.label === inputValue)) {
      setInputValue(value ? options.find(o => o.value === value)?.label || '' : '');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showOptions) return;
    if (e.key === 'ArrowDown') {
      setHighlighted(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      handleSelect(filtered[highlighted]);
    }
  };

  return (
    <div className={cn('form-control relative', className)}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={id}
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInput}
        onFocus={() => {
          setShowOptions(true);
          setInputValue('');
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'form-input',
          { 'border-red-500': error, 'border-agilidad': showOptions && !error }
        )}
        autoComplete="off"
        required={required}
        aria-autocomplete="list"
        aria-controls={id + '-list'}
        aria-expanded={showOptions}
        aria-activedescendant={highlighted >= 0 ? `${id}-option-${highlighted}` : undefined}
      />
      {showOptions && (
        <ul
          ref={listRef}
          id={id + '-list'}
          className="absolute z-10 w-full bg-white border border-frescura rounded-md mt-1 max-h-56 overflow-auto shadow-lg"
          role="listbox"
        >
          {filtered.length === 0 && (
            <li className="px-4 py-2 text-electricidad/60">No hay coincidencias</li>
          )}
          {filtered.map((option, idx) => (
            <li
              key={option.value}
              id={`${id}-option-${idx}`}
              role="option"
              aria-selected={value === option.value}
              className={cn(
                'px-4 py-2 cursor-pointer hover:bg-frescura/30',
                { 'bg-frescura/40': highlighted === idx, 'font-bold': value === option.value }
              )}
              onMouseDown={() => handleSelect(option)}
              onMouseEnter={() => setHighlighted(idx)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
      <ErrorMessage message={error || ''} />
    </div>
  );
};

export default AutocompleteField; 