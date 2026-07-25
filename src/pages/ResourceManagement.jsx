import React from 'react';
import { motion } from 'framer-motion';
import { Database, Beaker, Package, Zap, Thermometer, ShieldAlert } from 'lucide-react';

const RESOURCES = [
  { id: 'O2', name: 'Liquid Oxygen (O2)', level: 32, total: '5000L', icon: Thermometer, color: '#00E5FF' },
  { id: 'BLOOD', name: 'O- Negative Blood', level: 18, total: '400 Units', icon: Beaker, color: '#FF3366' },
  { id: 'MEDS', name: 'Antiviral Stockpile', level: 78, total: '1200 Kits', icon: Package, color: '#00FFAA' },
  { id: 'POWER', name: 'Backup Generators', level: 95, total: '12 Hours', icon: Zap, color: '#FFD700' }
];

export default function ResourceManagement() {
  return (
    <div className="max-w-6xl mx-auto text-white">
      <div className="flex items-center gap-4 mb-8 border-b border-primary/20 pb-6">
        <div className="w-16 h-16 rounded-xl border border-primary bg-primary/10 flex items-center justify-center shadow-neon">
          <Database size={32} className="text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
            RESOURCE LOGISTICS
          </h1>
          <p className="text-sm font-mono text-white/50 tracking-widest uppercase">Smart Inventory Tracking & Depletion Alerts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 mb-4">
        {RESOURCES.map((res, i) => {
          const Icon = res.icon;
          const isCritical = res.level < 25;
          return (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-panel p-4 relative overflow-hidden group hover:border-[${res.color}] transition-colors lg:col-span-3 md:col-span-3`}
            >
              <div 
                className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20"
                style={{ backgroundColor: res.color }}
              />
              
              <div className="flex justify-between items-start mb-6">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${res.color}20`, border: `1px solid ${res.color}50` }}
                >
                  <Icon size={20} color={res.color} />
                </div>
                {isCritical && <ShieldAlert size={20} className="text-accent animate-pulse" />}
              </div>

              <h3 className="font-bold text-lg mb-1">{res.name}</h3>
              <p className="text-sm text-white/50 font-mono mb-4">Capacity: {res.total}</p>

              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-display font-bold" style={{ color: isCritical ? '#FF3366' : res.color }}>
                  {res.level}%
                </span>
                <span className="text-sm text-white/50 mb-1">REMAINING</span>
              </div>

              <div className="h-2 bg-black/60 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${res.level}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ 
                    backgroundColor: isCritical ? '#FF3366' : res.color,
                    boxShadow: `0 0 10px ${isCritical ? '#FF3366' : res.color}`
                  }}
                />
              </div>

              {isCritical && (
                <div className="mt-4 p-2 bg-accent/10 border border-accent/30 rounded text-xs font-mono text-accent flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" /> DEPLETION IMMINENT
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="glass-panel p-4 lg:col-span-6">
          <h3 className="text-lg font-bold text-primary mb-4">SUPPLY CHAIN PREDICTIONS</h3>
          <div className="space-y-4">
            <div className="p-4 bg-black/40 rounded-lg border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs text-white/70 tracking-widest">OXYGEN DEPLETION RATE</span>
                <span className="text-accent font-bold text-sm">4.2 L/min</span>
              </div>
              <p className="text-sm">Current reserves will be exhausted in <span className="font-bold text-accent">14 hours 20 mins</span>. Emergency restock required.</p>
            </div>
            <div className="p-4 bg-black/40 rounded-lg border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs text-white/70 tracking-widest">BLOOD BANK TREND</span>
                <span className="text-warning font-bold text-sm">-15% / week</span>
              </div>
              <p className="text-sm">Trauma influx exceeds donation rate. Recommending external procurement.</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 lg:col-span-6">
          <h3 className="text-lg font-bold text-primary mb-4">DRONE LOGISTICS TERMINAL</h3>
          <div className="space-y-3">
            {[
              { id: 'DRN-01', payload: 'Trauma Packs', status: 'IN TRANSIT', eta: '2m' },
              { id: 'DRN-02', payload: 'Blood O-', status: 'DOCKING', eta: '0m' },
              { id: 'DRN-03', payload: 'Empty', status: 'CHARGING', eta: '--' }
            ].map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 border border-white/5 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package size={16} className={d.status === 'IN TRANSIT' ? 'text-primary' : 'text-white/50'} />
                  <div>
                    <div className="text-sm font-bold">{d.id}</div>
                    <div className="text-xs text-white/50 font-mono">{d.payload}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-bold ${d.status === 'IN TRANSIT' ? 'text-success' : 'text-warning'}`}>{d.status}</div>
                  <div className="text-[10px] text-white/40">ETA: {d.eta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
