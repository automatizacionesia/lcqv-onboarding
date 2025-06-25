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
import { uploadToMinio } from '../problemas/minioUpload';

// Valores por defecto para el formulario
const defaultFormData: CloserFormData = {
  closerName: '',
  restaurantName: '',
  package: 'mensual',
  amountPaid: 0,
  adsAmount: 0,
  instagram: '',
  hasGuarantee: false,
  branchCount: 1,
  notes: '',
};

// Ampliar CloserFormData para los nuevos campos
interface ExtendedCloserFormData extends CloserFormData {
  comprobantePago?: string | null;
  valorMensualidad?: number | null;
}

// Tipos para errores del formulario
interface FormErrors {
  closerName?: string;
  restaurantName?: string;
  package?: string;
  amountPaid?: string;
  adsAmount?: string;
  instagram?: string;
  hasGuarantee?: string;
  branchCount?: string;
  notes?: string;
  comprobantePago?: string;
  valorMensualidad?: string;
}

// Componente principal para la página del Closer
export default function CloserPage() {
  // Estado para el manejo de formulario
  const [formData, setFormData] = useLocalStorage<ExtendedCloserFormData>('closerFormData', { ...defaultFormData, comprobantePago: null, valorMensualidad: null });
  const [errors, setErrors] = useState<FormErrors>({});
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [idMessage, setIdMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPreviousSession, setHasPreviousSession] = useState(false);
  const [uploadingComprobante, setUploadingComprobante] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  
  const { userData, isLoading } = useUser();
  const router = useRouter();
  
  // Autoguardado del formulario cada 30 segundos
  const { save } = useAutoSave('closerFormData', formData);
  
  // Limpiar toasts al desmontar el componente
  useEffect(() => {
    return () => {
      notify.dismissAll();
    };
  }, []);
  
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
  const handleInputChange = (field: keyof ExtendedCloserFormData, value: any) => {
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
  
  // Manejar subida de comprobante
  const handleComprobanteUpload = async (file: File) => {
    if (!file) return;
    try {
      setUploadingComprobante(true);
      setUploadMessage('Subiendo comprobante, por favor espera...');
      const url = await uploadToMinio({ file, bucket: 'imagenespropias' });
      setFormData((prev: ExtendedCloserFormData) => ({ ...prev, comprobantePago: url }));
      setUploadingComprobante(false);
      setUploadMessage('¡Comprobante subido con éxito!');
      setTimeout(() => setUploadMessage(null), 3000);
    } catch (error) {
      setUploadingComprobante(false);
      setUploadMessage('Error al subir el comprobante. Intenta nuevamente.');
      setTimeout(() => setUploadMessage(null), 3000);
    }
  };
  
  // Validar campos del formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    // Validar closer
    const closerNameError = validators.required(formData.closerName);
    if (closerNameError) newErrors.closerName = closerNameError;
    // Validar nombre del restaurante
    const restaurantNameError = validators.required(formData.restaurantName);
    if (restaurantNameError) newErrors.restaurantName = restaurantNameError;
    // Validar paquete
    const packageError = validators.required(formData.package);
    if (packageError) newErrors.package = packageError;
    // Validar monto pagado
    const amountPaidError = validators.required(formData.amountPaid) || 
      validators.number(formData.amountPaid) ||
      validators.minValue(formData.amountPaid, 0);
    if (amountPaidError) newErrors.amountPaid = amountPaidError;
    // Validar presupuesto para ADS
    const adsAmountError = validators.required(formData.adsAmount) || 
      validators.number(formData.adsAmount) ||
      validators.minValue(formData.adsAmount, 0);
    if (adsAmountError) newErrors.adsAmount = adsAmountError;
    // Validar Instagram
    if (!formData.instagram || formData.instagram.trim() === '') {
      newErrors.instagram = 'El usuario de Instagram es obligatorio';
    }
    // Validar garantía (no requerido, pero debe ser booleano)
    // Validar número de sedes
    if (!formData.branchCount || formData.branchCount < 1) {
      newErrors.branchCount = 'Debe haber al menos una sede';
    }
    // Notas no es requerido
    // Validar comprobante de pago
    if (!formData.comprobantePago) {
      (newErrors as any).comprobantePago = 'El comprobante de pago es obligatorio';
    }
    // Validar valor mensualidad
    if (formData.valorMensualidad === undefined || formData.valorMensualidad === null || isNaN(Number(formData.valorMensualidad))) {
      (newErrors as any).valorMensualidad = 'El valor de la mensualidad es obligatorio';
    } else if (Number(formData.valorMensualidad) < 0) {
      (newErrors as any).valorMensualidad = 'El valor debe ser mayor o igual a 0';
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
    
    let loadingToastId: string | null = null;
    
    try {
      // Mostrar toast de carga
      loadingToastId = String(notify.loading('Generando ID único...'));
      
      const response = await apiService.generateId(formData);
      
      // Quitar toast de carga
      if (loadingToastId) {
        notify.dismiss(loadingToastId);
        loadingToastId = null;
      }
      
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
      
      // Asegurar que se cierre el toast de loading en caso de error
      if (loadingToastId) {
        notify.dismiss(loadingToastId);
      }
      
      notify.error('Error de conexión. Por favor, verifica tu conexión e intenta nuevamente.');
    } finally {
      // Asegurar que se cierre el toast de loading en el finally
      if (loadingToastId) {
        notify.dismiss(loadingToastId);
      }
      
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
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="grid grid-cols-1 gap-6 sm:gap-8 w-full"
                >
                  <InputField
                    id="closerName"
                    label="Closer que cerró la venta"
                    value={formData.closerName}
                    onChange={(value) => handleInputChange('closerName', value)}
                    error={errors.closerName}
                    required
                    className=""
                  />
                  <InputField
                    id="restaurantName"
                    label="Nombre del restaurante"
                    value={formData.restaurantName}
                    onChange={(value) => handleInputChange('restaurantName', value)}
                    error={errors.restaurantName}
                    required
                    className=""
                  />
                  <SelectField
                    id="package"
                    label="Paquete contratado"
                    value={formData.package}
                    onChange={(value) => handleInputChange('package', value)}
                    options={[
                      { value: 'mensual', label: 'Paquete mensual' },
                      { value: '3months', label: 'Paquete de 3 meses' },
                      { value: '6months', label: 'Paquete de 6 meses' },
                    ]}
                    error={errors.package}
                    required
                    className=""
                  />
                  <InputField
                    id="amountPaid"
                    label="¿Cuánto pagó el cliente en total por el paquete? (Mensual, trimestral o semestral)"
                    value={formData.amountPaid !== undefined && formData.amountPaid !== null ? formData.amountPaid.toString() : ''}
                    onChange={(value: string) => handleInputChange('amountPaid', Number(value))}
                    type="number"
                    prefix="$"
                    error={errors.amountPaid}
                    required
                    className=""
                    min={0}
                  />
                  <InputField
                    id="adsAmount"
                    label="¿Cuál será el gasto en ADS?"
                    value={formData.adsAmount !== undefined && formData.adsAmount !== null ? formData.adsAmount.toString() : ''}
                    onChange={(value: string) => handleInputChange('adsAmount', Number(value))}
                    type="number"
                    prefix="$"
                    error={errors.adsAmount}
                    required
                    className=""
                    min={0}
                  />
                  <InputField
                    id="instagram"
                    label="Usuario de Instagram del restaurante"
                    value={formData.instagram}
                    onChange={(value) => handleInputChange('instagram', value)}
                    error={errors.instagram}
                    required
                    className=""
                  />
                  <InputField
                    id="valorMensualidad"
                    label="¿En qué valor quedó la mensualidad del cliente?"
                    value={formData.valorMensualidad !== undefined && formData.valorMensualidad !== null ? formData.valorMensualidad.toString() : ''}
                    onChange={(value: string) => handleInputChange('valorMensualidad', Number(value))}
                    type="number"
                    prefix="$"
                    error={errors.valorMensualidad}
                    required
                    className=""
                    min={0}
                  />
                  <div>
                    <label className="block font-medium mb-2">Adjunta el comprobante del pago del cliente</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleComprobanteUpload(e.target.files[0])}
                      className="w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-frescura/20 file:text-electricidad
                        hover:file:bg-frescura/30"
                    />
                    {uploadingComprobante && <p className="text-sm text-electricidad mt-2">{uploadMessage}</p>}
                    {!uploadingComprobante && uploadMessage && <p className="text-sm text-green-600 mt-2">{uploadMessage}</p>}
                    {errors.comprobantePago && <p className="text-red-500 text-sm mt-1">{errors.comprobantePago}</p>}
                    {formData.comprobantePago && !uploadingComprobante && (
                      <div className="mt-4">
                        <p className="text-sm font-medium">Comprobante subido:</p>
                        <img src={formData.comprobantePago} alt="Comprobante" className="mt-2 rounded-md max-h-48" />
                      </div>
                    )}
                  </div>
                  <ToggleField
                    id="hasGuarantee"
                    label="¿Entran con garantía?"
                    value={formData.hasGuarantee}
                    onChange={(value) => handleInputChange('hasGuarantee', value)}
                    className=""
                  />
                  <InputField
                    id="branchCount"
                    label="¿Número de sedes que vamos a manejar?"
                    value={formData.branchCount !== undefined && formData.branchCount !== null ? formData.branchCount.toString() : ''}
                    onChange={(value: string) => handleInputChange('branchCount', Number(value))}
                    type="number"
                    error={errors.branchCount}
                    required
                    className=""
                    min={1}
                  />
                  <TextareaField
                    id="notes"
                    label="¿Recomendaciones importantes sobre la pauta o algo que debamos saber sobre pagos, referidos o algo en particular?"
                    value={formData.notes}
                    onChange={(value) => handleInputChange('notes', value)}
                    error={errors.notes}
                    className=""
                    rows={3}
                  />
                  <motion.button
                    type="submit"
                    className="btn-primary w-full mt-2"
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
