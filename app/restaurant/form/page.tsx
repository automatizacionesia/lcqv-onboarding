"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from '@/context/UserContext';
import AutocompleteField from "@/components/shared/AutocompleteField";
import { paises } from "@/lib/countries";

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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    
    // Validar contactos
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

  // Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    
    try {
      // Buscar el emoji del país seleccionado
      const paisObj = paises.find(p => p.nombre === form.pais);
      const emoji = paisObj ? paisObj.emoji : "";
      // Enviar datos al webhook 1
      await fetch("https://webhook.lacocinaquevende.com/webhook/ingresardatosuserpt1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          emoji,
          id: userData?.id || ''
        }),
      });
      // Obtener datos de restaurante del localStorage
      const dataStr = localStorage.getItem("restaurantData");
      let fidelizacion = false;
      if (dataStr) {
        try {
          const data = JSON.parse(dataStr);
          // Puede venir como booleano o string
          if (typeof data.fidelizacion === 'boolean') {
            fidelizacion = data.fidelizacion;
          } else if (typeof data.fidelizacion === 'string') {
            fidelizacion = data.fidelizacion === 'true';
          }
        } catch {}
      }
      // Redirigir según fidelización
      if (fidelizacion) {
        router.push('/restaurant/form/fidelizacion');
      } else {
        router.push('/restaurant/form/page3');
      }
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
      const parsedData = JSON.parse(savedData);
      // Solo cargar los campos de la Lista Blanca
      setForm({
        pais: parsedData.pais || "",
        ciudad: parsedData.ciudad || "",
        representante: parsedData.representante || "",
        idRepresentante: parsedData.idRepresentante || "",
        empresa: parsedData.empresa || "",
        nit: parsedData.nit || "",
        gmail: parsedData.gmail || "",
        correoCorporativo: parsedData.correoCorporativo || "",
        contactos: parsedData.contactos || [{ ...defaultContacto }],
      });
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
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 w-full">
          <div>
            <AutocompleteField
              id="pais"
              label="País del restaurante *"
              value={form.pais}
              onChange={value => handleChange("pais", value)}
              options={paises.map(p => ({ value: p.nombre, label: `${p.emoji} ${p.nombre}` }))}
              error={errors.pais}
              required
              placeholder="Busca y selecciona el país"
              className="mb-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-2 text-electricidad">Ciudad del restaurante *</label>
            <input 
              className="w-full rounded-md border border-frescura bg-white px-4 py-3 text-electricidad focus:border-agilidad focus:outline-none focus:ring-2 focus:ring-agilidad transition-all duration-300" 
              value={form.ciudad} 
              onChange={e => handleChange("ciudad", e.target.value)} 
            />
            {errors.ciudad && <span className="text-red-500 text-sm mt-1">{errors.ciudad}</span>}
          </div>
          
          <div>
            <label className="block font-medium mb-2 text-electricidad">Nombre del representante legal *</label>
            <input 
              className="w-full rounded-md border border-frescura bg-white px-4 py-3 text-electricidad focus:border-agilidad focus:outline-none focus:ring-2 focus:ring-agilidad transition-all duration-300" 
              value={form.representante} 
              onChange={e => handleChange("representante", e.target.value)} 
            />
            {errors.representante && <span className="text-red-500 text-sm mt-1">{errors.representante}</span>}
          </div>
          
          <div>
            <label className="block font-medium mb-2 text-electricidad">ID del Documento del representante legal *</label>
            <input 
              className="w-full rounded-md border border-frescura bg-white px-4 py-3 text-electricidad focus:border-agilidad focus:outline-none focus:ring-2 focus:ring-agilidad transition-all duration-300" 
              value={form.idRepresentante} 
              onChange={e => handleChange("idRepresentante", e.target.value)} 
            />
            {errors.idRepresentante && <span className="text-red-500 text-sm mt-1">{errors.idRepresentante}</span>}
          </div>
          
          <div>
            <label className="block font-medium mb-2 text-electricidad">Nombre de la empresa</label>
            <input 
              className="w-full rounded-md border border-frescura bg-white px-4 py-3 text-electricidad focus:border-agilidad focus:outline-none focus:ring-2 focus:ring-agilidad transition-all duration-300" 
              value={form.empresa} 
              onChange={e => handleChange("empresa", e.target.value)}
              placeholder="Nombre tal y como aparece en el documento fiscal (RFC, CUIT, NIF, EIN, etc)" 
            />
            <div className="text-sm text-electricidad/80 mt-1 bg-frescura/10 p-2 rounded-md mb-1">
              Escribe el nombre completo tal como aparece en tus documentos fiscales oficiales
            </div>
            {errors.empresa && <span className="text-red-500 text-sm mt-1">{errors.empresa}</span>}
          </div>
          
          <div>
            <label className="block font-medium mb-2 text-electricidad">Número de identificación fiscal</label>
            <input 
              className="w-full rounded-md border border-frescura bg-white px-4 py-3 text-electricidad focus:border-agilidad focus:outline-none focus:ring-2 focus:ring-agilidad transition-all duration-300" 
              value={form.nit} 
              onChange={e => handleChange("nit", e.target.value)} 
            />
            <div className="text-sm text-electricidad/80 mt-1 bg-frescura/10 p-2 rounded-md mb-1">
              Ej: NIT en Colombia, CUIT en Argentina, RFC en México, EIN en EE.UU. etc
            </div>
            {errors.nit && <span className="text-red-500 text-sm mt-1">{errors.nit}</span>}
          </div>
          
          <div>
            <label className="block font-medium mb-2 text-electricidad">Correo de Gmail en el que puedan ver documentos de Google Drive *</label>
            <input 
              className="w-full rounded-md border border-frescura bg-white px-4 py-3 text-electricidad focus:border-agilidad focus:outline-none focus:ring-2 focus:ring-agilidad transition-all duration-300" 
              value={form.gmail} 
              onChange={e => handleChange("gmail", e.target.value)}
              placeholder="Este correo debe ser un @gmail.com ej: lacocinaquevende@gmail.com" 
            />
            {errors.gmail && <span className="text-red-500 text-sm mt-1">{errors.gmail}</span>}
          </div>
          
          <div>
            <label className="block font-medium mb-2 text-electricidad">Correo corporativo del restaurante (puede ser el mismo de arriba) *</label>
            <input 
              className="w-full rounded-md border border-frescura bg-white px-4 py-3 text-electricidad focus:border-agilidad focus:outline-none focus:ring-2 focus:ring-agilidad transition-all duration-300" 
              value={form.correoCorporativo} 
              onChange={e => handleChange("correoCorporativo", e.target.value)}
              placeholder="Puede ser un gmail o incluso el mismo de arriba si quieres" 
            />
            {errors.correoCorporativo && <span className="text-red-500 text-sm mt-1">{errors.correoCorporativo}</span>}
          </div>

          {/* Sección de WhatsApp actualizada */}
          <div className="bg-frescura/10 p-6 rounded-lg">
            <h3 className="text-electricidad font-bold mb-3">📱 ¡Vamos a crear un grupo de WhatsApp para tu equipo!</h3>
            <p className="text-electricidad/80 mb-4">
              La idea es que podamos comunicarnos de manera rápida y que todos en {form.empresa || "tu restaurante"} estén siempre al tanto de las novedades. Por eso, armaremos un grupo de WhatsApp para compartir información importante y coordinar de forma más ágil.
            </p>
            <div className="bg-white p-4 rounded-md border border-frescura/30 mb-4">
              <p className="text-electricidad/80 text-sm mb-2">💡 <strong>Importante:</strong> Al escribir el número de teléfono, recuerda incluir el código de país:</p>
              <ul className="text-electricidad/80 text-sm list-disc list-inside space-y-1">
                <li>Colombia: +57</li>
                <li>México: +52</li>
                <li>Perú: +51</li>
                <li>Chile: +56</li>
                <li>Argentina: +54</li>
              </ul>
            </div>
            <p className="text-electricidad/80 text-sm bg-yellow-50 p-3 rounded-md border border-yellow-200">
              <strong>Nota:</strong> No olvides poner también tu nombre y tu número si deseas hacer parte del grupo
            </p>
          </div>
          
          <div>
            <label className="block font-medium mb-2 text-electricidad">Datos de contacto para WhatsApp *</label>
            <p className="text-sm text-electricidad mt-1 bg-frescura/10 p-2 rounded-md mb-4">
              Recuerda poner tu nombre y tu número correctamente. Solo los números que pongas aquí serán agregados al grupo de WhatsApp.
            </p>
            {form.contactos.map((c, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  className="flex-1 rounded-md border border-frescura bg-white px-4 py-3 text-electricidad focus:border-agilidad focus:outline-none focus:ring-2 focus:ring-agilidad transition-all duration-300"
                  placeholder="Nombre"
                  value={c.nombre}
                  onChange={e => handleContactoChange(i, "nombre", e.target.value)}
                />
                <input
                  className="flex-1 rounded-md border border-frescura bg-white px-4 py-3 text-electricidad focus:border-agilidad focus:outline-none focus:ring-2 focus:ring-agilidad transition-all duration-300"
                  placeholder="+57, +52, etc. (Incluye el código de país)"
                  value={c.telefono.startsWith('+') ? c.telefono : `+${c.telefono}`}
                  onChange={e => {
                    let val = e.target.value;
                    if (!val.startsWith('+')) val = '+' + val.replace(/[^\d]/g, '');
                    handleContactoChange(i, "telefono", val);
                  }}
                />
                {form.contactos.length > 1 && (
                  <button 
                    type="button" 
                    className="text-red-500 text-xl p-2 rounded-md hover:bg-red-50 transition-colors duration-200 flex-shrink-0" 
                    onClick={() => removeContacto(i)} 
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn-secondary mt-2 w-full sm:w-auto" onClick={addContacto}>
              Añadir otra persona
            </button>
            {form.contactos.map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 mt-2">
                {errors[`contacto-nombre-${i}`] && (
                  <span className="text-red-500 text-sm">Nombre: {errors[`contacto-nombre-${i}`]}</span>
                )}
                {errors[`contacto-telefono-${i}`] && (
                  <span className="text-red-500 text-sm sm:ml-2">Teléfono: {errors[`contacto-telefono-${i}`]}</span>
                )}
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