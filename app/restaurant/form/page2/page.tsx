"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from '@/context/UserContext';
import { FaStar } from "react-icons/fa";
import { uploadToMinio } from './minioUpload';

interface FormData {
  horariosAtencion: string;
  trabajaFestivos: boolean;
  horariosFestivos: string;
  tieneSistemaPedidos: boolean;
  tipoSistema: string[];
  otroSistema: string;
  satisfaccionSistema: number;
  deseaOptimizar: boolean;
  incluirWhatsApp: boolean | null;
  tipoChatbot: string;
  ubicacionSedes: string;
  manejaReservaciones: boolean;
  tipoReservaciones: string;
  linkReservaciones: string;
  datosReservaciones: string;
  manejaEventos: boolean;
  descripcionEventos: string;
  linkMenu: string;
  menuPDF: string | null;
  metodosPago: string;
  lenguajeMarca: string;
  logo: string | null;
  correoContacto: string;
  numeroNotificaciones: string;
  tipoMenu: 'link' | 'pdf' | null;
}

export default function RestaurantForm2() {
  const router = useRouter();
  const { userData } = useUser();
  const [form, setForm] = useState<FormData>({
    horariosAtencion: "",
    trabajaFestivos: false,
    horariosFestivos: "",
    tieneSistemaPedidos: false,
    tipoSistema: [],
    otroSistema: "",
    satisfaccionSistema: 0,
    deseaOptimizar: false,
    incluirWhatsApp: null,
    tipoChatbot: "",
    ubicacionSedes: "",
    manejaReservaciones: false,
    tipoReservaciones: "",
    linkReservaciones: "",
    datosReservaciones: "",
    manejaEventos: false,
    descripcionEventos: "",
    linkMenu: "",
    menuPDF: null,
    metodosPago: "",
    lenguajeMarca: "",
    logo: null,
    correoContacto: "",
    numeroNotificaciones: "",
    tipoMenu: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [uploading, setUploading] = useState<{pdf: boolean, logo: boolean}>({pdf: false, logo: false});
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Cargar datos guardados
  useEffect(() => {
    const restaurantId = userData?.id;
    if (restaurantId) {
      const savedData = localStorage.getItem(`restaurantForm2_${restaurantId}`);
      if (savedData) {
        setForm(JSON.parse(savedData));
      }
    }
  }, [userData]);

  // Guardar datos automáticamente
  useEffect(() => {
    const restaurantId = userData?.id;
    if (restaurantId) {
      localStorage.setItem(`restaurantForm2_${restaurantId}`, JSON.stringify(form));
    }
  }, [form, userData]);

  const validate = () => {
    const newErrors: any = {};
    if (!form.ubicacionSedes) newErrors.ubicacionSedes = "Obligatorio";
    if (form.manejaReservaciones) {
      if (!form.tipoReservaciones) newErrors.tipoReservaciones = "Selecciona una opción";
      if (form.tipoReservaciones === "plataforma" && !form.linkReservaciones) newErrors.linkReservaciones = "Obligatorio";
    }
    if (form.manejaEventos && !form.descripcionEventos) newErrors.descripcionEventos = "Obligatorio";
    if (!form.tipoMenu) newErrors.tipoMenu = "Selecciona una opción";
    if (form.tipoMenu === 'link' && !form.linkMenu) newErrors.linkMenu = "Obligatorio";
    if (form.tipoMenu === 'pdf' && !form.menuPDF) newErrors.menuPDF = "Obligatorio";
    if (!form.metodosPago) newErrors.metodosPago = "Obligatorio";
    if (!form.lenguajeMarca) newErrors.lenguajeMarca = "Obligatorio";
    if (!form.logo) newErrors.logo = "Obligatorio";
    if (!form.correoContacto) newErrors.correoContacto = "Obligatorio";
    if (!form.numeroNotificaciones) newErrors.numeroNotificaciones = "Obligatorio";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (file: File, type: 'pdf' | 'logo') => {
    if (!file) return;
    try {
      if (type === 'pdf') {
        setUploading(u => ({...u, pdf: true}));
        setUploadMessage('Subiendo PDF, por favor espera...');
        const url = await uploadToMinio({ file, bucket: 'menusdeclientes' });
        setForm(prev => ({ ...prev, menuPDF: url }));
        setUploading(u => ({...u, pdf: false}));
        setUploadMessage(null);
      } else if (type === 'logo') {
        setUploading(u => ({...u, logo: true}));
        setUploadMessage('Subiendo logotipo, por favor espera...');
        const url = await uploadToMinio({ file, bucket: 'logosdeclientes' });
        setForm(prev => ({ ...prev, logo: url }));
        setUploading(u => ({...u, logo: false}));
        setUploadMessage(null);
      }
    } catch (error) {
      setUploading({pdf: false, logo: false});
      setUploadMessage(null);
      alert('Error al subir el archivo. Intenta nuevamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      console.log('Errores de validación:', errors);
      return;
    }
    // Bloquear si está subiendo archivos
    if (uploading.pdf || uploading.logo) {
      alert('Por favor espera a que terminen de subirse los archivos antes de continuar.');
      return;
    }
    // Si el usuario seleccionó PDF, asegurarse que haya link
    if (form.tipoMenu === 'pdf' && !form.menuPDF) {
      alert('Por favor espera a que termine de subirse el PDF antes de continuar.');
      return;
    }
    if (!form.logo) {
      alert('Por favor espera a que termine de subirse el logotipo antes de continuar.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Enviar solo las URLs
      const formData = {
        ...form,
        menuPDF: typeof form.menuPDF === 'string' ? form.menuPDF : '',
        logo: typeof form.logo === 'string' ? form.logo : '',
        id: userData?.id || '',
        timestamp: new Date().toISOString()
      };

      console.log('Enviando datos al webhook:', formData);

      const response = await fetch("https://webhook.lacocinaquevende.com/webhook/pagina2", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('Respuesta del webhook:', result);

      // Actualizar el estado de la sesión
      const restaurantId = userData?.id;
      if (restaurantId) {
        const sessions = JSON.parse(localStorage.getItem('restaurantSessions') || '[]');
        const sessionIndex = sessions.findIndex((s: any) => s.id === restaurantId);
        
        if (sessionIndex >= 0) {
          sessions[sessionIndex] = {
            ...sessions[sessionIndex],
            lastStep: 3,
            lastUpdate: Date.now(),
            form2Completed: true
          };
          localStorage.setItem('restaurantSessions', JSON.stringify(sessions));
        }
      }

      router.push('/restaurant/form/page3');
    } catch (error) {
      console.error('Error al enviar datos:', error);
      alert('Hubo un error al enviar los datos. Por favor, verifica tu conexión e intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSistemaChange = (sistema: string) => {
    setForm(prev => {
      const sistemas = prev.tipoSistema.includes(sistema)
        ? prev.tipoSistema.filter(s => s !== sistema)
        : [...prev.tipoSistema, sistema];
      return { ...prev, tipoSistema: sistemas };
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-electricidad mb-6 text-center">
          Conozcamos mejor a {userData?.name || "tu restaurante"}
        </h1>

        {/* Barra de progreso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-electricidad font-medium">Paso 2 de 3</span>
            <span className="text-frescura text-sm">¡Vamos bien! Sigue así</span>
          </div>
          <div className="w-full bg-frescura/20 rounded-full h-2">
            <div className="bg-agilidad h-2 rounded-full" style={{ width: '66%' }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Horarios de atención */}
          <div>
            <label className="block font-medium mb-2">¿Cuáles son tus horarios de atención? *</label>
            <textarea
              className="input w-full h-24"
              value={form.horariosAtencion}
              onChange={(e) => setForm(prev => ({ ...prev, horariosAtencion: e.target.value }))}
              placeholder="Ej: Lunes a Viernes: 8:00 AM - 10:00 PM, Sábados: 9:00 AM - 11:00 PM"
            />
            {errors.horariosAtencion && <span className="text-red-500 text-sm">{errors.horariosAtencion}</span>}
          </div>

          {/* Trabaja en festivos */}
          <div>
            <label className="block font-medium mb-2">¿Trabajas en días festivos? *</label>
            <div className="flex gap-6 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="trabajaFestivos"
                  checked={form.trabajaFestivos === true}
                  onChange={() => setForm(prev => ({ ...prev, trabajaFestivos: true }))}
                  className="form-radio text-agilidad"
                />
                Sí
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="trabajaFestivos"
                  checked={form.trabajaFestivos === false}
                  onChange={() => setForm(prev => ({ ...prev, trabajaFestivos: false, horariosFestivos: "" }))}
                  className="form-radio text-agilidad"
                />
                No
              </label>
            </div>

            {form.trabajaFestivos && (
              <div className="mt-4">
                <textarea
                  className="input w-full h-24"
                  value={form.horariosFestivos}
                  onChange={(e) => setForm(prev => ({ ...prev, horariosFestivos: e.target.value }))}
                  placeholder="Por favor especifica los horarios en días festivos"
                />
              </div>
            )}
          </div>

          {/* Ubicación de sedes */}
          <div>
            <label className="block font-medium mb-2">¿Dónde está ubicada o están ubicadas tus sedes? *</label>
            <textarea
              className="input w-full h-24"
              value={form.ubicacionSedes}
              onChange={(e) => setForm(prev => ({ ...prev, ubicacionSedes: e.target.value }))}
              placeholder="Ej: Sede principal: Calle 123 #45-67, Bogotá. Sede norte: Carrera 89 #12-34, Medellín"
            />
            {errors.ubicacionSedes && <span className="text-red-500 text-sm">{errors.ubicacionSedes}</span>}
          </div>

          {/* Reservaciones */}
          <div>
            <label className="block font-medium mb-2">¿Manejan reservaciones? *</label>
            <div className="flex gap-6 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="manejaReservaciones"
                  checked={form.manejaReservaciones === true}
                  onChange={() => setForm(prev => ({ ...prev, manejaReservaciones: true }))}
                  className="form-radio text-agilidad"
                />
                Sí
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="manejaReservaciones"
                  checked={form.manejaReservaciones === false}
                  onChange={() => setForm(prev => ({ ...prev, manejaReservaciones: false, tipoReservaciones: "", linkReservaciones: "", datosReservaciones: "" }))}
                  className="form-radio text-agilidad"
                />
                No
              </label>
            </div>

            {form.manejaReservaciones && (
              <div className="mt-4">
                <label className="block font-medium mb-2">¿Por dónde manejas las reservas? *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, tipoReservaciones: "plataforma" }))}
                    className={`p-4 rounded-lg border ${
                      form.tipoReservaciones === "plataforma"
                        ? "border-agilidad bg-agilidad/10"
                        : "border-gray-200 hover:border-agilidad"
                    }`}
                  >
                    Tengo una plataforma para esto
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, tipoReservaciones: "redes", linkReservaciones: "", datosReservaciones: "" }))}
                    className={`p-4 rounded-lg border ${
                      form.tipoReservaciones === "redes"
                        ? "border-agilidad bg-agilidad/10"
                        : "border-gray-200 hover:border-agilidad"
                    }`}
                  >
                    Los tomo por redes sociales
                  </button>
                </div>

                {form.tipoReservaciones === "plataforma" && (
                  <div className="mt-4">
                    <input
                      type="text"
                      className="input w-full"
                      value={form.linkReservaciones}
                      onChange={(e) => setForm(prev => ({ ...prev, linkReservaciones: e.target.value }))}
                      placeholder="Por favor pon el link de donde las personas hacen las reservaciones"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Eventos */}
          <div>
            <label className="block font-medium mb-2">¿Manejas eventos constantemente? *</label>
            <div className="flex gap-6 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="manejaEventos"
                  checked={form.manejaEventos === true}
                  onChange={() => setForm(prev => ({ ...prev, manejaEventos: true }))}
                  className="form-radio text-agilidad"
                />
                Sí
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="manejaEventos"
                  checked={form.manejaEventos === false}
                  onChange={() => setForm(prev => ({ ...prev, manejaEventos: false, descripcionEventos: "" }))}
                  className="form-radio text-agilidad"
                />
                No
              </label>
            </div>

            {form.manejaEventos && (
              <div className="mt-4">
                <textarea
                  className="input w-full h-32"
                  value={form.descripcionEventos}
                  onChange={(e) => setForm(prev => ({ ...prev, descripcionEventos: e.target.value }))}
                  placeholder="Por favor se lo más extenso y descriptivo posible con cada uno de ellos explicando cómo funcionan, de qué se tratan, en qué fechas pasa, horas etc"
                />
              </div>
            )}
          </div>

          {/* Link del menú */}
          <div>
            <label className="block font-medium mb-2">Pon el link de tu menú o súbelo en PDF *</label>
            <div className="space-y-4">
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, tipoMenu: 'link', menuPDF: null }))}
                  className={`px-4 py-2 rounded-md font-semibold shadow ${
                    form.tipoMenu === 'link'
                      ? "bg-agilidad text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  Subiré un link
                </button>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, tipoMenu: 'pdf', linkMenu: '' }))}
                  className={`px-4 py-2 rounded-md font-semibold shadow ${
                    form.tipoMenu === 'pdf'
                      ? "bg-agilidad text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  Subiré un PDF
                </button>
              </div>

              {form.tipoMenu === 'link' && (
                <input
                  type="text"
                  className="input w-full"
                  value={form.linkMenu}
                  onChange={(e) => setForm(prev => ({ ...prev, linkMenu: e.target.value }))}
                  placeholder="Si usas una aplicación para hacer pedidos pon el link directamente de la aplicación aquí"
                />
              )}

              {form.tipoMenu === 'pdf' && (
                <input
                  type="file"
                  accept=".pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && file instanceof Blob) {
                      await handleFileUpload(file, 'pdf');
                    } else {
                      alert('Por favor, selecciona un archivo PDF válido');
                    }
                  }}
                  className="input w-full"
                />
              )}
            </div>
          </div>

          {/* Métodos de pago */}
          <div>
            <label className="block font-medium mb-2">¿Qué métodos de pago tienes? *</label>
            <textarea
              className="input w-full h-24"
              value={form.metodosPago}
              onChange={(e) => setForm(prev => ({ ...prev, metodosPago: e.target.value }))}
              placeholder="Solo di los métodos disponibles, no es necesario que digas cuáles son los números de pago"
            />
          </div>

          {/* Lenguaje de marca */}
          <div>
            <label className="block font-medium mb-2">¿Cómo es tu lenguaje de marca? *</label>
            <textarea
              className="input w-full h-32"
              value={form.lenguajeMarca}
              onChange={(e) => setForm(prev => ({ ...prev, lenguajeMarca: e.target.value }))}
              placeholder="Por ejemplo como sueles hablar es bueno que dejes ejemplos de cómo hablas con los clientes o si intentas evitar palabras o si intentas agregar palabras como 'Parce, ahumadictos, etc'..."
            />
          </div>

          {/* Logo */}
          <div>
            <label className="block font-medium mb-2">Sube tu logotipo *</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file && file instanceof Blob) {
                  await handleFileUpload(file, 'logo');
                } else {
                  alert('Por favor, selecciona una imagen válida');
                }
              }}
              className="input w-full"
            />
          </div>

          {/* Sistema de pedidos */}
          <div>
            <h3 className="text-xl font-bold text-blue-900 mb-4">Sistema de Respuestas Automáticas</h3>
            <p className="text-blue-900 mb-4">Como sabes te entregaremos un sistema que responderá a tus comentarios de manera automática, que tiene los contactos y los mensajes ilimitados, para nosotros es de mucho valor que conozcas un poco de la plataforma, por favor mira este pequeño video donde te la mostramos:</p>
            
            <div className="aspect-w-16 aspect-h-9 mb-6">
              <iframe
                src="https://www.loom.com/embed/359f66e0144f4c6281fb0cd9495a4f65"
                allowFullScreen
                className="w-full h-full rounded-lg"
              ></iframe>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block font-medium mb-2">¿A qué correo se debe enviar si un usuario pregunta por trabajo, o si son proveedores, etc? *</label>
                <input
                  type="email"
                  className="input w-full"
                  value={form.correoContacto}
                  onChange={(e) => setForm(prev => ({ ...prev, correoContacto: e.target.value }))}
                  placeholder="ejemplo@turestaurante.com"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">¿A qué número quieren que se redirija lo que suceda que pasan en las redes sociales? *</label>
                <input
                  type="tel"
                  className="input w-full"
                  value={form.numeroNotificaciones}
                  onChange={(e) => setForm(prev => ({ ...prev, numeroNotificaciones: e.target.value }))}
                  placeholder="Ej: +57 300 123 4567"
                />
                <p className="text-sm text-gray-600 mt-1">Si un usuario requiere hablar con un humano, a dónde se envían si quieren hacer un domicilio o una reserva, etc.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-2">¿Deseas incluir WhatsApp en tu sistema? *</label>
            <div className="flex gap-4 mb-2">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, incluirWhatsApp: true }))}
                className={`px-4 py-2 rounded-md font-semibold shadow ${
                  form.incluirWhatsApp === true
                    ? "bg-agilidad text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, incluirWhatsApp: false }))}
                className={`px-4 py-2 rounded-md font-semibold shadow ${
                  form.incluirWhatsApp === false
                    ? "bg-agilidad text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                No
              </button>
            </div>
            <p className="text-sm text-electricidad mt-2 bg-frescura/10 p-3 rounded-md">
              💬 Recuerda poner tu nombre y tu número también si deseas entrar a este grupo!
            </p>
          </div>

          {uploadMessage && (
            <div className="text-center text-electricidad font-semibold mb-2 animate-pulse">{uploadMessage}</div>
          )}

          <motion.button
            type="submit"
            className="btn-primary w-full mt-6"
            disabled={isSubmitting || uploading.pdf || uploading.logo}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {isSubmitting ? "Enviando..." : "Continuar"}
          </motion.button>
        </form>
      </div>
    </div>
  );
} 