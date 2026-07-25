import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Activity, Zap, Cpu, Bell, ActivitySquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function LeftPanel() {
  const { patients, aiPredictions } = useApp();

  const emergencyOccupancy = patients.filter(p => p.department === 'Emergency').length;
  const icuOccupancy = patients.filter(p => p.department === 'ICU').length;

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
      
      {/* Infrastructure Status */}
      <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} className="glass-panel p-4">
        <h3 className="text-xs font-bold text-primary mb-3 flex items-center gap-2 tracking-widest uppercase">
          <Zap size={14} /> Core Infrastructure
        </h3>
        <div className="space-y-3 font-mono text-[10px]">
          <div className="flex justify-between items-center p-2 bg-black/40 rounded border border-white/5">
            <span className="text-white/70">Main Power Grid</span>
            <span className="text-success font-bold flex items-center gap-1"><div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"/> OPTIMAL</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-black/40 rounded border border-white/5">
            <span className="text-white/70">Backup Generators</span>
            <span className="text-warning font-bold">STANDBY</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-black/40 rounded border border-white/5">
            <span className="text-white/70">Oxygen Network</span>
            <span className="text-success font-bold">94% CAP</span>
          </div>
        </div>
      </motion.div>

      {/* AI Recommendations */}
      <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay:0.1}} className="glass-panel p-4 border-accent/30 shadow-[inset_0_0_20px_rgba(255,51,102,0.05)]">
        <h3 className="text-xs font-bold text-accent mb-3 flex items-center gap-2 tracking-widest uppercase">
          <Cpu size={14} /> AI Optimization Engine
        </h3>
        <div className="space-y-3">
          {emergencyOccupancy > 10 ? (
             <div className="p-3 bg-accent/10 border border-accent/50 rounded-lg">
               <div className="text-xs font-bold text-accent mb-1 flex items-center gap-1"><AlertTriangle size={12}/> Emergency Overload</div>
               <p className="text-[10px] font-mono text-white/80">Emergency Department at {emergencyOccupancy} patients. Recommendation: Transfer 5 low-risk patients to General Ward. Assign Dr. Wilson to Triage.</p>
               <button className="mt-2 w-full py-1.5 bg-accent/20 hover:bg-accent/40 border border-accent text-accent text-[10px] font-bold rounded transition-colors">
                 EXECUTE TRANSFER PROTOCOL
               </button>
             </div>
          ) : (
            <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
               <div className="text-xs font-bold text-success mb-1 flex items-center gap-1"><ActivitySquare size={12}/> System Stable</div>
               <p className="text-[10px] font-mono text-white/80">Flow metrics normal. No immediate rebalancing required.</p>
             </div>
          )}
        </div>
      </motion.div>

      {/* Critical Events Feed */}
      <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay:0.2}} className="glass-panel p-4 flex-1 min-h-0 flex flex-col">
        <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2 tracking-widest uppercase">
          <Bell size={14} className="text-warning" /> Critical Events
        </h3>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {aiPredictions.map(pred => (
            <div key={pred.id} className="p-2 bg-black/40 rounded border-l-2" style={{ borderLeftColor: pred.color }}>
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-white uppercase">{pred.type}</span>
                <span className="text-[10px] font-mono" style={{ color: pred.color }}>Risk: {pred.risk}%</span>
              </div>
              <p className="text-[9px] text-white/50 font-mono">System auto-flagged anomaly detected in telemetry datastream.</p>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
