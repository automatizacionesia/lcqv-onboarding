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
        success: {
          style: {
            border: '1px solid #5B7CFD', // Agilidad
            background: 'white',
          },
        },
        error: {
          style: {
            border: '1px solid #FF4A4A', // Color de error
            background: 'white',
          },
        },
      }}
    />
  );
}
