import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCircle, Clock, HeartPulse, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function WorkforceManagement() {
  const { doctors } = useApp();

  // Mock schedule data for Gantt chart
  const SHIFTS = [
    { start: 0, width: 8, label: '00:00 - 08:00' },
    { start: 8, width: 8, label: '08:00 - 16:00' },
    { start: 16, width: 8, label: '16:00 - 00:00' }
  ];

  return (
    <div className="max-w-6xl mx-auto text-white">
      <div className="flex items-center gap-4 mb-8 border-b border-primary/20 pb-6">
        <div className="w-16 h-16 rounded-xl border border-primary bg-primary/10 flex items-center justify-center shadow-neon">
          <Users size={32} className="text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
            WORKFORCE ROSTER
          </h1>
          <p className="text-sm font-mono text-white/50 tracking-widest uppercase">AI Fatigue Prediction & Shift Logistics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        
        {/* Fatigue Alert */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="glass-panel p-4 border-accent bg-accent/10 shadow-neon-red lg:col-span-4">
          <h3 className="text-sm font-bold text-accent mb-4 flex items-center gap-2"><ShieldAlert size={18}/> HIGH FATIGUE RISK</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-accent font-bold">JD</div>
            <div>
              <div className="font-bold">Dr. John Doe</div>
              <div className="text-xs text-white/70 font-mono">Cardiology ICU</div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs font-mono"><span className="text-white/50">Consecutive Hours</span><span className="text-accent font-bold">14h</span></div>
            <div className="flex justify-between text-xs font-mono"><span className="text-white/50">Current HR</span><span className="text-warning">110 BPM</span></div>
            <div className="flex justify-between text-xs font-mono"><span className="text-white/50">Error Probability</span><span className="text-accent font-bold">Elevated</span></div>
          </div>
          <button className="w-full py-2 bg-accent/20 text-accent border border-accent hover:bg-accent/40 rounded transition-colors text-xs font-bold tracking-widest">
            FORCE SHIFT ROTATION
          </button>
        </motion.div>

        {/* Global Staff Stats */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="glass-panel p-4 lg:col-span-8 grid grid-cols-3 gap-4">
          <div className="flex flex-col justify-center items-center text-center p-4 bg-black/40 border border-white/5 rounded-xl">
            <UserCircle size={24} className="text-primary mb-2" />
            <div className="text-3xl font-display font-bold">{doctors.length}</div>
            <div className="text-xs text-white/50 font-mono mt-1">TOTAL STAFF</div>
          </div>
          <div className="flex flex-col justify-center items-center text-center p-4 bg-success/10 border border-success/30 rounded-xl">
            <Clock size={24} className="text-success mb-2" />
            <div className="text-3xl font-display font-bold text-success">{doctors.filter(d=>d.status==='Available').length}</div>
            <div className="text-xs text-success/70 font-mono mt-1">READY FOR DEPLOYMENT</div>
          </div>
          <div className="flex flex-col justify-center items-center text-center p-4 bg-warning/10 border border-warning/30 rounded-xl">
            <HeartPulse size={24} className="text-warning mb-2" />
            <div className="text-3xl font-display font-bold text-warning">1</div>
            <div className="text-xs text-warning/70 font-mono mt-1">CRITICAL FATIGUE</div>
          </div>
        </motion.div>
      </div>

      {/* Roster & Shift Gantt Chart */}
      <div className="glass-panel p-4">
        <h3 className="text-lg font-bold text-primary mb-6">LIVE SHIFT MATRIX (24H)</h3>
        
        {/* Timeline Header */}
        <div className="flex mb-4 pl-48 pr-4">
          {SHIFTS.map((s, i) => (
            <div key={i} className="flex-1 text-[10px] font-mono text-white/50 text-center border-l border-white/10">
              {s.label}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {doctors.map((doc, i) => {
            // Mock shift assignments
            const shiftIdx = i % 3;
            const shift = SHIFTS[shiftIdx];
            const isActive = shiftIdx === 1; // Assuming current time is mid-day
            const fatigue = isActive ? (Math.random() * 50 + 20) : 0;
            const isFatigued = fatigue > 60;

            return (
              <div key={doc.id} className="flex items-center gap-4 bg-black/40 p-2 rounded-lg border border-white/5 relative">
                <div className="w-44 flex-shrink-0">
                  <div className="font-bold text-sm truncate">{doc.name}</div>
                  <div className="text-[10px] font-mono text-white/50 truncate">{doc.department}</div>
                </div>
                
                {/* Timeline Area */}
                <div className="flex-1 h-8 bg-white/5 rounded relative">
                  <div 
                    className="absolute top-1 bottom-1 rounded flex items-center justify-center text-[10px] font-bold text-black/70 shadow-neon"
                    style={{
                      left: `${(shift.start / 24) * 100}%`,
                      width: `${(shift.width / 24) * 100}%`,
                      backgroundColor: isActive ? (isFatigued ? '#FF3366' : '#00E5FF') : '#1C4E80',
                      opacity: isActive ? 1 : 0.4
                    }}
                  >
                    {isActive ? (isFatigued ? 'FATIGUE DETECTED' : 'ON ACTIVE DUTY') : 'SCHEDULED'}
                  </div>
                </div>

                <div className="w-20 flex-shrink-0 text-right">
                  <div className="text-[10px] font-mono text-white/50 mb-0.5">Fatigue</div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${fatigue}%`, 
                        backgroundColor: isFatigued ? '#FF3366' : (fatigue > 40 ? '#FFD700' : '#00FFAA') 
                      }} 
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
