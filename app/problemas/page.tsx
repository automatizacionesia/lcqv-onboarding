'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/logo';
import LoadingSpinner from '@/components/shared/loading-spinner';
import InputField from '@/components/shared/input-field';
import TextareaField from '@/components/shared/textarea-field';
import { notify } from '@/lib/utils';
import { useUser } from '@/context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadToMinio } from './minioUpload';
import AutocompleteField from '@/components/shared/AutocompleteField';

interface FormData {
  cliente: string;
  motivo: string;
  imagen: string | null;
}

export default function ProblemasPage() {
  const router = useRouter();
  const { userData, isLoading } = useUser();
  const [form, setForm] = useState<FormData>({
    cliente: '',
    motivo: '',
    imagen: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [view, setView] = useState<'menu' | 'registrar'>('menu');
  const [clientesOptions, setClientesOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [clientesError, setClientesError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!userData || userData.userType !== 'problemas')) {
      notify.error('No tienes acceso a esta página');
      router.push('/');
    }
  }, [userData, isLoading, router]);

  const validate = () => {
    const newErrors: any = {};
    if (!form.cliente) newErrors.cliente = 'El nombre del cliente es obligatorio';
    if (!form.motivo) newErrors.motivo = 'El motivo es obligatorio';
    if (!form.imagen) newErrors.imagen = 'La imagen del caso es obligatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    try {
      setUploading(true);
      setUploadMessage('Subiendo imagen, por favor espera...');
      const url = await uploadToMinio({ file, bucket: 'liosdeclientes' });
      setForm((prev) => ({ ...prev, imagen: url }));
      setUploading(false);
      setUploadMessage('¡Imagen subida con éxito!');
      setTimeout(() => setUploadMessage(null), 3000);
    } catch (error) {
      setUploading(false);
      setUploadMessage('Error al subir la imagen. Intenta nuevamente.');
      setTimeout(() => setUploadMessage(null), 3000);
    }
  };

  const handleShowRegistrar = async () => {
    setLoadingClientes(true);
    setClientesError(null);
    try {
      const res = await fetch('https://webhook.lacocinaquevende.com/webhook/devolverrestaurantes');
      if (!res.ok) throw new Error('No se pudo conectar al servidor');
      const data = await res.json();
      const options = Array.isArray(data)
        ? data.map((item: any) => ({ value: item["Nombre del restaurante"], label: item["Nombre del restaurante"] }))
        : [];
      if (!options.length) throw new Error('No se recibieron restaurantes');
      setClientesOptions(options);
      setView('registrar');
    } catch (e: any) {
      setClientesError(e.message || 'Error al cargar la lista de clientes');
      notify.error(e.message || 'Error al cargar la lista de clientes');
    } finally {
      setLoadingClientes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (uploading) {
      notify.error('Por favor espera a que termine de subirse la imagen.');
      return;
    }
    setIsSubmitting(true);
    let loadingToastId: string | null = null;
    try {
      loadingToastId = String(notify.loading('Registrando advertencia...'));
      const response = await fetch('https://webhook.lacocinaquevende.com/webhook/lioconclientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, timestamp: new Date().toISOString() }),
      });
      if (loadingToastId) notify.dismiss(loadingToastId);
      if (response.ok) {
        notify.success('Registrado con éxito');
        setTimeout(() => router.push('/'), 1500);
        setForm({ cliente: '', motivo: '', imagen: null });
      } else {
        notify.error('Error al registrar la advertencia');
      }
    } catch (error) {
      if (loadingToastId) notify.dismiss(loadingToastId);
      notify.error('Error de conexión. Intenta nuevamente.');
    } finally {
      if (loadingToastId) notify.dismiss(loadingToastId);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" text="Cargando..." />
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
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-xl bg-white p-8 rounded-lg shadow-md border border-frescura/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {view === 'menu' && (
            <div className="flex flex-col gap-6 items-center">
              <h1 className="text-2xl font-bold text-electricidad mb-6 text-center">¿Qué deseas hacer?</h1>
              <button
                className="btn-primary w-full"
                onClick={handleShowRegistrar}
                disabled={loadingClientes}
              >
                {loadingClientes ? 'Cargando clientes...' : 'Registrar'}
              </button>
              {clientesError && (
                <p className="text-red-500 text-center mt-2">{clientesError}</p>
              )}
              <button
                className="btn-secondary w-full"
                onClick={() => router.push('/problemas/visualizar')}
              >
                Visualizar
              </button>
            </div>
          )}
          {view === 'registrar' && clientesOptions.length > 0 && (
            <>
              <h1 className="text-2xl font-bold text-electricidad mb-6 text-center">Registrar Advertencia a Cliente</h1>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <p className="text-sm text-electricidad mb-2 bg-frescura/10 p-2 rounded">Busca el nombre del restaurante y selecciónalo</p>
                  <AutocompleteField
                    id="cliente"
                    label="Cliente"
                    value={form.cliente}
                    onChange={(value) => setForm((prev) => ({ ...prev, cliente: value }))}
                    options={clientesOptions}
                    error={errors.cliente}
                    required
                    placeholder="Busca y selecciona un cliente"
                  />
                </div>
                <TextareaField
                  id="motivo"
                  label="Motivo"
                  value={form.motivo}
                  onChange={(value) => setForm((prev) => ({ ...prev, motivo: value }))}
                  error={errors.motivo}
                  required
                  rows={4}
                />
                <div>
                  <label className="block font-medium mb-2">Imagen del caso</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                    className="w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-frescura/20 file:text-electricidad
                      hover:file:bg-frescura/30"
                  />
                  {uploading && <p className="text-sm text-electricidad mt-2">{uploadMessage}</p>}
                  {!uploading && uploadMessage && <p className="text-sm text-green-600 mt-2">{uploadMessage}</p>}
                  {errors.imagen && <p className="text-red-500 text-sm mt-1">{errors.imagen}</p>}
                  {form.imagen && !uploading && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">Imagen subida:</p>
                      <img src={form.imagen} alt="Previsualización" className="mt-2 rounded-md max-h-48" />
                    </div>
                  )}
                </div>
                <motion.button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={isSubmitting || uploading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isSubmitting ? 'Enviando...' : 'Registrar Advertencia'}
                </motion.button>
                <button
                  type="button"
                  className="btn-secondary w-full"
                  onClick={() => setView('menu')}
                >
                  Volver al menú
                </button>
              </form>
            </>
          )}
          {view === 'registrar' && clientesOptions.length === 0 && (
            <div className="text-center text-red-500 mt-6">No se pudo cargar la lista de restaurantes. Por favor, vuelve a intentarlo.</div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 