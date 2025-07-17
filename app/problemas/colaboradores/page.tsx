"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from '@/components/logo';
import LoadingSpinner from '@/components/shared/loading-spinner';
import InputField from '@/components/shared/input-field';
import TextareaField from '@/components/shared/textarea-field';
import { notify } from '@/lib/utils';
import { useUser } from '@/context/UserContext';
import { motion } from 'framer-motion';
import { uploadToMinio } from '../minioUpload';
import AutocompleteField from '@/components/shared/AutocompleteField';

interface FormData {
  colaborador: string;
  motivo: string;
  pruebas: string | null; // Puede ser link de imagen o link de Loom
}

export default function ProblemasColabPage() {
  const router = useRouter();
  const { userData, isLoading } = useUser();
  const [form, setForm] = useState<FormData>({
    colaborador: '',
    motivo: '',
    pruebas: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [view, setView] = useState<'menu' | 'registrar'>('menu');
  const [colabOptions, setColabOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingColabs, setLoadingColabs] = useState(false);
  const [colabsError, setColabsError] = useState<string | null>(null);
  const [loomLink, setLoomLink] = useState('');
  const [pruebaTipo, setPruebaTipo] = useState<'imagen' | 'loom' | null>(null);

  useEffect(() => {
    if (!isLoading && (!userData || userData.userType !== 'problemas_colab')) {
      notify.error('No tienes acceso a esta página');
      router.push('/');
    }
  }, [userData, isLoading, router]);

  const validate = () => {
    const newErrors: any = {};
    if (!form.colaborador) newErrors.colaborador = 'El colaborador/a es obligatorio';
    if (!form.motivo) newErrors.motivo = 'El motivo es obligatorio';
    if (pruebaTipo === 'imagen' && !form.pruebas) newErrors.pruebas = 'Debes subir una imagen';
    if (pruebaTipo === 'loom' && !loomLink) newErrors.pruebas = 'Debes ingresar un link de Loom';
    if (pruebaTipo === 'loom' && loomLink && !/^https?:\/\/(www\.)?loom\.com\//.test(loomLink)) newErrors.pruebas = 'El link de Loom no es válido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setUploadMessage('Subiendo imagen, por favor espera...');
    try {
      const url = await uploadToMinio({ file, bucket: 'liosdecolaboradores' });
      if (url) {
        setForm((prev) => ({ ...prev, pruebas: url }));
        setUploadMessage('¡Imagen subida con éxito!');
        setErrors((prev: any) => ({ ...prev, pruebas: undefined }));
      } else {
        setForm((prev) => ({ ...prev, pruebas: null }));
        setUploadMessage('Error al subir la imagen. Intenta nuevamente.');
      }
    } catch (error) {
      setForm((prev) => ({ ...prev, pruebas: null }));
      setUploadMessage('Error al subir la imagen. Intenta nuevamente.');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadMessage(null), 3000);
    }
  };

  const handleShowRegistrar = async () => {
    setLoadingColabs(true);
    setColabsError(null);
    try {
      const res = await fetch('https://webhook.lacocinaquevende.com/webhook/devolverusuarios');
      if (!res.ok) throw new Error('No se pudo conectar al servidor');
      const data = await res.json();
      const options = Array.isArray(data)
        ? data
            .filter((item: any) => item["Nombre del restaurante"] && typeof item["Nombre del restaurante"] === 'string' && item["Nombre del restaurante"].trim() !== '')
            .map((item: any) => ({ value: item["Nombre del restaurante"], label: item["Nombre del restaurante"] }))
        : [];
      if (!options.length) throw new Error('No se recibieron colaboradores');
      setColabOptions(options);
      setView('registrar');
    } catch (e: any) {
      setColabsError(e.message || 'Error al cargar la lista de colaboradores');
      notify.error(e.message || 'Error al cargar la lista de colaboradores');
    } finally {
      setLoadingColabs(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Si hay link de Loom, lo priorizamos sobre la imagen
    let pruebasFinal = null;
    if (pruebaTipo === 'imagen') {
      pruebasFinal = form.pruebas;
    } else if (pruebaTipo === 'loom') {
      pruebasFinal = loomLink;
    }
    if (!validate()) return;
    if (uploading) {
      notify.error('Por favor espera a que termine de subirse la imagen.');
      return;
    }
    setIsSubmitting(true);
    let loadingToastId: string | null = null;
    try {
      loadingToastId = String(notify.loading('Registrando problema...'));
      const response = await fetch('https://webhook.lacocinaquevende.com/webhook/registrarproblemacolab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, pruebas: pruebasFinal, timestamp: new Date().toISOString() }),
      });
      if (loadingToastId) notify.dismiss(loadingToastId);
      if (response.ok) {
        notify.success('Registrado con éxito');
        setTimeout(() => router.push('/'), 1500);
        setForm({ colaborador: '', motivo: '', pruebas: null });
        setLoomLink('');
        setPruebaTipo(null);
      } else {
        notify.error('Error al registrar el problema');
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
                disabled={loadingColabs}
              >
                {loadingColabs ? 'Cargando colaboradores...' : 'Registrar'}
              </button>
              {colabsError && (
                <p className="text-red-500 text-center mt-2">{colabsError}</p>
              )}
              <button
                className="btn-secondary w-full"
                onClick={() => router.push('/problemas/visualizar')}
              >
                Visualizar
              </button>
            </div>
          )}
          {view === 'registrar' && colabOptions.length > 0 && (
            <>
              <h1 className="text-2xl font-bold text-electricidad mb-6 text-center">Registrar Problema de Colaborador/a</h1>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <p className="text-sm text-electricidad mb-2 bg-frescura/10 p-2 rounded">Busca el nombre del colaborador/a y selecciónalo</p>
                  <AutocompleteField
                    id="colaborador"
                    label="Colaborador/a"
                    value={form.colaborador}
                    onChange={(value) => setForm((prev) => ({ ...prev, colaborador: value }))}
                    options={colabOptions}
                    error={errors.colaborador}
                    required
                    placeholder="Busca y selecciona un colaborador/a"
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
                  <label className="block font-medium mb-2">Pruebas</label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      className={`btn-secondary flex-1 ${pruebaTipo === 'imagen' ? 'bg-agilidad text-white' : ''}`}
                      onClick={() => { setPruebaTipo('imagen'); setLoomLink(''); setForm((prev) => ({ ...prev, pruebas: null })); }}
                    >
                      Imagen
                    </button>
                    <button
                      type="button"
                      className={`btn-secondary flex-1 ${pruebaTipo === 'loom' ? 'bg-agilidad text-white' : ''}`}
                      onClick={() => { setPruebaTipo('loom'); setForm((prev) => ({ ...prev, pruebas: null })); }}
                    >
                      Loom
                    </button>
                  </div>
                  {pruebaTipo === 'imagen' && (
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
                  )}
                  {pruebaTipo === 'loom' && (
                    <input
                      type="url"
                      placeholder="Pega aquí el link de Loom"
                      value={loomLink}
                      onChange={e => setLoomLink(e.target.value)}
                      className="w-full rounded-md border border-frescura bg-white px-4 py-3 text-electricidad focus:border-agilidad focus:outline-none focus:ring-2 focus:ring-agilidad transition-all duration-300"
                    />
                  )}
                  {uploading && <p className="text-sm text-electricidad mt-2">{uploadMessage}</p>}
                  {!uploading && uploadMessage && <p className="text-sm text-green-600 mt-2">{uploadMessage}</p>}
                  {errors.pruebas && <p className="text-red-500 text-sm mt-1">{errors.pruebas}</p>}
                  {form.pruebas && !uploading && pruebaTipo === 'imagen' && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">Imagen subida:</p>
                      <img src={form.pruebas} alt="Previsualización" className="mt-2 rounded-md max-h-48" />
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
                  {isSubmitting ? 'Enviando...' : 'Registrar Problema'}
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
          {view === 'registrar' && colabOptions.length === 0 && (
            <div className="text-center text-red-500 mt-6">No se pudo cargar la lista de colaboradores. Por favor, vuelve a intentarlo.</div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 