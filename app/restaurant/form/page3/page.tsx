'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import confetti from 'canvas-confetti';

export default function RestaurantForm3() {
  const router = useRouter();
  const { userData } = useUser();

  useEffect(() => {
    // Efecto de confeti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-electricidad mb-6">
            🎉 ¡Felicidades! 🎉
          </h1>
          
          <p className="text-xl text-frescura mb-8">
            ¡Gracias por completar tu registro! Estamos emocionados de trabajar contigo y ayudarte a hacer crecer tu restaurante. Pronto nos pondremos en contacto contigo para comenzar este increíble viaje juntos.
          </p>

          <div className="aspect-w-16 aspect-h-9 mb-8">
            <iframe
              src="https://www.loom.com/embed/359f66e0144f4c6281fb0cd9495a4f65"
              allowFullScreen
              className="w-full h-full rounded-lg"
            ></iframe>
          </div>

          <motion.button
            onClick={() => router.push('/')}
            className="btn-primary w-full"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Finalizar
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
} 