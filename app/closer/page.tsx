'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/logo';
import LoadingSpinner from '@/components/shared/loading-spinner';
import InputField from '@/components/shared/input-field';
import SelectField from '@/components/shared/select-field';
import TextareaField from '@/components/shared/textarea-field';
import ToggleField from '@/components/shared/toggle-field';
import { CloserFormData } from '@/lib/types';
import { validators, notify } from '@/lib/utils';
import apiService from '@/lib/api';
import { useLocalStorage, useAutoSave } from '@/hooks/useLocalStorage';
import { useUser } from '@/context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';

// Valores por defecto para el formulario
const defaultFormData: CloserFormData = {
  restaurantName: '',
  package: 'mensual',
  amountPaid: 0,
  adsAmount: 0,
  hasGuarantee: false,
  closerName: '',
  instagram: '',
  adsPlatform: 'Meta',
  branchCount: 1,
  notes: '',
};

// Tipos para errores del formulario
interface FormErrors {
  restaurantName?: string;
  package?: string;
  amountPaid?: string;
  adsAmount?: string;
  closerName?: string;
  instagram?: string;
  adsPlatform?: string;
  branchCount?: string;
}

// Componente principal para la página del Closer
export default function CloserPage() {
  // Estado para el manejo de formulario
  const [formData, setFormData] = useLocalStorage<CloserFormData>('closerFormData', defaultFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [idMessage, setIdMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPreviousSession, setHasPreviousSession] = useState(false);
  
  const { userData, isLoading } = useUser();
  const router = useRouter();
  
  // Autoguardado del formulario cada 30 segundos
  const { save } = useAutoSave('closerFormData', formData);
  
  // Redireccionar si no está autenticado o no es un closer
  useEffect(() => {
    if (!isLoading && (!userData || userData.userType !== 'closer')) {
      notify.error('No tienes acceso a esta página');
      router.push('/');
      return;
    }
    
    // Comprobar si existe una sesión anterior
    const savedData = localStorage.getItem('closerFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.value && parsedData.value.restaurantName) {
          setHasPreviousSession(true);
        }
      } catch (e) {
        console.error('Error al analizar datos guardados:', e);
      }
    }
  }, [userData, isLoading, router]);
  
  // Manejar cambios en los campos del formulario
  const handleInputChange = (field: keyof CloserFormData, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    
    // Limpiar error para este campo
    if (errors[field as keyof FormErrors]) {
      setErrors({
        ...errors,
        [field]: undefined,
      });
    }
  };
  
  // Validar campos del formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validar nombre del restaurante
    const restaurantNameError = validators.required(formData.restaurantName);
    if (restaurantNameError) {
      newErrors.restaurantName = restaurantNameError;
    }
    
    // Validar paquete
    const packageError = validators.required(formData.package);
    if (packageError) {
      newErrors.package = packageError;
    }
    
    // Validar monto pagado
    const amountPaidError = validators.required(formData.amountPaid) || 
      validators.number(formData.amountPaid) ||
      validators.minValue(formData.amountPaid, 0);
    if (amountPaidError) {
      newErrors.amountPaid = amountPaidError;
    }
    
    // Validar presupuesto para ADS
    const adsAmountError = validators.required(formData.adsAmount) || 
      validators.number(formData.adsAmount) ||
      validators.minValue(formData.adsAmount, 0);
    if (adsAmountError) {
      newErrors.adsAmount = adsAmountError;
    }
    
    // Validar nombre del closer
    const closerNameError = validators.required(formData.closerName);
    if (closerNameError) {
      newErrors.closerName = closerNameError;
    }
    
    // Validar Instagram
    if (!formData.instagram || formData.instagram.trim() === '') {
      newErrors.instagram = 'El usuario de Instagram es obligatorio';
    }
    
    // Validar plataforma de pauta
    if (!formData.adsPlatform) {
      newErrors.adsPlatform = 'Selecciona una plataforma de pauta';
    }
    
    // Validar número de sedes
    if (!formData.branchCount || formData.branchCount < 1) {
      newErrors.branchCount = 'Debe haber al menos una sede';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Mostrar toast de carga
      const loadingToastId: string = String(notify.loading('Generando ID único...'));
      
      const response = await apiService.generateId(formData);
      
      // Quitar toast de carga
      notify.dismiss(loadingToastId);
      
      if (response.success && response.data) {
        // Mostrar toast de éxito
        notify.success('ID generado correctamente');
        
        // Aseguramos que el mensaje siempre sea string
        const mensaje = typeof response.data.respuesta === 'string' ? response.data.respuesta : '';
        setGeneratedId(String(response.data.id));
        setIdMessage(mensaje);
        
        // Limpiar datos del formulario
        setFormData(defaultFormData);
        localStorage.removeItem('closerFormData');
      } else {
        // Mostrar toast de error
        notify.error(response.message || 'Error al generar el ID. Por favor, intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error generando ID:', error);
      notify.error('Error de conexión. Por favor, verifica tu conexión e intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Manejar inicio de un nuevo registro
  const handleNewRegistration = () => {
    setGeneratedId(null);
    setIdMessage(null);
    setFormData(defaultFormData);
  };
  
  // Manejar copia de mensaje al portapapeles
  const handleCopyMessage = () => {
    if (idMessage && idMessage.length > 0) {
      navigator.clipboard.writeText(idMessage)
        .then(() => {
          notify.success('Mensaje copiado al portapapeles');
        })
        .catch((err) => {
          console.error('Error copiando texto: ', err);
          notify.error('Error al copiar el mensaje. Por favor, inténtalo manualmente.');
        });
    } else {
      notify.error('No hay mensaje para copiar.');
    }
  };
  
  // Restaurar sesión anterior
  const restorePreviousSession = () => {
    try {
      const savedData = localStorage.getItem('closerFormData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.value) {
          setFormData(parsedData.value);
        }
      }
      setHasPreviousSession(false);
    } catch (e) {
      console.error('Error restaurando sesión:', e);
    }
  };
  
  // Descartar sesión anterior
  const discardPreviousSession = () => {
    setHasPreviousSession(false);
    setFormData(defaultFormData);
    localStorage.removeItem('closerFormData');
  };
  
  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" text="Cargando..." />
      </div>
    );
  }
  
  // Mostrar diálogo de restauración de sesión
  if (hasPreviousSession) {
    return (
      <div className="min-h-screen bg-crudo flex flex-col">
        <header className="bg-white shadow-sm border-b border-frescura/20 py-4">
          <div className="container mx-auto px-4">
            <Logo />
          </div>
        </header>
        
        <div className="flex-1 flex items-center justify-center">
          <motion.div 
            className="w-full max-w-xl bg-white p-8 rounded-lg shadow-md border border-frescura/30 mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.h2 
              className="text-xl text-electricidad font-display mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              Sesión anterior detectada
            </motion.h2>
            <motion.p 
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              Hemos detectado que tienes una sesión anterior sin completar. ¿Deseas continuarla o comenzar una nueva?
            </motion.p>
            
            <motion.div 
              className="flex space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <motion.button 
                onClick={restorePreviousSession}
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Continuar sesión anterior
              </motion.button>
              
              <motion.button 
                onClick={discardPreviousSession}
                className="btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Comenzar nueva
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-crudo flex flex-col">
      <header className="bg-white shadow-sm border-b border-frescura/20 py-4">
        <div className="container mx-auto px-4">
          <Logo />
        </div>
      </header>
      
      <div className="flex-1">
        <motion.div 
          className="w-full max-w-3xl mx-auto px-4 py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {generatedId ? (
              // Pantalla de confirmación
              <motion.div 
                key="confirmation"
                className="bg-white p-8 rounded-lg shadow-md border border-frescura/30"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                <motion.h2 
                  className="text-xl text-electricidad font-display mb-6"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  Por favor, envía este mensaje al cliente
                </motion.h2>
                
                <motion.div 
                  className="bg-crudo p-6 rounded-md border border-electricidad/10 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  {idMessage ? (
                    <p className="text-electricidad whitespace-pre-wrap font-medium">{idMessage}</p>
                  ) : (
                    <p className="text-red-500">No se recibió ningún mensaje del servidor.</p>
                  )}
                </motion.div>
                
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <motion.button 
                    onClick={handleCopyMessage}
                    className="btn-primary flex-1"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Copiar mensaje
                  </motion.button>
                  
                  <motion.button 
                    onClick={handleNewRegistration}
                    className="btn-secondary flex-1"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Generar nuevo ID
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => router.push('/')}
                    className="btn-outline flex-1"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Salir
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : (
              // Formulario de registro
              <motion.div 
                key="form"
                className="bg-white p-8 rounded-lg shadow-md border border-frescura/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.h2 
                  className="text-xl text-electricidad font-display mb-6"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  Registra un nuevo restaurante
                </motion.h2>
                
                <motion.form 
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <InputField
                    id="restaurantName"
                    label="Nombre del restaurante"
                    value={formData.restaurantName}
                    onChange={(value) => handleInputChange('restaurantName', value)}
                    error={errors.restaurantName}
                    required
                    className="mb-6"
                  />
                  
                  <SelectField
                    id="package"
                    label="Paquete contratado"
                    value={formData.package}
                    onChange={(value) => handleInputChange('package', value)}
                    options={[
                      { value: 'mensual', label: 'Mensual' },
                      { value: '3months', label: '3 meses' },
                      { value: '6months', label: '6 meses' },
                    ]}
                    error={errors.package}
                    required
                    className="mb-6"
                  />
                  
                  <InputField
                    id="amountPaid"
                    label="Monto pagado"
                    value={formData.amountPaid !== undefined && formData.amountPaid !== null ? formData.amountPaid.toString() : ''}
                    onChange={(value: string) => handleInputChange('amountPaid', Number(value))}
                    type="number"
                    prefix="$"
                    error={errors.amountPaid}
                    required
                    className="mb-6"
                    min={0}
                  />
                  
                  <InputField
                    id="adsAmount"
                    label="Presupuesto para ADS"
                    value={formData.adsAmount !== undefined && formData.adsAmount !== null ? formData.adsAmount.toString() : ''}
                    onChange={(value: string) => handleInputChange('adsAmount', Number(value))}
                    type="number"
                    prefix="$"
                    error={errors.adsAmount}
                    required
                    className="mb-6"
                    min={0}
                  />
                  
                  <ToggleField
                    id="hasGuarantee"
                    label="¿Tiene garantía?"
                    value={formData.hasGuarantee}
                    onChange={(value) => handleInputChange('hasGuarantee', value)}
                    className="mb-6"
                  />
                  
                  <InputField
                    id="closerName"
                    label="Nombre del closer"
                    value={formData.closerName}
                    onChange={(value) => handleInputChange('closerName', value)}
                    error={errors.closerName}
                    required
                    className="mb-6"
                  />
                  
                  <InputField
                    id="instagram"
                    label="Usuario de Instagram"
                    value={formData.instagram}
                    onChange={(value) => handleInputChange('instagram', value)}
                    error={errors.instagram}
                    required
                    className="mb-6"
                  />
                  
                  <SelectField
                    id="adsPlatform"
                    label="¿La pauta será solo a Meta o Meta y TikTok?"
                    value={formData.adsPlatform}
                    onChange={(value) => handleInputChange('adsPlatform', value)}
                    options={[
                      { value: 'Meta', label: 'Meta' },
                      { value: 'Meta y TikTok', label: 'Meta y TikTok' },
                    ]}
                    error={errors.adsPlatform}
                    required
                    className="mb-6"
                  />
                  
                  <InputField
                    id="branchCount"
                    label="¿Número de sedes que vamos a manejar?"
                    value={formData.branchCount !== undefined && formData.branchCount !== null ? formData.branchCount.toString() : ''}
                    onChange={(value: string) => handleInputChange('branchCount', Number(value))}
                    type="number"
                    min={1}
                    error={errors.branchCount}
                    required
                    className="mb-6"
                  />
                  
                  <TextareaField
                    id="notes"
                    label="¿Recomendaciones importantes sobre la pauta o algo que debamos saber?"
                    value={formData.notes}
                    onChange={(value) => handleInputChange('notes', value)}
                    className="mb-6"
                  />
                  
                  <motion.button
                    type="submit"
                    className="btn-primary w-full"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <LoadingSpinner size="sm" color="white" />
                        <span className="ml-2">Generando ID único...</span>
                      </div>
                    ) : (
                      'Generar ID'
                    )}
                  </motion.button>
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
