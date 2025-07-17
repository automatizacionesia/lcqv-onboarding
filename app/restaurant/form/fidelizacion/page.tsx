"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import InputField from '@/components/shared/input-field';
import ToggleField from '@/components/shared/toggle-field';
import LoadingSpinner from '@/components/shared/loading-spinner';
import { notify, validators } from '@/lib/utils';
import { codigosTelefonicos } from '@/lib/countries';
import AutocompleteField from '@/components/shared/AutocompleteField';
import { useUser } from '@/context/UserContext';
import { currencies } from '@/lib/currencies';

export default function FidelizacionPage() {
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    consumo: '',
    puntos: '',
    premio1: '',
    puntos1: '',
    premio2: '',
    puntos2: '',
    premio3: '',
    puntos3: '',
    terminos: false,
  });
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [telefonoPais, setTelefonoPais] = useState(codigosTelefonicos.find(p => p.codigo === '+57') || codigosTelefonicos[0]);
  const [telefonoNumero, setTelefonoNumero] = useState('');
  const [moneda, setMoneda] = useState(currencies[0].codigo);
  const [nivel, setNivel] = useState('equilibrado'); // conservador, equilibrado, generoso
  const { userData } = useUser();

  const paisOptions = codigosTelefonicos.map(p => ({ value: p.codigo, label: `${p.emoji} ${p.nombre} (${p.codigo})` }));
  const currencyOptions = currencies.map(c => ({ value: c.codigo, label: `${c.emoji} ${c.nombre} (${c.codigo})` }));

  // Lógica de porcentaje según nivel
  const porcentaje = nivel === 'conservador' ? 0.02 : nivel === 'generoso' ? 0.05 : 0.03;
  const monedaObj = currencies.find(c => c.codigo === moneda);
  const tickBase = monedaObj?.tickBase || 10;
  // Cálculo de puntos recomendados
  const puntosRecomendados = Math.round((tickBase * porcentaje) * 100);

  // Texto dinámico para la regla
  const textoRegla = `Dar ${puntosRecomendados.toLocaleString()} puntos por cada ${monedaObj?.simbolo || '$'}${tickBase.toLocaleString()} ${monedaObj?.codigo || ''} gastados.`;

  // Validación
  const validate = () => {
    const newErrors: any = {};
    if (!form.nombres) newErrors.nombres = 'Obligatorio';
    if (!form.apellidos) newErrors.apellidos = 'Obligatorio';
    if (!form.email) newErrors.email = 'Obligatorio';
    else if (validators.email(form.email)) newErrors.email = validators.email(form.email);
    if (!form.consumo) newErrors.consumo = 'Obligatorio';
    else if (validators.number(form.consumo)) newErrors.consumo = validators.number(form.consumo);
    if (!form.puntos) newErrors.puntos = 'Obligatorio';
    else if (validators.number(form.puntos)) newErrors.puntos = validators.number(form.puntos);
    if (!form.premio1) newErrors.premio1 = 'Obligatorio';
    if (!form.puntos1) newErrors.puntos1 = 'Obligatorio';
    else if (validators.number(form.puntos1)) newErrors.puntos1 = validators.number(form.puntos1);
    if (!form.premio2) newErrors.premio2 = 'Obligatorio';
    if (!form.puntos2) newErrors.puntos2 = 'Obligatorio';
    else if (validators.number(form.puntos2)) newErrors.puntos2 = validators.number(form.puntos2);
    if (!form.premio3) newErrors.premio3 = 'Obligatorio';
    if (!form.puntos3) newErrors.puntos3 = 'Obligatorio';
    else if (validators.number(form.puntos3)) newErrors.puntos3 = validators.number(form.puntos3);
    if (!form.terminos) newErrors.terminos = 'Debes aceptar los Términos y Condiciones';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejo de cambios
  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        telefono: telefonoPais.codigo + telefonoNumero,
        id: userData?.id || '',
        moneda,
      };
      await fetch('https://webhook.lacocinaquevende.com/webhook/crearusuariofidelizacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      notify.success('¡Formulario enviado con éxito!');
      window.location.href = '/restaurant/form/page3';
    } catch (error) {
      notify.error('Error al enviar el formulario. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para normalizar texto (eliminar tildes y pasar a minúsculas)
  function normalize(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u0000-\u001f]/g, '').replace(/[\u007f-\u009f]/g, '').toLowerCase();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <motion.h1
          className="text-2xl md:text-3xl font-bold text-electricidad mb-4 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Convierte a tus Clientes en Fans: ¡Lanza tu Programa de Lealtad en 2 Pasos!
        </motion.h1>
        <motion.p
          className="text-lg text-frescura mb-8 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          Completa este formulario y nuestra plataforma creará y configurará automáticamente un programa de lealtad a la medida de tu negocio. En pocos minutos, recibirás en tu correo el acceso a tu panel con todo listo para empezar.
        </motion.p>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 w-full">
          <div className="bg-frescura/10 p-4 rounded-lg mb-2">
            <h2 className="text-lg font-bold text-electricidad mb-2">Paso 1 de 2: ¿Quién administrará la cuenta?</h2>
            <p className="text-sm text-frescura mb-4">Esta persona recibirá el correo de bienvenida con los datos de acceso al panel de control.</p>
            <InputField
              id="nombres"
              label="Nombres del Administrador"
              value={form.nombres}
              onChange={v => handleChange('nombres', v)}
              placeholder="María"
              error={errors.nombres}
              required
            />
            <InputField
              id="apellidos"
              label="Apellidos del Administrador"
              value={form.apellidos}
              onChange={v => handleChange('apellidos', v)}
              placeholder="Rodríguez"
              error={errors.apellidos}
              required
            />
            <InputField
              id="email"
              label="Email de Trabajo del Administrador"
              value={form.email}
              onChange={v => handleChange('email', v)}
              type="email"
              placeholder="maria.rodriguez@email.com"
              error={errors.email}
              required
            />
            <p className="text-xs text-electricidad/80 mt-1 mb-2">A este correo te enviaremos el acceso a tu panel (Usuario y contraseña) y el QR para tus clientes.</p>
            <div className="flex flex-col sm:flex-row gap-2 items-end">
              <div className="w-full sm:w-64">
                <AutocompleteField
                  id="telefonoPais"
                  label="País"
                  value={telefonoPais.codigo}
                  onChange={codigo => {
                    const pais = codigosTelefonicos.find(p => p.codigo === codigo);
                    if (pais) setTelefonoPais(pais);
                  }}
                  options={paisOptions}
                  required
                  placeholder="Busca y selecciona el país"
                />
              </div>
              <div className="flex-1">
                <InputField
                  id="telefono"
                  label="Teléfono / WhatsApp de Contacto"
                  value={telefonoNumero}
                  onChange={setTelefonoNumero}
                  placeholder="310 123 4567"
                  error={errors.telefono}
                  required
                  className="w-full"
                />
              </div>
            </div>
            <AutocompleteField
              id="moneda"
              label="¿En qué moneda pagarán tus clientes?"
              value={moneda}
              onChange={setMoneda}
              options={currencyOptions}
              required
              placeholder="Busca y selecciona la moneda"
              className="mb-2"
            />
          </div>
          <div className="bg-frescura/10 p-4 rounded-lg mb-2">
            <h2 className="text-lg font-bold text-electricidad mb-2">Paso 2 de 2: El Corazón de tu Programa: Las Recompensas</h2>
            <p className="text-sm text-frescura mb-4">¡Aquí creamos la magia! Un buen programa hace dos cosas: atrae clientes y logra que vuelvan. Vamos a configurar la base para que tu sistema lo haga automáticamente.</p>
            <div className="bg-frescura/10 p-4 rounded-lg mb-2">
              <h2 className="text-lg font-bold text-electricidad mb-2">Sección B del Paso 3: Define la Generosidad de tu Programa</h2>
              <p className="text-sm text-frescura mb-4">Ahora, configura el motor de tu lealtad. ¿Qué tan generoso quieres ser con tus clientes recurrentes? Un programa saludable devuelve entre un 2% y un 5% de las compras en forma de puntos.</p>
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <button type="button" className={`btn-secondary flex-1 ${nivel==='conservador' ? 'ring-2 ring-agilidad' : ''}`} onClick={()=>setNivel('conservador')}>Conservador (2%)</button>
                <button type="button" className={`btn-secondary flex-1 ${nivel==='equilibrado' ? 'ring-2 ring-agilidad' : ''}`} onClick={()=>setNivel('equilibrado')}>Equilibrado (3%) <span className="text-xs">(Recomendado)</span></button>
                <button type="button" className={`btn-secondary flex-1 ${nivel==='generoso' ? 'ring-2 ring-agilidad' : ''}`} onClick={()=>setNivel('generoso')}>Generoso (5%)</button>
              </div>
              <div className="bg-white rounded-md p-4 border border-frescura/30 mb-2 text-center">
                <span className="text-green-600 font-bold text-lg">✅ ¡Tu Regla Personalizada está Lista!</span>
                <p className="mt-2 text-electricidad">Para tu negocio y con el nivel de recompensa del <b>{Math.round(porcentaje*100)}%</b> que elegiste, la configuración ideal es:</p>
                <p className="mt-2 text-agilidad font-bold">{textoRegla}</p>
                <p className="text-xs text-frescura mt-2">Hemos rellenado la regla de abajo con esta recomendación. Siempre podrás ajustarla después.</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-2 text-electricidad">A. La Regla de Oro: ¿Cómo ganarán puntos tus clientes?</label>
              <p className="text-xs text-frescura mb-2">Esta es la base de todo. Define cuánto vale el consumo de tus clientes en puntos. Una regla clara hace que el programa sea fácil de entender y muy atractivo.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <InputField
                  id="consumo"
                  label={`Por cada ${monedaObj?.simbolo || '$'} de consumo`}
                  value={form.consumo}
                  onChange={v => handleChange('consumo', v)}
                  type="number"
                  placeholder={tickBase.toString()}
                  error={errors.consumo}
                  required
                  className="flex-1"
                />
                <InputField
                  id="puntos"
                  label="Mis clientes ganarán (puntos)"
                  value={form.puntos}
                  onChange={v => handleChange('puntos', v)}
                  type="number"
                  placeholder={puntosRecomendados.toString()}
                  error={errors.puntos}
                  required
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-frescura mt-2">Ejemplo fácil: Si pones <b>$1.000</b> y <b>10</b> puntos, un cliente que gaste $25.000 en una cena ganará automáticamente 250 puntos en su tarjeta digital.</p>
            </div>
            <div className="mb-2">
              <label className="block font-medium mb-2 text-electricidad">B. Los Premios: La Razón por la que Volverán</label>
              <p className="text-xs text-frescura mb-2">Ahora, define 3 premios irresistibles. Empieza con uno fácil de alcanzar para enganchar a tus clientes, y aumenta el valor para recompensar su lealtad a largo plazo.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-md border border-frescura/30">
                  <h3 className="font-bold text-electricidad mb-1">Premio #1 (El Anzuelo)</h3>
                  <p className="text-xs text-frescura mb-2">Haz que este primer premio sea fácil de conseguir (pocas visitas) para que los clientes se emocionen rápido.</p>
                  <InputField
                    id="premio1"
                    label="Nombre del Premio"
                    value={form.premio1}
                    onChange={v => handleChange('premio1', v)}
                    placeholder="Un Café Americano Gratis"
                    error={errors.premio1}
                    required
                  />
                  <InputField
                    id="puntos1"
                    label="Puntos necesarios para canjearlo"
                    value={form.puntos1}
                    onChange={v => handleChange('puntos1', v)}
                    type="number"
                    placeholder="500"
                    error={errors.puntos1}
                    required
                  />
                </div>
                <div className="bg-white p-3 rounded-md border border-frescura/30">
                  <h3 className="font-bold text-electricidad mb-1">Premio #2 (Cliente Frecuente)</h3>
                  <InputField
                    id="premio2"
                    label="Nombre del Premio"
                    value={form.premio2}
                    onChange={v => handleChange('premio2', v)}
                    placeholder="Postre de la Casa"
                    error={errors.premio2}
                    required
                  />
                  <InputField
                    id="puntos2"
                    label="Puntos necesarios para canjearlo"
                    value={form.puntos2}
                    onChange={v => handleChange('puntos2', v)}
                    type="number"
                    placeholder="1200"
                    error={errors.puntos2}
                    required
                  />
                </div>
                <div className="bg-white p-3 rounded-md border border-frescura/30">
                  <h3 className="font-bold text-electricidad mb-1">Premio #3 (Cliente VIP)</h3>
                  <InputField
                    id="premio3"
                    label="Nombre del Premio"
                    value={form.premio3}
                    onChange={v => handleChange('premio3', v)}
                    placeholder="2x1 en Platos Fuertes (Lunes a Jueves)"
                    error={errors.premio3}
                    required
                  />
                  <InputField
                    id="puntos3"
                    label="Puntos necesarios para canjearlo"
                    value={form.puntos3}
                    onChange={v => handleChange('puntos3', v)}
                    type="number"
                    placeholder="3000"
                    error={errors.puntos3}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          <ToggleField
            id="terminos"
            label="He leído y acepto los Términos y Condiciones."
            value={form.terminos}
            onChange={v => handleChange('terminos', v)}
            error={errors.terminos}
            className="mt-2"
          />
          <motion.button
            type="submit"
            className="btn-primary w-full mt-4 flex items-center justify-center"
            disabled={isSubmitting}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {isSubmitting ? <LoadingSpinner size="sm" color="white" text="Enviando..." /> : 'Enviar'}
          </motion.button>
        </form>
      </div>
    </div>
  );
} 