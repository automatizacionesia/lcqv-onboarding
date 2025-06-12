'use client';

import React from 'react';
import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'white',
          color: '#090A5C', // Electricidad
          border: '1px solid #ACD4EF', // Frescura
        },
        classNames: {
          success: 'border-[#5B7CFD] bg-white', // Agilidad
          error: 'border-[#FF4A4A] bg-white', // Color de error
        },
        duration: 3000, // Duración por defecto de 3 segundos
        closeButton: true, // Mostrar botón de cierre
      }}
    />
  );
}
