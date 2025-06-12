"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from '@/context/UserContext';

interface Contacto {
  nombre: string;
  telefono: string;
}

interface FormData {
  pais: string;
  ciudad: string;
  representante: string;
  idRepresentante: string;
  empresa: string;
  nit: string;
  gmail: string;
  correoCorporativo: string;
  contactos: Contacto[];
  serviciosPotenciar: string[];
}

const defaultContacto: Contacto = { nombre: "", telefono: "" };

export default function RestaurantForm() {
  const router = useRouter();
  const { userData } = useUser();
  const [form, setForm] = useState<FormData>({
    pais: "",
    ciudad: "",
    representante: "",
    idRepresentante: "",
    empresa: "",
    nit: "",
    gmail: "",
    correoCorporativo: "",
    contactos: [{ ...defaultContacto }],
    serviciosPotenciar: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Validación de campos
  const validate = () => {
    const newErrors: any = {};
    if (!form.pais) newErrors.pais = "Obligatorio";
    if (!form.ciudad) newErrors.ciudad = "Obligatorio";
    if (!form.representante) newErrors.representante = "Obligatorio";
    if (!form.idRepresentante) newErrors.idRepresentante = "Obligatorio";
    if (!form.empresa) newErrors.empresa = "Obligatorio";
    if (!form.nit) newErrors.nit = "Obligatorio";
    if (!form.gmail || !/^[^@\s]+@gmail\.com$/.test(form.gmail)) newErrors.gmail = "Debe ser un correo @gmail.com válido";
    if (!form.correoCorporativo) newErrors.correoCorporativo = "Obligatorio";
    if (form.serviciosPotenciar.length === 0) newErrors.serviciosPotenciar = "Debes seleccionar al menos un servicio";
    form.contactos.forEach((c, i) => {
      if (!c.nombre) newErrors[`contacto-nombre-${i}`] = "Obligatorio";
      if (!c.telefono) newErrors[`contacto-telefono-${i}`] = "Obligatorio";
    });
    setErrors(newErrors);
    
    // Si hay errores, hacer scroll al primer error
    if (Object.keys(newErrors).length > 0) {
      const firstErrorElement = document.querySelector('[data-error="true"]');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    
    return Object.keys(newErrors).length === 0;
  };

  // Manejo de cambios
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleContactoChange = (idx: number, field: keyof Contacto, value: string) => {
    setForm((prev) => ({
      ...prev,
      contactos: prev.contactos.map((c, i) => i === idx ? { ...c, [field]: value } : c),
    }));
  };
  const addContacto = () => {
    setForm((prev) => ({ ...prev, contactos: [...prev.contactos, { ...defaultContacto }] }));
  };
  const removeContacto = (idx: number) => {
    setForm((prev) => ({ ...prev, contactos: prev.contactos.filter((_, i) => i !== idx) }));
  };

  const handleServicioChange = (servicio: string) => {
    setForm((prev) => {
      const servicios = prev.serviciosPotenciar.includes(servicio)
        ? prev.serviciosPotenciar.filter(s => s !== servicio)
        : [...prev.serviciosPotenciar, servicio];
      return { ...prev, serviciosPotenciar: servicios };
    });
  };

  // Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      // Actualizar el estado de la sesión
      const restaurantId = userData?.id;
      if (restaurantId) {
        const sessions = JSON.parse(localStorage.getItem('restaurantSessions') || '[]');
        const sessionIndex = sessions.findIndex((s: any) => s.id === restaurantId);
        
        if (sessionIndex >= 0) {
          sessions[sessionIndex] = {
            ...sessions[sessionIndex],
            lastStep: 2,
            lastUpdate: Date.now(),
            form1Completed: true
          };
          localStorage.setItem('restaurantSessions', JSON.stringify(sessions));
        }
      }

      await fetch("https://webhook.lacocinaquevende.com/webhook/ingresardatosuserpt1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id: userData.id // Incluir el ID del restaurante desde el contexto
        }),
      });
      
      // Guardar el estado del formulario en localStorage
      localStorage.setItem('restaurantForm1', JSON.stringify(form));
      
      // Redirigir a la segunda página
      router.push('/restaurant/form/page2');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cargar datos guardados al iniciar
  useEffect(() => {
    const savedData = localStorage.getItem('restaurantForm1');
    if (savedData) {
      setForm(JSON.parse(savedData));
    }
  }, []);

  // Guardar datos automáticamente
  useEffect(() => {
    localStorage.setItem('restaurantForm1', JSON.stringify(form));
  }, [form]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-electricidad mb-6 text-center">
          Empecemos con los datos tuyos y de {form.empresa || "tu restaurante"}
        </h1>
        
        {/* Barra de progreso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-electricidad font-medium">Paso 1 de 3</span>
            <span className="text-frescura text-sm">¡Vamos bien! Sigue así</span>
          </div>
          <div className="w-full bg-frescura/20 rounded-full h-2">
            <div className="bg-agilidad h-2 rounded-full" style={{ width: '33%' }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Servicios a potenciar */}
          <div className="mb-6">
            <label className="block font-medium mb-3">¿Qué deseas que potenciemos en {form.empresa || "tu restaurante"}? *</label>
            <div className="space-y-2">
              {["Punto físico", "Domicilios", "Reservas"].map((servicio) => (
                <label key={servicio} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.serviciosPotenciar.includes(servicio)}
                    onChange={() => handleServicioChange(servicio)}
                    className="form-checkbox h-5 w-5 text-agilidad rounded border-frescura"
                  />
                  <span className="text-electricidad">{servicio}</span>
                </label>
              ))}
            </div>
            {form.serviciosPotenciar.length > 1 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-700 text-sm">
                  La inversión en pauta que te sugerimos está pensada para atraer personas a tu punto físico y sumar un objetivo más de conversación (Reservas o Domicilios). Si eliges solo punto físico canalizaremos todo allí, Si elijes las trés, ten presente que el presupuesto incrementará 25%. IMPORTANTE: Elije tu fuerte, no elijas un objetivo en el que eres débil, queremos potenciar tu fuerte y para más adelante explirar otras oportunidades. (Ejemplo: Si soy fuerte en domicilios, elijo ese objetivo. Si mi público no pide domicilios o reserva, sino que llega al punto físico directamente, elijo ese objetivo. etc)
                </p>
              </div>
            )}
            {errors.serviciosPotenciar && (
              <span className="text-red-500 text-sm mt-1">{errors.serviciosPotenciar}</span>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">País del restaurante *</label>
            <input className="input w-full" value={form.pais} onChange={e => handleChange("pais", e.target.value)}
              placeholder="País del restaurante * - Si tienes sedes en varios países o ciudades puedes ponerlo acá" />
            {errors.pais && <span className="text-red-500 text-sm">{errors.pais}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Ciudad del restaurante *</label>
            <input className="input w-full" value={form.ciudad} onChange={e => handleChange("ciudad", e.target.value)} />
            {errors.ciudad && <span className="text-red-500 text-sm">{errors.ciudad}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Nombre del representante legal *</label>
            <input className="input w-full" value={form.representante} onChange={e => handleChange("representante", e.target.value)} />
            {errors.representante && <span className="text-red-500 text-sm">{errors.representante}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">ID del Documento del representante legal *</label>
            <input className="input w-full" value={form.idRepresentante} onChange={e => handleChange("idRepresentante", e.target.value)} />
            {errors.idRepresentante && <span className="text-red-500 text-sm">{errors.idRepresentante}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Nombre de la empresa (RUT) *</label>
            <input className="input w-full" value={form.empresa} onChange={e => handleChange("empresa", e.target.value)}
              placeholder="Nombre tal y como aparece en el documento fiscal (RFC, CUIT, NIF, EIN, etc)" />
            {errors.empresa && <span className="text-red-500 text-sm">{errors.empresa}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Número de identificación fiscal o NIT *</label>
            <input className="input w-full" value={form.nit} onChange={e => handleChange("nit", e.target.value)} />
            {errors.nit && <span className="text-red-500 text-sm">{errors.nit}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Correo de Gmail *</label>
            <input className="input w-full" value={form.gmail} onChange={e => handleChange("gmail", e.target.value)}
              placeholder="Este correo debe ser un @gmail.com ej: lacocinaquevende@gmail.com" />
            {errors.gmail && <span className="text-red-500 text-sm">{errors.gmail}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Correo institucional *</label>
            <input className="input w-full" value={form.correoCorporativo} onChange={e => handleChange("correoCorporativo", e.target.value)}
              placeholder="Puede ser un gmail o incluso el mismo de arriba si quieres" />
            {errors.correoCorporativo && <span className="text-red-500 text-sm">{errors.correoCorporativo}</span>}
          </div>

          {/* Sección de WhatsApp */}
          <div className="bg-frescura/10 p-6 rounded-lg mb-6">
            <h3 className="text-electricidad font-bold mb-3">📱 Crearemos un grupo de WhatsApp para tu equipo</h3>
            <p className="text-electricidad/80 mb-4">
              Para mantener una comunicación fluida y asegurarnos de que todo el equipo esté al día, crearemos un grupo de WhatsApp con todos los miembros de {form.empresa} que necesiten estar informados.
            </p>
            <div className="bg-white p-4 rounded-md border border-frescura/30">
              <p className="text-electricidad/80 text-sm mb-2">💡 <strong>Importante:</strong> Al escribir el número de teléfono, recuerda incluir el código de país:</p>
              <ul className="text-electricidad/80 text-sm list-disc list-inside space-y-1">
                <li>Colombia: +57</li>
                <li>México: +52</li>
                <li>Perú: +51</li>
                <li>Chile: +56</li>
                <li>Argentina: +54</li>
              </ul>
            </div>
          </div>
          
          <div>
            <label className="block font-medium mb-1">Datos de contacto para WhatsApp *</label>
            {form.contactos.map((c, i) => (
              <div key={i} className="flex gap-2 mb-2 items-center">
                <input
                  className="input flex-1"
                  placeholder="Nombre"
                  value={c.nombre}
                  onChange={e => handleContactoChange(i, "nombre", e.target.value)}
                />
                <input
                  className="input flex-1"
                  placeholder="+57, +52, etc. (Incluye el código de país)"
                  value={c.telefono.startsWith('+') ? c.telefono : `+${c.telefono}`}
                  onChange={e => {
                    let val = e.target.value;
                    if (!val.startsWith('+')) val = '+' + val.replace(/[^\d]/g, '');
                    handleContactoChange(i, "telefono", val);
                  }}
                />
                {form.contactos.length > 1 && (
                  <button type="button" className="text-red-500 text-xl" onClick={() => removeContacto(i)} title="Eliminar">
                    🗑️
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn-secondary mt-2" onClick={addContacto}>Añadir otra persona</button>
            {form.contactos.map((_, i) => (
              <div key={i}>
                {errors[`contacto-nombre-${i}`] && <span className="text-red-500 text-sm">Nombre: {errors[`contacto-nombre-${i}`]}</span>}
                {errors[`contacto-telefono-${i}`] && <span className="text-red-500 text-sm ml-2">Teléfono: {errors[`contacto-telefono-${i}`]}</span>}
              </div>
            ))}
          </div>
          <motion.button
            type="submit"
            className="btn-primary w-full mt-4"
            disabled={isSubmitting}
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