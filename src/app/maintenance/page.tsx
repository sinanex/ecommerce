"use client";

import React from 'react';
import { Settings, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-brand-surface-lowest flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[100px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full text-center relative z-10 px-6"
      >
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="w-24 h-24 mx-auto bg-brand-surface rounded-full flex items-center justify-center text-brand-primary mb-8 shadow-inner"
        >
          <Settings size={40} />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-h text-3xl md:text-4xl font-black text-brand-on-surface mb-4 tracking-tight uppercase"
        >
          Under Maintenance
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="font-sans text-brand-on-surface-variant leading-relaxed mb-8"
        >
          We are currently upgrading our store to bring you an even better experience. We'll be back online shortly.
        </motion.p>

        <motion.button 
          onClick={() => window.location.reload()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex items-center justify-center gap-2 text-sm font-bold text-white uppercase tracking-widest bg-black hover:bg-neutral-800 active:bg-neutral-900 transition-colors py-3 px-6 rounded-xl w-max mx-auto shadow-md"
        >
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4 }}
          >
            <RefreshCw size={16} />
          </motion.div>
          <span>Refresh</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
