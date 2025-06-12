'use client';

import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="w-full py-4 bg-crudo border-t border-electricidad/10 text-electricidad text-center text-sm">
      <div className="container mx-auto px-4">
        <motion.p 
          className="mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Todos los derechos reservados para "La Cocina que Suena LLC"
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Hecho con ❤️ por Juan Diego Díaz para La Cocina que Vende
        </motion.p>
      </div>
    </footer>
  );
};

export default Footer;
