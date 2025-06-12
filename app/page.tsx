'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/logo';
import LoadingSpinner from '@/components/shared/loading-spinner';
import { useUser } from '@/context/UserContext';
import apiService from '@/lib/api';
import { motion } from 'framer-motion';
import { notify } from '@/lib/utils';

// Página principal - Ingreso de ID único
export default function HomePage() {
  const [id, setId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { setUserData, setIsLoading } = useUser();

  // Animaciones para elementos
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  // Animación para errores
  const errorVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 15 
      }
    }
  };

  // Manejar validación de ID
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id.trim()) {
      setError('Por favor, ingresa un ID único');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Indicar que estamos cargando
      setIsLoading(true);
      
      // Mostrar toast de carga
      const loadingToastId = notify.loading('Validando ID...');
      
      // Llamar al webhook para validar el ID
      const response = await apiService.validateId(id);
      
      // Quitar toast de carga
      notify.dismiss(loadingToastId);
      
      if (response.success && response.userType && response.data) {
        // Mostrar toast de éxito
        notify.success('ID validado correctamente');
        
        // Guardar los datos del usuario
        setUserData({
          id: response.data.id || id,
          userType: response.userType,
          name: response.data.name || '',
          state: response.data.state || 'initial',
        });
        
        // Redirigir según el tipo de usuario (por ahora solo closer)
        if (response.userType === 'closer') {
          router.push('/closer');
        } else if (response.userType === 'restaurante') {
          // Guardar los datos en localStorage y redirigir a la pantalla de carga
          localStorage.setItem('restaurantData', JSON.stringify(response.data));
          router.push('/restaurant');
        } else {
          // Para otros tipos de usuario, mostrar mensaje por ahora
          notify.info(`Acceso como ${response.userType} - Implementación en progreso`);
        }
      } else {
        // Mostrar toast de error
        notify.error(response.message || 'Error al validar el ID');
        setError(response.message || 'Error al validar el ID. Por favor, intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error validating ID:', error);
      notify.error('Error de conexión. Por favor, verifica tu conexión e intenta nuevamente.');
      setError('Error de conexión. Por favor, verifica tu conexión e intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-crudo flex flex-col">
      <header className="bg-white shadow-sm border-b border-frescura/20 py-4">
        <div className="container mx-auto px-4">
          <Logo />
        </div>
      </header>
      
      <div className="flex-1 flex items-center justify-center">
        <motion.div 
          className="w-full max-w-md mx-auto px-4 py-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="bg-white p-8 rounded-lg shadow-md border border-frescura/30"
            variants={itemVariants}
          >
            <motion.div 
              className="text-center mb-8"
              variants={itemVariants}
            >
              <h2 className="text-2xl text-electricidad font-display mb-4">
                Bienvenido a La Cocina que Vende
              </h2>
              <p className="text-electricidad mb-6">
                Felicidades, diste un gran paso hacia el crecimiento exponencial de tu restaurante
              </p>
            </motion.div>
            
            <form onSubmit={handleSubmit}>
              <motion.div 
                className="mb-6"
                variants={itemVariants}
              >
                <label htmlFor="id" className="block mb-2 text-electricidad font-medium">
                  Ingresa tu ID único
                </label>
                <input
                  id="id"
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="w-full rounded-md border border-frescura bg-white px-4 py-3 text-electricidad focus:border-agilidad focus:outline-none focus:ring-2 focus:ring-agilidad transition-all duration-300"
                  placeholder="Ingresa el ID proporcionado"
                  aria-label="ID único"
                  autoComplete="off"
                />
                
                {error && (
                  <motion.p 
                    className="text-red-500 mt-2 text-sm"
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {error}
                  </motion.p>
                )}
              </motion.div>
              
              <motion.button
                type="submit"
                className="btn-primary w-full"
                disabled={isSubmitting}
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">Validando...</span>
                  </div>
                ) : (
                  'Ingresar'
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
