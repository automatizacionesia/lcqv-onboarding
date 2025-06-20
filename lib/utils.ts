import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';

// Utilidad para combinar clases de Tailwind CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Sistema de notificaciones tipo toast
export const notify = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
    });
  },
  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
    });
  },
  info: (message: string) => {
    toast.info(message, {
      duration: 3000,
    });
  },
  loading: (message: string) => {
    return toast.loading(message, {
      duration: 10000, // 10 segundos máximo para toasts de carga
    });
  },
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },
  dismissAll: () => {
    toast.dismiss();
  },
};

// Utlidades para localStorage con expiración
export const storageHelper = {
  set: (key: string, value: any, expiryDays = 10) => {
    try {
      const item = {
        value,
        expiry: new Date().getTime() + expiryDays * 24 * 60 * 60 * 1000,
      };
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },
  
  get: (key: string) => {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;
      
      const item = JSON.parse(itemStr);
      const now = new Date().getTime();
      
      if (now > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Error retrieving from localStorage:', error);
      return null;
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// Validadores para formularios
export const validators = {
  required: (value: any) => {
    if (value === undefined || value === null || value === '') {
      return 'Este campo es obligatorio';
    }
    return null;
  },
  
  email: (value: string) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Introduce un correo electrónico válido';
    }
    return null;
  },
  
  minLength: (value: string, min: number) => {
    if (!value) return null;
    if (value.length < min) {
      return `Debe tener al menos ${min} caracteres`;
    }
    return null;
  },
  
  number: (value: any) => {
    if (!value && value !== 0) return null;
    if (isNaN(Number(value))) {
      return 'Debe ser un número';
    }
    return null;
  },
  
  minValue: (value: number, min: number) => {
    if (value === undefined || value === null) return null;
    if (value < min) {
      return `El valor mínimo es ${min}`;
    }
    return null;
  }
};
