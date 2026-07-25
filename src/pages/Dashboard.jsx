import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { SeverityChart, DepartmentChart, AdmissionsChart, BedOccupancyChart } from "../components/Charts";
import MedicalScanner3D from "../components/MedicalScanner3D";
import AmbulanceTracker from "../components/AmbulanceTracker";
import AIHologramAssistant from "../components/AIHologramAssistant";
import AdminMatrixBackground from "../components/AdminMatrixBackground";
import { motion } from "framer-motion";
import { Activity, ShieldAlert, HeartPulse, Stethoscope, Zap } from "lucide-react";

const SEVERITY_COLORS = {
  Critical: "text-accent border-accent/30 bg-accent/10",
  High:     "text-warning border-warning/30 bg-warning/10",
  Medium:   "text-blue-400 border-blue-400/30 bg-blue-400/10",
  Low:      "text-success border-success/30 bg-success/10",
};

const STATUS_COLORS = {
  "Newly Admitted":  "bg-primary/20 text-primary",
  "In Treatment":    "bg-success/20 text-success",
  "Awaiting Scans":  "bg-warning/20 text-warning",
  "Stable":            "bg-blue-400/20 text-blue-400",
  "Recovering":        "bg-purple-400/20 text-purple-400",
  "Discharge Ready": "bg-gray-400/20 text-gray-400",
};

const INVENTORY = [
  { item: "Blood O-", level: 85, status: "Normal" },
  { item: "Oxygen Supply", level: 32, status: "Low" },
  { item: "Antiviral Kits", level: 64, status: "Normal" },
  { item: "Trauma Packs", level: 12, status: "Critical" },
];

function AnimatedCounter({ value, color }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <motion.span style={{ color }} className="font-display drop-shadow-neon">{count}</motion.span>;
}

