import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { SeverityChart, DepartmentChart, AdmissionsChart, BedOccupancyChart } from "../components/Charts";
import MedicalScanner3D from "../components/MedicalScanner3D";
import AmbulanceTracker from "../components/AmbulanceTracker";
import AIHologramAssistant from "../components/AIHologramAssistant";
import AdminMatrixBackground from "../components/AdminMatrixBackground";
import { motion, AnimatePresence } from "motion/react";

const SEVERITY_CLS = {
  Critical: "severity-critical",
  High:     "severity-major",
  Medium:   "severity-moderate",
  Low:      "severity-minor",
};

const STATUS_CLS = {
  "Newly Admitted":  "bg-primary",
  "In Treatment":    "bg-success",
  "Awaiting Scans":  "bg-warning",
  Stable:            "bg-info",
  Recovering:        "bg-secondary",
  "Discharge Ready": "bg-dark",
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
  return <motion.span style={{ color }} animate={{ textShadow: [`0 0 5px ${color}`, `0 0 15px ${color}`, `0 0 5px ${color}`] }} transition={{ repeat: Infinity, duration: 2 }}>{count}</motion.span>;
}

export default function Dashboard({ onNavigate }) {
  const { patients, doctors, beds, admissions, disasterMode, aiPredictions, toggleDisasterMode } = useApp();
  const highestRiskPred = aiPredictions.reduce((prev, current) => (prev.risk > current.risk) ? prev : current);
  const themeColor = highestRiskPred.color;
  const active = patients.filter(p => p.status !== "Discharged");

  // Dynamic Interactive States for tactical operations
  const [reactorPower, setReactorPower] = useState(92);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [securityStatus, setSecurityStatus] = useState("SECURE");
  const [isPurging, setIsPurging] = useState(false);
  const [drone4Status, setDrone4Status] = useState("IN TRANSIT");
  const [tickerAlert, setTickerAlert] = useState("SYSTEM ALERT: Oxygen pressure stable in Sector 4.");

  // Action methods
  const handleCalibrateReactor = () => {
    if (isCalibrating) return;
    setIsCalibrating(true);
    setReactorPower(35); // simulate temporary drop during grid recalibration
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

  const handlePurgeDefenses = () => {
    if (isPurging) return;
    setIsPurging(true);
    setSecurityStatus("HIPAA AUDIT PURGE");
    setTimeout(() => {
      setSecurityStatus("SECURE");
      setIsPurging(false);
    }, 3000);
  };

  const handleDispatchDrone = () => {
    setDrone4Status(prev => prev === "IN TRANSIT" ? "DISPATCHED" : prev === "DISPATCHED" ? "DELIVERED" : "IN TRANSIT");
  };

  const handleBroadcastAlert = () => {
    const alerts = [
      "CODE BLUE: Resuscitation team to Sector 4 ICU immediately!",
      "TRAUMA ALERT: Level 1 Trauma patient arriving in 5 minutes via Heliport.",
      "CLINICAL ADVISORY: Blood bank O-negative reserves successfully replenished.",
      "BIOSAFETY ADVISORY: Pathogen containment filters successfully sanitized."
    ];
    const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
    setTickerAlert(randomAlert);
  };

  // Dynamic Chart Data
  const sevCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  active.forEach(p => {
    let s = p.severity;
    if (s === "Major") s = "High";
    if (s === "Moderate") s = "Medium";
    if (sevCounts[s] !== undefined) sevCounts[s]++;
  });

  const trendsLabels = Object.keys(admissions || {});
  const trendsValues = Object.values(admissions || {});

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.95 },
    visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="admin-ops-root">
      <AdminMatrixBackground />
      
      {/* ── Top HUD Ticker ── */}
      <div className="admin-hud-top">
        <div className="hud-ticker">
          <div className="ticker-tag">LIVE OPS STREAM</div>
          <div className="ticker-text">
            <span>INFLOW RATE: 2.4 PATIENTS/HR</span>
            <span>BED OCCUPANCY: {Math.round((beds.filter(b => b.status === 'Occupied').length / beds.length) * 100)}%</span>
            <span>{tickerAlert}</span>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 pt-5 pb-5 position-relative" style={{ zIndex: 10 }}>
        
        {/* ── Command Header ── */}
        <motion.div 
          className="command-header glass-panel p-4 mb-4"
          initial={{ y: -50, opacity: 0, filter: "blur(10px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="row align-items-center">
            <div className="col-auto">
              <div style={{ width: 120, height: 120 }} className="scanner-container">
                <MedicalScanner3D color={themeColor} />
              </div>
            </div>
            <div className="col">
              <h1 className="command-title mb-1">PULSE MATRIX COMMAND</h1>
              <div className="command-subtitle text-uppercase letter-spacing-2">Central Operations & Clinical Logistics</div>
              <div className="d-flex gap-4 mt-3">
                <div className="cmd-stat">ACTIVE: <AnimatedCounter value={active.length} color="#0ea5e9" /></div>
                <div className="cmd-stat">CRITICAL: <AnimatedCounter value={active.filter(p => p.severity === 'Critical').length} color="#f43f5e" /></div>
                <div className="cmd-stat">STAFF READY: <AnimatedCounter value={doctors.filter(d => d.status === 'Available').length} color="#10b981" /></div>
              </div>
            </div>
            <div className="col-auto">
              <div className="d-flex gap-2">
                <button className={`btn-cmd ${disasterMode ? 'btn-cmd-danger' : ''}`} onClick={toggleDisasterMode}>
                  <i className="bi bi-shield-exclamation me-1" /> {disasterMode ? "EXIT DISASTER" : "DISASTER MODE"}
                </button>
                <button className="btn-cmd btn-cmd-primary" onClick={() => onNavigate("registration")}>
                  <i className="bi bi-plus-lg me-1" /> NEW INTAKE
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="row g-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ── Main Data Column ── */}
          <div className="col-xl-9">
            {/* Row 1: AI Risks */}
            <div className="row g-4 mb-4">
              {aiPredictions.map((pred, i) => (
                <div key={pred.id} className="col-md-4">
                  <motion.div 
                    className="glass-panel p-3 hud-card-v2" 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      boxShadow: [`0 0 0px ${pred.color}00`, `0 0 15px ${pred.color}66`, `0 0 0px ${pred.color}00`]
                    }}
                    transition={{ 
                      opacity: { duration: 0.5, delay: i * 0.1 },
                      scale: { duration: 0.5, delay: i * 0.1 },
                      boxShadow: { repeat: Infinity, duration: 3, delay: i * 0.5 } 
                    }}
                    whileHover={{ scale: 1.05, rotateX: 5, boxShadow: `0 0 30px ${pred.color}99` }}
                  >
                    <div className="small text-muted fw-bold mb-1">{pred.type} RISK</div>
                    <div className="fs-3 fw-bold"><AnimatedCounter value={pred.risk} color={pred.color} />%</div>
                    <div className="progress mt-2" style={{ height: 4, background: "rgba(255,255,255,0.05)", overflow: "visible" }}>
                      <motion.div 
                        className="progress-bar" 
                        initial={{ width: 0 }}
                        animate={{ width: `${pred.risk}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{ 
                          background: `linear-gradient(90deg, transparent, ${pred.color})`,
                          boxShadow: `0 0 10px ${pred.color}`,
                          position: "relative"
                        }} 
                      >
                        <motion.div 
                          style={{ position: "absolute", right: 0, top: -2, width: 8, height: 8, borderRadius: "50%", background: "#fff", boxShadow: `0 0 10px ${pred.color}` }}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Row 2: Main Charts */}
            <div className="row g-4 mb-4">
              <div className="col-lg-7">
                <motion.div className="glass-panel p-4 hud-card-v2 h-100" variants={cardVariants}>
                  <h3 className="hud-title-sm mb-4"><i className="bi bi-graph-up me-2" />ADMISSIONS FLOW (7D)</h3>
                  <div style={{ height: 300 }}><AdmissionsChart labels={trendsLabels} data={trendsValues} /></div>
                </motion.div>
              </div>
              <div className="col-lg-5">
                <motion.div className="glass-panel p-4 hud-card-v2 h-100" variants={cardVariants}>
                  <h3 className="hud-title-sm mb-4"><i className="bi bi-pie-chart me-2" />SEVERITY MATRIX</h3>
                  <div style={{ height: 300 }}><SeverityChart labels={Object.keys(sevCounts)} data={Object.values(sevCounts)} /></div>
                </motion.div>
              </div>
            </div>

            {/* Row 3: THE SATELLITE TRACER (ENLARGED) */}
            <motion.div className="glass-panel p-4 mb-4 hud-card-v2" variants={cardVariants}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="hud-title-sm mb-0 text-danger"><i className="bi bi-geo-alt-fill me-2" />SATELLITE TRACER & AMBULANCE DISPATCH</h3>
                <div className="d-flex gap-2">
                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle">LIVE TELEMETRY</span>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle">S-01 LINK ACTIVE</span>
                </div>
              </div>
              <div style={{ minHeight: "400px" }}>
                <AmbulanceTracker />
              </div>
            </motion.div>

            {/* Row 4: Full Patient Table */}
            <motion.div className="glass-panel p-4 hud-card-v2" variants={cardVariants}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="hud-title-sm mb-0"><i className="bi bi-table me-2" />RECENT INTAKE FLOW</h3>
                <button className="btn btn-sm btn-outline-primary" onClick={() => onNavigate("queue")}>VIEW FULL QUEUE</button>
              </div>
              <div className="table-responsive" style={{ maxHeight: "450px", overflowY: "auto" }}>
                <table className="premium-table w-100">
                  <thead style={{ position: "sticky", top: 0, background: "rgba(15, 23, 42, 0.95)", zIndex: 1 }}>
                    <tr>
                      {["CASE ID","PATIENT","SEVERITY","DEPT","BED","DOCTOR","STATUS"].map(h => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {active.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-4 opacity-50">NO ACTIVE CASES</td></tr>
                    ) : (
                      active.map(p => (
                        <tr key={p.id}>
                          <td className="fw-bold">{p.id}</td>
                          <td>{p.name}</td>
                          <td><span className={`badge-severity ${SEVERITY_CLS[p.severity] || 'severity-moderate'}`}>{p.severity}</span></td>
                          <td>{p.department}</td>
                          <td>{p.assignedBed || '—'}</td>
                          <td>{p.assignedDoctor || '—'}</td>
                          <td><span className={`badge ${STATUS_CLS[p.status] || 'bg-secondary'}`} style={{fontSize: '0.65rem'}}>{p.status}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Row 5: Infrastructure & Logistics (NEW FEATURES) */}
            <motion.div className="row g-4 mt-1" variants={containerVariants}>
              <div className="col-md-4">
                <motion.div className="glass-panel p-3 hud-card-v2 h-100" whileHover={{ scale: 1.02 }}>
                  <h3 className="hud-title-sm mb-3"><i className="bi bi-fan me-2" />BIOSAFETY & VENTILATION</h3>
                  <div className="d-flex justify-content-between x-small mb-1"><span className="text-muted">Pathogen Filter Capacity</span><span className="text-success">99.9%</span></div>
                  <div className="progress mb-3" style={{ height: 2, background: "rgba(255,255,255,0.05)" }}><div className="progress-bar bg-success" style={{ width: "100%" }}/></div>
                  <div className="d-flex justify-content-between x-small mb-1"><span className="text-muted">ICU Negative Air Flow</span><span className="text-info">Optimal</span></div>
                  <div className="progress" style={{ height: 2, background: "rgba(255,255,255,0.05)" }}><div className="progress-bar bg-info" style={{ width: "85%" }}/></div>
                </motion.div>
              </div>
              <div className="col-md-4">
                <motion.div className="glass-panel p-3 hud-card-v2 h-100" whileHover={{ scale: 1.02 }}>
                  <h3 className="hud-title-sm mb-3"><i className="bi bi-lightning-charge-fill me-2" />LIFE SUPPORT POWER</h3>
                  <div className="d-flex justify-content-between x-small mb-1"><span className="text-muted">Backup Power Grid</span><span className="text-primary" style={{ textShadow: "0 0 5px #0ea5e9" }}>{isCalibrating ? "RECONFIGURING" : "STABLE"}</span></div>
                  <div className="progress mb-3" style={{ height: 2, background: "rgba(255,255,255,0.05)" }}><div className="progress-bar bg-primary progress-bar-striped progress-bar-animated" style={{ width: `${reactorPower}%` }}/></div>
                  <div className="d-flex justify-content-between x-small mb-1"><span className="text-muted">Oxygen Concentrators</span><span className="text-warning">STANDBY READY</span></div>
                  <div className="progress" style={{ height: 2, background: "rgba(255,255,255,0.05)" }}><div className="progress-bar bg-warning" style={{ width: "100%" }}/></div>
                </motion.div>
              </div>
              <div className="col-md-4">
                <motion.div className="glass-panel p-3 hud-card-v2 h-100" whileHover={{ scale: 1.02 }}>
                  <h3 className="hud-title-sm mb-3"><i className="bi bi-shield-lock-fill me-2" />HIPAA EHR SECURITY</h3>
                  <div className="x-small text-muted mb-2">Network Encryption: <span className="text-success fw-bold">AES-1024</span></div>
                  <div className="x-small text-muted mb-2">EHR Record Breaches: <span className="text-success fw-bold">0 DETECTED</span></div>
                  <div className="p-2 mt-2 rounded" style={{ border: `1px solid ${isPurging ? "rgba(244, 63, 94, 0.5)" : "rgba(16,185,129,0.3)"}`, background: isPurging ? "rgba(244, 63, 94, 0.1)" : "rgba(16,185,129,0.05)" }}>
                     <div className="x-small text-center fw-bold" style={{ color: isPurging ? "#f43f5e" : "#10b981", animation: "blink 1.5s infinite", textShadow: `0 0 5px ${isPurging ? "#f43f5e" : "#10b981"}` }}>{securityStatus}</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* ── Sidebar Column ── */}
          <div className="col-xl-3">
            <motion.div className="glass-panel p-4 mb-4 hud-card-v2" variants={cardVariants}>
              <h3 className="hud-title-sm mb-4"><i className="bi bi-bar-chart me-2" />DEPT LOAD</h3>
              <div style={{ height: 250 }}><DepartmentChart /></div>
            </motion.div>

            <motion.div className="glass-panel p-4 mb-4 hud-card-v2" variants={cardVariants}>
              <h3 className="hud-title-sm mb-4"><i className="bi bi-circle-square me-2" />BED INVENTORY</h3>
              <div style={{ height: 250 }}><BedOccupancyChart /></div>
            </motion.div>

            <motion.div className="glass-panel p-4 hud-card-v2" variants={cardVariants}>
              <h3 className="hud-title-sm mb-4 text-warning"><i className="bi bi-box-seam-fill me-2" />RESOURCE LOGISTICS</h3>
              {INVENTORY.map(item => (
                <div key={item.item} className="mb-3">
                  <div className="d-flex justify-content-between x-small fw-bold mb-1">
                    <span>{item.item}</span>
                    <span style={{ color: item.level < 20 ? "#f43f5e" : item.level < 40 ? "#f59e0b" : "#10b981" }}>{item.level}%</span>
                  </div>
                  <div className="progress" style={{ height: 4, background: "rgba(255,255,255,0.05)" }}>
                    <div className="progress-bar" style={{ width: `${item.level}%`, background: item.level < 20 ? "#f43f5e" : item.level < 40 ? "#f59e0b" : "#10b981" }} />
                  </div>
                </div>
              ))}
              <div className="alert-panel mt-3">
                <div className="alert-header">LOGISTICS ALERT</div>
                <div className="alert-body">Monitoring depletion rates...</div>
              </div>
            </motion.div>

            <div className="mt-4">
              <AIHologramAssistant />
            </div>

            {/* NEW FEATURE: Drone Network & Fatigue */}
            <motion.div className="glass-panel p-4 mt-4 hud-card-v2" variants={cardVariants}>
              <h3 className="hud-title-sm mb-3"><i className="bi bi-send-fill me-2" />TRAUMA DRONE SUPPLY</h3>
              <div className="d-flex justify-content-between align-items-center mb-2 p-2 rounded" style={{ background: "rgba(255,255,255,0.03)" }}>
                 <div className="x-small"><i className="bi bi-box-seam me-2 text-info" style={{ textShadow: "0 0 5px #0ea5e9" }}/>Drone Unit D-04</div>
                 <span className="badge x-small" style={{ 
                   background: drone4Status === "IN TRANSIT" ? "#0ea5e9" : drone4Status === "DISPATCHED" ? "#f59e0b" : "#10b981", 
                   boxShadow: `0 0 10px ${drone4Status === "IN TRANSIT" ? "#0ea5e9" : drone4Status === "DISPATCHED" ? "#f59e0b" : "#10b981"}aa`
                 }}>{drone4Status}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2 p-2 rounded" style={{ background: "rgba(255,255,255,0.03)" }}>
                 <div className="x-small"><i className="bi bi-box-seam me-2 text-warning"/>Drone Unit D-11</div>
                 <span className="badge bg-warning text-dark x-small">CHARGING</span>
              </div>
            </motion.div>

            <motion.div className="glass-panel p-4 mt-4 hud-card-v2" variants={cardVariants}>
              <h3 className="hud-title-sm mb-3"><i className="bi bi-person-lines-fill me-2" />AI CLINICAL STAFF FATIGUE</h3>
              <div className="d-flex justify-content-between x-small mb-1"><span className="text-muted">ER Trauma Team Alpha</span><span className="text-danger fw-bold" style={{ textShadow: "0 0 5px #f43f5e" }}>88%</span></div>
              <div className="progress mb-2" style={{ height: 3, background: "rgba(255,255,255,0.05)" }}><div className="progress-bar bg-danger" style={{ width: "88%" }}/></div>
              <div className="x-small text-muted" style={{ fontSize: "0.6rem" }}>Recommendation: Shift rotation in 45m</div>
            </motion.div>

            {/* ── NEW FEATURE: TACTICAL OPERATIONS DECK ── */}
            <motion.div className="glass-panel p-4 mt-4 hud-card-v2" variants={cardVariants}>
              <h3 className="hud-title-sm mb-3"><i className="bi bi-cpu-fill me-2" />CLINICAL OPERATIONS PANEL</h3>
              <div className="d-flex flex-column gap-2">
                <button className="btn btn-sm btn-outline-primary text-start d-flex justify-content-between align-items-center" onClick={handleCalibrateReactor} disabled={isCalibrating}>
                  <span><i className="bi bi-lightning-charge me-2"/>RECONFIG LIFE SUPPORT</span>
                  {isCalibrating && <span className="spinner-border spinner-border-sm" role="status"/>}
                </button>
                <button className="btn btn-sm btn-outline-danger text-start" onClick={handlePurgeDefenses} disabled={isPurging}>
                  <i className="bi bi-shield-slash me-2"/>SANITIZE HIPAA RECORDS
                </button>
                <button className="btn btn-sm btn-outline-info text-start" onClick={handleDispatchDrone}>
                  <i className="bi bi-airplane-engines me-2"/>DISPATCH MED-DELIVERY DRONE
                </button>
                <button className="btn btn-sm btn-outline-warning text-start" onClick={handleBroadcastAlert}>
                  <i className="bi bi-broadcast me-2"/>PAGE EMERGENCY CODE
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <style>{`
        .admin-ops-root { min-height: 100vh; color: #fff; font-family: 'Outfit'; overflow-x: hidden; }
        .admin-hud-top { position: fixed; top: 0; left: 0; right: 0; height: 36px; background: rgba(2, 6, 23, 0.9); border-bottom: 1px solid rgba(14, 165, 233, 0.3); z-index: 1000; }
        .hud-ticker { display: flex; align-items: center; height: 100%; }
        .ticker-tag { background: #0ea5e9; color: #fff; font-weight: 800; font-size: 0.65rem; padding: 0 15px; height: 100%; display: flex; align-items: center; letter-spacing: 1px; }
        .ticker-text { display: flex; animation: ticker 30s linear infinite; }
        .ticker-text span { color: #94a3b8; font-size: 0.7rem; font-weight: 700; margin-left: 50px; white-space: nowrap; }
        @keyframes ticker { from { transform: translateX(100%); } to { transform: translateX(-100%); } }

        .command-header { border-left: 5px solid #0ea5e9; background: rgba(15, 23, 42, 0.6) !important; }
        .command-title { font-weight: 900; letter-spacing: -1px; font-size: 2rem; }
        .command-subtitle { font-size: 0.7rem; font-weight: 700; color: #64748b; letter-spacing: 2px; }
        .cmd-stat { font-size: 0.8rem; font-weight: 800; }
        .letter-spacing-2 { letter-spacing: 2px; }

        .hud-card-v2 { border-radius: 20px; background: rgba(15, 23, 42, 0.5) !important; border: 1px solid rgba(255,255,255,0.06); transition: all 0.3s ease; }
        .hud-card-v2:hover { border-color: rgba(14, 165, 233, 0.3); transform: translateY(-5px); box-shadow: 0 10px 30px rgba(14, 165, 233, 0.15); }
        .hud-title-sm { font-size: 0.8rem; font-weight: 800; letter-spacing: 1px; color: #0ea5e9; }

        .btn-cmd { border: none; background: rgba(255,255,255,0.05); color: #fff; font-weight: 800; font-size: 0.7rem; padding: 8px 16px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); }
        .btn-cmd-danger { background: #f43f5e; border-color: #f43f5e; }
        .btn-cmd-primary { background: #0ea5e9; border-color: #0ea5e9; }

        .alert-panel { background: rgba(14, 165, 233, 0.05); border: 1px solid rgba(14, 165, 233, 0.2); padding: 12px; border-radius: 12px; }
        .alert-header { font-size: 0.65rem; font-weight: 900; color: #0ea5e9; margin-bottom: 2px; }
        .alert-body { font-size: 0.65rem; color: #94a3b8; font-weight: 600; }
        .x-small { font-size: 0.65rem; }
      `}</style>
    </div>
  );
}
