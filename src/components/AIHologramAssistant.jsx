import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Zap, Cpu } from 'lucide-react';

export default function AIHologramAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMessage, setActiveMessage] = useState("System standby. Monitoring emergency protocols...");

  const recommendations = [
    "Alert: Elevated ICU occupancy in Sector 4. Suggest redirecting non-critical cases.",
    "Optimization: Physician 'Dr. Sarah' has 20% capacity. Assigned to triage #204.",
    "Critical: AI Engine predicts 82% risk of cardiac arrest for Patient #8812.",
  ];

  const handleInteraction = () => {
    const randomMsg = recommendations[Math.floor(Math.random() * recommendations.length)];
    setActiveMessage(randomMsg);
    setIsOpen(true);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {/* Hologram Trigger */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleInteraction}
        className="relative cursor-pointer group"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.3)] group-hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] transition-shadow">
          <Bot size={32} className="text-primary group-hover:animate-pulse" />
        </div>
        
        {/* Floating Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-1 border border-dashed border-primary/40 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-2 border border-dotted border-blue-500/30 rounded-full"
        />
      </motion.div>

      {/* Hologram Display Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="absolute bottom-24 right-0 w-80 glass-panel border-primary/50 shadow-neon p-5 overflow-hidden"
          >
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(0,229,255,0.03)_3px,rgba(0,229,255,0.03)_3px)] z-0" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4 border-b border-primary/20 pb-2">
                <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs">
                  <Cpu size={14} className="animate-pulse" />
                  AI COPILOT
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <motion.p 
                key={activeMessage}
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-sm text-white/90 font-mono mb-6 leading-relaxed"
              >
                "{activeMessage}"
              </motion.p>

              <div className="flex gap-3">
                <button className="flex-1 bg-primary/20 hover:bg-primary/40 border border-primary text-primary hover:text-white py-1.5 rounded transition-colors text-xs font-bold tracking-wider flex items-center justify-center gap-1">
                  <Zap size={12} /> EXECUTE
                </button>
                <button onClick={() => setIsOpen(false)} className="flex-1 bg-transparent border border-white/20 text-white/50 hover:bg-white/5 hover:text-white py-1.5 rounded transition-colors text-xs tracking-wider">
                  DISMISS
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