export default function Dashboard() {
  const { patients, doctors, beds, admissions, aiPredictions, operations, updateOperation } = useApp();
  const highestRiskPred = aiPredictions.reduce((prev, current) => (prev.risk > current.risk) ? prev : current);
  const themeColor = highestRiskPred.color;
  const active = patients.filter(p => p.status !== "Discharged");
  const pendingOperations = (operations || []).filter(o => !['Completed', 'Cancelled', 'Rejected'].includes(o.status));

  const [reactorPower, setReactorPower] = useState(92);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const handleCalibrateReactor = () => {
    if (isCalibrating) return;
    setIsCalibrating(true);
    setReactorPower(35);
    setTimeout(() => {
      let interval = setInterval(() => {
        setReactorPower(p => {
          if (p >= 100) {
            clearInterval(interval);
            setIsCalibrating(false);
            return 100;
          }
          return p + 5;
        });
      }, 100);
    }, 1000);
  };

  const sevCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  active.forEach(p => {
    let s = p.severity;
    if (s === "Major") s = "High";
    if (s === "Moderate") s = "Medium";
    if (sevCounts[s] !== undefined) sevCounts[s]++;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative w-full text-white">
      <AdminMatrixBackground />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        
        {/* Command Header */}
        <motion.div variants={itemVariants} className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
          
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-2 border-primary/30 flex items-center justify-center bg-black/50 shadow-neon">
              <MedicalScanner3D color="#00E5FF" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-primary">
                PULSE_MATRIX CORE
              </h1>
              <p className="text-sm font-mono text-primary/70 tracking-[0.2em] uppercase mt-1">Live Operations Feed</p>
            </div>
          </div>

          <div className="flex gap-8 bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="text-center">
              <p className="text-xs text-white/50 font-bold mb-1 tracking-widest">ACTIVE CASES</p>
              <div className="text-2xl font-bold"><AnimatedCounter value={active.length} color="#00E5FF" /></div>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/50 font-bold mb-1 tracking-widest">CRITICAL</p>
              <div className="text-2xl font-bold"><AnimatedCounter value={sevCounts.Critical} color="#FF3366" /></div>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/50 font-bold mb-1 tracking-widest">STAFF READY</p>
              <div className="text-2xl font-bold"><AnimatedCounter value={doctors.filter(d=>d.status==='Available').length} color="#00FFAA" /></div>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Column - Main Ops */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* AI Predictions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiPredictions.map((pred, i) => (
                <motion.div key={pred.id} variants={itemVariants} className="glass-panel p-4 group hover:border-primary/50 transition-colors cursor-pointer">
                  <p className="text-xs font-mono text-white/50 tracking-wider mb-2">{pred.type} RISK</p>
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-3xl font-bold leading-none font-display" style={{ color: pred.color }}>{pred.risk}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full relative"
                      initial={{ width: 0 }}
                      animate={{ width: `${pred.risk}%` }}
                      transition={{ duration: 1.5 }}
                      style={{ backgroundColor: pred.color, boxShadow: `0 0 10px ${pred.color}` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div variants={itemVariants} className="glass-panel p-4">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <Activity size={18} />
                  <h3 className="font-bold tracking-wider text-sm">ADMISSIONS FLOW</h3>
                </div>
                <div className="h-[250px]"><AdmissionsChart labels={Object.keys(admissions||{})} data={Object.values(admissions||{})} /></div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="glass-panel p-4">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <HeartPulse size={18} />
                  <h3 className="font-bold tracking-wider text-sm">SEVERITY MATRIX</h3>
                </div>
                <div className="h-[250px]"><SeverityChart labels={Object.keys(sevCounts)} data={Object.values(sevCounts)} /></div>
              </motion.div>
            </div>

            {/* Patient Table */}
            <motion.div variants={itemVariants} className="glass-panel p-0 overflow-hidden">
              <div className="p-4 border-b border-primary/20 flex justify-between items-center bg-surface/50">
                <div className="flex items-center gap-2 text-primary">
                  <Stethoscope size={18} />
                  <h3 className="font-bold tracking-wider text-sm">LIVE PATIENT QUEUE</h3>
                </div>
              </div>
              <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-black/40 text-xs text-white/50 uppercase tracking-widest sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Severity</th>
                      <th className="px-6 py-4">Dept</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {active.map(p => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-mono text-primary/70">{p.id}</td>
                        <td className="px-6 py-4 font-bold">{p.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${SEVERITY_COLORS[p.severity] || SEVERITY_COLORS.Medium}`}>
                            {p.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/70">{p.department}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${STATUS_COLORS[p.status] || 'bg-gray-500/20 text-gray-400'}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Active Operations Table */}
            <motion.div variants={itemVariants} className="glass-panel p-0 overflow-hidden mt-4">
              <div className="p-4 border-b border-warning/20 flex justify-between items-center bg-surface/50">
                <div className="flex items-center gap-2 text-warning">
                  <Activity size={18} />
                  <h3 className="font-bold tracking-wider text-sm">ACTIVE OPERATIONS QUEUE</h3>
                </div>
              </div>
              <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-black/40 text-xs text-white/50 uppercase tracking-widest sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Patient</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pendingOperations.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-4 text-center text-white/50">No active operations.</td></tr>
                    ) : pendingOperations.map(op => (
                      <tr key={op.operation_id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-mono text-warning/70">OP-{op.operation_id}</td>
                        <td className="px-6 py-4 font-bold">{op.operation_type.replace('_', ' ').toUpperCase()}</td>
                        <td className="px-6 py-4 text-white/80">{op.patient_name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${op.status === 'Submitted' ? 'bg-accent/20 text-accent' : 'bg-warning/20 text-warning'}`}>
                            {op.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => updateOperation(op.operation_id, "Approved")} className="px-3 py-1 bg-success/20 text-success text-[10px] font-bold rounded border border-success/30 hover:bg-success/30">APPROVE</button>
                            <button onClick={() => updateOperation(op.operation_id, "Rejected")} className="px-3 py-1 bg-accent/20 text-accent text-[10px] font-bold rounded border border-accent/30 hover:bg-accent/30">REJECT</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

          </div>

          {/* Right Column - Subsystems */}
          <div className="lg:col-span-4 space-y-4">
            
            <motion.div variants={itemVariants} className="glass-panel p-4">
              <h3 className="text-sm font-bold text-warning flex items-center gap-2 tracking-wider mb-5">
                <Zap size={18} /> RESOURCE DEPLETION
              </h3>
              <div className="space-y-4">
                {INVENTORY.map(item => (
                  <div key={item.item}>
                    <div className="flex justify-between text-xs mb-1.5 font-bold">
                      <span className="text-white/80">{item.item}</span>
                      <span className={item.level < 20 ? 'text-accent' : item.level < 40 ? 'text-warning' : 'text-success'}>{item.level}%</span>
                    </div>
                    <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${item.level < 20 ? 'bg-accent shadow-neon-red' : item.level < 40 ? 'bg-warning' : 'bg-success'}`} 
                        style={{ width: `${item.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-panel p-4">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2 tracking-wider mb-4">
                <ShieldAlert size={18} /> LIFE SUPPORT GRID
              </h3>
              <div className="p-4 rounded-lg bg-black/40 border border-primary/20">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs text-white/50 uppercase">Core Power</span>
                  <span className="text-lg font-display text-primary">{reactorPower}%</span>
                </div>
                <div className="h-2 bg-black/60 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-primary animate-pulse shadow-neon" style={{ width: `${reactorPower}%` }} />
                </div>
                <button 
                  onClick={handleCalibrateReactor}
                  disabled={isCalibrating}
                  className="w-full py-2 bg-primary/10 hover:bg-primary/20 border border-primary/50 text-primary text-xs font-bold rounded tracking-widest transition-colors disabled:opacity-50"
                >
                  {isCalibrating ? 'RECALIBRATING...' : 'RECALIBRATE CORE'}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-panel p-0 overflow-hidden h-[300px]">
              <div className="p-4 border-b border-primary/20 bg-surface/80 absolute top-0 w-full z-10 backdrop-blur-md">
                <h3 className="text-sm font-bold text-primary tracking-wider">AMBULANCE TRACKING</h3>
              </div>
              <div className="w-full h-full pt-14 opacity-80">
                <AmbulanceTracker />
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
