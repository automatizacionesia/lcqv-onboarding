'use client';

import { useState, useEffect } from 'react';
import { storageHelper } from '@/lib/utils';

// Custom hook para persistencia de datos en localStorage con expiración
export function useLocalStorage<T>(key: string, initialValue: T, expiryDays = 10) {
  // Inicializar estado con valor de localStorage o initialValue
  const [value, setValue] = useState<T>(() => {
    // Obtener valor almacenado en la inicialización del hook
    const storedValue = storageHelper.get(key);
    return storedValue !== null ? storedValue : initialValue;
  });
  
  // Actualizar localStorage cuando cambia el estado
  useEffect(() => {
    storageHelper.set(key, value, expiryDays);
  }, [key, value, expiryDays]);
  
  // Retornar valor del estado y función para actualizarlo
  return [value, setValue] as const;
}

// Hook para autoguardado de datos de formulario periódicamente
export function useAutoSave<T>(key: string, data: T, interval = 30000, expiryDays = 10) {
  useEffect(() => {
    // Guardar datos inmediatamente
    storageHelper.set(key, data, expiryDays);
    
    // Configurar intervalo para guardado periódico
    const intervalId = setInterval(() => {
      storageHelper.set(key, data, expiryDays);
    }, interval);
    
    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalId);
  }, [key, data, interval, expiryDays]);
  
  // Retornar funciones para guardar o limpiar datos manualmente
  return {
    save: () => storageHelper.set(key, data, expiryDays),
    clear: () => storageHelper.remove(key),
  };
}
