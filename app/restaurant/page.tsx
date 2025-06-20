"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from '@/context/UserContext';
import { FaFireAlt } from "react-icons/fa";

interface RestaurantSession {
  id: string;
  lastStep: number;
  lastUpdate: number;
  form1Completed: boolean;
  form2Completed: boolean;
}

const PLAN_LABELS: Record<string, string> = {
  mensual: "Mensual",
  "3months": "3 meses",
  "6months": "6 meses",
};

export default function RestaurantWelcome() {
  const router = useRouter();
  const { userData, setUserData } = useUser();
  const [restaurantId, setRestaurantId] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [restaurantData, setRestaurantData] = useState<any | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // Función para obtener todas las sesiones activas
  const getActiveSessions = (): RestaurantSession[] => {
    const sessions = localStorage.getItem('restaurantSessions');
    if (!sessions) return [];
    
    const parsedSessions = JSON.parse(sessions) as RestaurantSession[];
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    // Filtrar sesiones activas (menos de 30 días)
    return parsedSessions.filter(session => session.lastUpdate > thirtyDaysAgo);
  };

  // Función para guardar una sesión
  const saveSession = (session: RestaurantSession) => {
    const sessions = getActiveSessions();
    const existingSessionIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingSessionIndex >= 0) {
      sessions[existingSessionIndex] = session;
    } else {
      sessions.push(session);
    }
    
    localStorage.setItem('restaurantSessions', JSON.stringify(sessions));
  };

  // Función para obtener una sesión específica
  const getSession = (id: string): RestaurantSession | undefined => {
    return getActiveSessions().find(session => session.id === id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!restaurantId.trim()) {
      setError("Por favor ingresa el ID del restaurante");
      return;
    }

    // Verificar si ya existe una sesión para este ID
    const existingSession = getSession(restaurantId);

    if (existingSession) {
      // Si existe una sesión, redirigir al último paso completado
      if (existingSession.form2Completed) {
        router.push('/restaurant/form/page3');
      } else if (existingSession.form1Completed) {
        router.push('/restaurant/form/page3');
      } else {
        router.push('/restaurant/form');
      }
    } else {
      // Si es una nueva sesión, crear una nueva y redirigir al primer paso
      const newSession: RestaurantSession = {
        id: restaurantId,
        lastStep: 1,
        lastUpdate: Date.now(),
        form1Completed: false,
        form2Completed: false
      };
      saveSession(newSession);
      router.push('/restaurant/form');
    }
  };

  // Obtener datos del restaurante desde localStorage
  useEffect(() => {
    try {
      const dataStr = localStorage.getItem("restaurantData");
      if (dataStr) {
        setRestaurantData(JSON.parse(dataStr));
      } else {
        router.replace("/");
      }
    } catch {
      router.replace("/");
    }
  }, [router]);

  // Simular carga y redirección
  useEffect(() => {
    if (!restaurantData) return;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 100);
    
    // Redirigir después de 9 segundos
    const timeout = setTimeout(() => {
      setShowWelcome(false);
      // Verificar si ya existe una sesión para este ID
      const existingSession = getSession(restaurantData.id);
      
      if (existingSession) {
        // Si existe una sesión, redirigir al último paso completado
        if (existingSession.form2Completed) {
          router.push('/restaurant/form/page3');
        } else if (existingSession.form1Completed) {
          router.push('/restaurant/form/page3');
        } else {
          router.push('/restaurant/form');
        }
      } else {
        // Si es una nueva sesión, crear una nueva y redirigir al primer paso
        const newSession: RestaurantSession = {
          id: restaurantData.id,
          lastStep: 1,
          lastUpdate: Date.now(),
          form1Completed: false,
          form2Completed: false
        };
        saveSession(newSession);
        router.push('/restaurant/form');
      }
    }, 9000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router, restaurantData]);

  if (!restaurantData) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.7 }}
              className="w-full text-center"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-electricidad mb-4 flex items-center justify-center gap-2">
                <FaFireAlt className="text-orange-500 animate-pulse" />
                Felicidades, team <span className="text-agilidad">{restaurantData.nombre}</span>
              </h1>
              <p className="text-lg md:text-xl text-frescura mb-6 font-medium">
                ¡Estamos ansiosos y cada vez más cerca de explotar las ventas!<br />
                <span className="block mt-2">
                  Primero que todo, gracias por haber iniciado su plan <span className="font-bold text-agilidad">{PLAN_LABELS[restaurantData.paquete_contratado] || restaurantData.paquete_contratado}</span>.<br />
                  Esto + los <span className="font-bold text-electricidad">{restaurantData.inversion}</span> que invertirán en publicidad + nuestras poderosas estrategias los pondrán en la cima del éxito.
                </span>
              </p>
              <div className="flex flex-col items-center mb-4">
                <div className="relative w-64 h-6 bg-orange-200 rounded-full overflow-hidden mb-2">
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-400 to-yellow-400 flex items-center justify-center"
                    style={{ width: `${progress}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaFireAlt className="text-white text-xl animate-bounce" />
                  </motion.div>
                </div>
                <span className="text-sm text-electricidad font-semibold">Estamos cargando la página...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 