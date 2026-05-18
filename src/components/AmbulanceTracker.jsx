import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const AMBULANCES = [
  { id: "AMB-01", status: "In Transit", eta: "4 mins", x: 2, y: 3, color: "#f43f5e" },
  { id: "AMB-02", status: "Responding", eta: "9 mins", x: 8, y: 1, color: "#f59e0b" },
  { id: "AMB-03", status: "Standby", eta: "0 mins", x: 5, y: 5, color: "#10b981" },
  { id: "AMB-04", status: "In Transit", eta: "12 mins", x: 1, y: 7, color: "#0ea5e9" },
  { id: "AMB-05", status: "Standby", eta: "0 mins", x: 9, y: 8, color: "#6366f1" },
];

export default function AmbulanceTracker() {
  const [vehicles, setVehicles] = useState(AMBULANCES);

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        if (v.status === "Standby") return v;
        const dx = (Math.random() - 0.5) * 0.4;
        const dy = (Math.random() - 0.5) * 0.4;
        return {
          ...v,
          x: Math.max(0, Math.min(9, v.x + dx)),
          y: Math.max(0, Math.min(9, v.y + dy)),
        };
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="tracker-root p-3 rounded-4 overflow-hidden position-relative" style={{ background: "#050b14", border: "1px solid rgba(255,255,255,0.05)", height: "450px" }}>
      {/* ── Clean Minimal Grid ── */}
      <div className="tracker-grid">
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="grid-cell" />
        ))}
      </div>

      {/* ── Clean Internal Sweep ── */}
      <div className="radar-sweep" />

      {/* ── Clean Routing Lines ── */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2 }}>
        {vehicles.filter(v => v.status !== "Standby").map(v => (
          <motion.line 
            key={`beam-${v.id}`}
            x1="50%" y1="50%"
            x2={`${(v.x / 10) * 100}%`} y2={`${(v.y / 10) * 100}%`}
            stroke={v.color}
            strokeWidth="1.5"
            strokeDasharray="4 6"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: -100 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            style={{ opacity: 0.4 }}
          />
        ))}
      </svg>

      {/* Center Hospital Node */}
      <div className="hospital-node">
        <div className="hospital-bg" />
        <i className="bi bi-hospital-fill hospital-icon" />
        <motion.div className="node-pulse" animate={{ scale: [1, 2], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />
      </div>

      {/* Ambulance Nodes */}
      {vehicles.map(v => (
        <motion.div
          key={v.id}
          className="ambulance-node"
          initial={false}
          animate={{ left: `${(v.x / 10) * 100}%`, top: `${(v.y / 10) * 100}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          style={{ "--node-color": v.color }}
        >
          {v.status !== "Standby" && (
            <motion.div className="amb-pulse" animate={{ scale: [1, 1.8], opacity: [0.4, 0] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ backgroundColor: v.color }} />
          )}

          <div className="node-icon">
            <i className="bi bi-car-front-fill" />
          </div>
          
          <div className="node-label">
            <span className="node-id">{v.id}</span>
            <span className="node-eta">{v.eta}</span>
          </div>
        </motion.div>
      ))}

      {/* HUD Info Overlay */}
      <motion.div className="tracker-hud glass-panel" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="hud-group">
          <div className="hud-label text-muted">Routing Status</div>
          <div className="hud-value"><span className="status-dot-green" /> ACTIVE</div>
        </div>
        <div className="hud-group">
          <div className="hud-label text-muted">Deployed Units</div>
          <div className="hud-value">{vehicles.length}</div>
        </div>
      </motion.div>

      <style>{`
        .tracker-root { box-shadow: inset 0 0 30px rgba(0,0,0,0.5); user-select: none; }
        .tracker-grid {
          position: absolute; inset: 0;
          display: grid; grid-template-columns: repeat(10, 1fr); grid-template-rows: repeat(10, 1fr);
          opacity: 0.1; z-index: 0;
        }
        .grid-cell { border: 1px solid #0ea5e9; }
        
        /* Smooth Internal Radar Sweep */
        .radar-sweep {
          position: absolute; width: 100%; height: 2px;
          background: linear-gradient(90deg, transparent, #0ea5e9, transparent);
          top: 0; left: 0; opacity: 0.2; z-index: 1; pointer-events: none;
          animation: radarSweep 4s linear infinite;
        }
        @keyframes radarSweep { 0% { top: 0; } 100% { top: 100%; } }

        /* Hospital Node */
        .hospital-node {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%); z-index: 5;
          display: flex; align-items: center; justify-content: center;
        }
        .hospital-bg {
          position: absolute; width: 44px; height: 44px;
          background: rgba(15, 23, 42, 0.9);
          border: 2px solid #0ea5e9; border-radius: 8px;
          box-shadow: 0 0 10px rgba(14,165,233,0.3);
        }
        .hospital-icon { color: #fff; font-size: 1.4rem; z-index: 2; }
        .node-pulse {
          position: absolute; width: 44px; height: 44px;
          background: transparent; border: 2px solid #0ea5e9; border-radius: 8px;
        }

        /* Ambulance Nodes */
        .ambulance-node { position: absolute; z-index: 6; cursor: pointer; transform: translate(-50%, -50%); }
        .amb-pulse {
          position: absolute; top: 50%; left: 50%;
          width: 28px; height: 28px; margin-top: -14px; margin-left: -14px;
          border-radius: 50%; z-index: -1;
        }
        .node-icon {
          width: 28px; height: 28px; background: var(--node-color);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 0.9rem; border: 2px solid #fff;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3); position: relative;
        }
        .node-label {
          position: absolute; left: 36px; top: -6px;
          background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px);
          padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);
          white-space: nowrap; display: flex; flex-direction: column;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        .node-id { font-size: 0.75rem; font-weight: 700; color: #fff; }
        .node-eta { font-size: 0.65rem; color: #cbd5e1; font-weight: 500; }

        /* HUD Overlay */
        .tracker-hud {
          position: absolute; bottom: 15px; left: 15px; right: 15px;
          display: flex; gap: 30px; background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(10px); padding: 12px 20px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05); z-index: 10;
        }
        .hud-group { display: flex; flex-direction: column; gap: 2px; }
        .hud-label { font-size: 0.6rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
        .hud-value { font-size: 0.85rem; color: #fff; font-weight: 600; display: flex; align-items: center; gap: 8px; font-family: 'Outfit', sans-serif; }
        .status-dot-green { width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: blink 2s infinite; }
      `}</style>
    </div>
  );
}
