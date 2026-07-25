import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ambulance, Cross, Navigation, MapPin } from "lucide-react";

// Ambulances are passed as props from the parent component

export default function AmbulanceTracker({ ambulances = [] }) {
  // Use the ambulances prop to render, simulating movement for active ones locally if needed
  const [vehicles, setVehicles] = useState(ambulances);

  useEffect(() => {
    setVehicles(ambulances);
  }, [ambulances]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        if (v.status === "Standby" || v.status === "Available") return v;
        const dx = (Math.random() - 0.5) * 4;
        const dy = (Math.random() - 0.5) * 4;
        return {
          ...v,
          x: Math.max(0, Math.min(100, v.x + dx)),
          y: Math.max(0, Math.min(100, v.y + dy)),
        };
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, [ambulances]);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden bg-black/60 border border-primary/20 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-10 pointer-events-none">
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="border-[0.5px] border-primary" />
        ))}
      </div>

      {/* Radar Sweep */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <motion.div 
          className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30 shadow-neon"
          animate={{ y: ['0%', '1000%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* SVG Routing Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {vehicles.filter(v => v.status !== "Standby" && v.status !== "Available").map(v => (
          <motion.line 
            key={`beam-${v.ambulance_id}`}
            x1="50%" y1="50%"
            x2={`${v.x}%`} y2={`${v.y}%`}
            stroke={v.color}
            strokeWidth="1.5"
            strokeDasharray="4 6"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: -100 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="opacity-40"
          />
        ))}
      </svg>

      {/* Central Node (Hospital) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
        <motion.div 
          className="absolute w-12 h-12 rounded-lg border-2 border-primary"
          animate={{ scale: [1, 2], opacity: [0.5, 0] }} 
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <div className="w-12 h-12 bg-surface/90 border-2 border-primary rounded-lg flex items-center justify-center shadow-neon">
          <Cross size={24} className="text-white fill-primary opacity-80" />
        </div>
      </div>

      {/* Ambulances */}
      {vehicles.map(v => (
        <motion.div
          key={v.ambulance_id}
          className="absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-crosshair"
          animate={{ left: `${v.x}%`, top: `${v.y}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        >
          {v.status !== "Standby" && v.status !== "Available" && (
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full z-[-1]"
              style={{ backgroundColor: v.color }}
              animate={{ scale: [1, 1.8], opacity: [0.4, 0] }} 
              transition={{ duration: 1.5, repeat: Infinity }} 
            />
          )}

          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white border-2 border-white/50 shadow-lg relative group"
            style={{ backgroundColor: v.color }}
          >
            <Ambulance size={14} />
            
            {/* Tooltip / Label */}
            <div className="absolute left-10 top-1/2 -translate-y-1/2 bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-xs font-bold text-white tracking-widest">{v.ambulance_id}</div>
              <div className="text-[10px] text-white/50 font-mono tracking-widest uppercase">ETA: {v.eta}</div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Overlay HUD */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="absolute bottom-4 left-4 right-4 flex gap-6 bg-surface/80 backdrop-blur-md px-4 py-3 rounded-xl border border-white/5 shadow-glass z-40"
      >
        <div className="flex flex-col">
          <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">UPLINK STATUS</span>
          <div className="flex items-center gap-2 text-sm text-white font-mono mt-1">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_8px_#00FFAA]" /> SECURE
          </div>
        </div>
        <div className="flex flex-col border-l border-white/10 pl-6">
          <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">ACTIVE UNITS</span>
          <div className="text-sm text-white font-mono mt-1 font-bold">
            {vehicles.filter(v=>v.status !== 'Standby').length} / {vehicles.length}
          </div>
        </div>
        <div className="flex flex-col border-l border-white/10 pl-6">
          <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">DISPATCH COMMAND</span>
          <button className="text-xs text-primary font-bold hover:text-white transition-colors mt-1 flex items-center gap-1">
            <Navigation size={12} /> ROUTE NEAREST
          </button>
        </div>
      </motion.div>
    </div>
  );
}
