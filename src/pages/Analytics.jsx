import React from 'react';
import { motion } from 'framer-motion';
import { BarChart4, TrendingUp, AlertTriangle, Eye } from 'lucide-react';
import { AdmissionsChart, SeverityChart, DepartmentChart, BedOccupancyChart } from '../components/Charts';

export default function Analytics() {
  return (
    <div className="max-w-7xl mx-auto text-white">
      <div className="flex items-center gap-4 mb-8 border-b border-primary/20 pb-6">
        <div className="w-16 h-16 rounded-xl border border-primary bg-primary/10 flex items-center justify-center shadow-neon">
          <BarChart4 size={32} className="text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
            PREDICTIVE ANALYTICS
          </h1>
          <p className="text-sm font-mono text-white/50 tracking-widest uppercase">Machine Learning Forecasts & Trend Data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 mb-4">
        <div className="glass-panel p-4 border-accent bg-accent/5 lg:col-span-3 md:col-span-3">
          <h3 className="text-xs font-bold text-accent mb-2 flex items-center gap-2"><AlertTriangle size={14}/> PREDICTED SURGE</h3>
          <div className="text-3xl font-display font-bold text-accent">+45%</div>
          <p className="text-xs text-white/50 font-mono mt-1">Expected patient influx in next 12 hours based on regional weather anomalies.</p>
        </div>
        <div className="glass-panel p-4 border-primary bg-primary/5 lg:col-span-3 md:col-span-3">
          <h3 className="text-xs font-bold text-primary mb-2 flex items-center gap-2"><TrendingUp size={14}/> BED DEMAND</h3>
          <div className="text-3xl font-display font-bold text-primary">92%</div>
          <p className="text-xs text-white/50 font-mono mt-1">Forecasted ICU occupancy rate by tomorrow morning.</p>
        </div>
        <div className="glass-panel p-4 border-warning bg-warning/5 lg:col-span-3 md:col-span-3">
          <h3 className="text-xs font-bold text-warning mb-2 flex items-center gap-2"><Eye size={14}/> BOTTLENECK PREDICTION</h3>
          <div className="text-xl font-bold text-warning">Radiology</div>
          <p className="text-xs text-white/50 font-mono mt-1">Estimated 45 min queue time for CT scans.</p>
        </div>
        <div className="glass-panel p-4 border-success bg-success/5 lg:col-span-3 md:col-span-3">
          <h3 className="text-xs font-bold text-success mb-2 flex items-center gap-2"><Activity size={14}/> STAFFING ADEQUACY</h3>
          <div className="text-3xl font-display font-bold text-success">Optimal</div>
          <p className="text-xs text-white/50 font-mono mt-1">Sufficient personnel for current and forecasted load.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="glass-panel p-4 h-[350px] flex flex-col lg:col-span-6">
          <h3 className="text-sm font-bold text-white mb-4 tracking-wider">7-DAY ADMISSIONS FORECAST (AI MODEL)</h3>
          <div className="flex-1 min-h-0 relative">
            <AdmissionsChart />
          </div>
        </motion.div>
        
        <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{delay:0.1}} className="glass-panel p-4 h-[350px] flex flex-col lg:col-span-6">
          <h3 className="text-sm font-bold text-white mb-4 tracking-wider">PREDICTED DEPARTMENT LOAD</h3>
          <div className="flex-1 min-h-0 relative">
            <DepartmentChart />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{delay:0.2}} className="glass-panel p-4 h-[300px] flex flex-col lg:col-span-6">
          <h3 className="text-sm font-bold text-white mb-4 tracking-wider">CURRENT SEVERITY DISTRIBUTION</h3>
          <div className="flex-1 min-h-0 relative">
            <SeverityChart />
          </div>
        </motion.div>

        <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{delay:0.3}} className="glass-panel p-4 h-[300px] flex flex-col lg:col-span-6">
          <h3 className="text-sm font-bold text-white mb-4 tracking-wider">LIVE BED ALLOCATION</h3>
          <div className="flex-1 min-h-0 relative">
            <BedOccupancyChart />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Ensure Activity icon is imported locally if missing in my block
import { Activity } from 'lucide-react';
