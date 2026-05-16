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
  const [activeRadar, setActiveRadar] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        if (v.status === "Standby") return v;
        const dx = (Math.random() - 0.5) * 0.2;
        const dy = (Math.random() - 0.5) * 0.2;
        return {
          ...v,
          x: Math.max(0, Math.min(9, v.x + dx)),
          y: Math.max(0, Math.min(9, v.y + dy)),
        };
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="tracker-root p-3 rounded-4 overflow-hidden position-relative" style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", height: "450px" }}>
      {/* Background Radar Grid */}
      <div className="tracker-grid">
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="grid-cell" />
        ))}
      </div>

      {/* Radar Scanning Line */}
      {activeRadar && <div className="radar-sweep" />}

      {/* Center Hospital Marker */}
      <div className="hospital-node">
        <i className="bi bi-hospital-fill" />
        <div className="node-pulse" />
      </div>

      {/* Ambulance Nodes */}
      {vehicles.map(v => (
        <motion.div
          key={v.id}
          className="ambulance-node"
          initial={false}
          animate={{ 
            left: `${(v.x / 10) * 100}%`,
            top: `${(v.y / 10) * 100}%` 
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          style={{ "--node-color": v.color }}
        >
          <div className="node-icon">
            <i className="bi bi-truck-front-fill" />
          </div>
          <div className="node-label">
            <span className="node-id">{v.id}</span>
            <span className="node-eta">{v.eta}</span>
          </div>
          <div className="node-trace" />
        </motion.div>
      ))}

      {/* HUD Info Overlay */}
      <div className="tracker-hud">
        <div className="hud-group">
          <div className="hud-label">Status</div>
          <div className="hud-value"><span className="status-dot-green" /> Telemetry Active</div>
        </div>
        <div className="hud-group">
          <div className="hud-label">Active Units</div>
          <div className="hud-value">{vehicles.length}</div>
        </div>
        <div className="hud-group">
          <div className="hud-label">Coordinate System</div>
          <div className="hud-value text-uppercase">Sector 7-G / Matrix</div>
        </div>
      </div>

      <style>{`
        .tracker-root {
          box-shadow: inset 0 0 50px rgba(0,0,0,0.5);
          user-select: none;
        }
        .tracker-grid {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          grid-template-rows: repeat(10, 1fr);
          opacity: 0.1;
        }
        .grid-cell {
          border: 1px solid #0ea5e9;
        }
        .radar-sweep {
          position: absolute;
          width: 200%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #0ea5e9, transparent);
          top: 0; left: -50%;
          animation: radarSweep 4s linear infinite;
          opacity: 0.3;
          z-index: 1;
        }
        @keyframes radarSweep {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .hospital-node {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          color: #fff;
          font-size: 1.5rem;
          z-index: 5;
          text-shadow: 0 0 10px #0ea5e9;
        }
        .node-pulse {
          position: absolute;
          top: 50%; left: 50%;
          width: 40px; height: 40px;
          background: rgba(14, 165, 233, 0.2);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: pulseMarker 2s infinite;
        }
        @keyframes pulseMarker {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        .ambulance-node {
          position: absolute;
          z-index: 4;
          cursor: pointer;
        }
        .node-icon {
          width: 28px; height: 28px;
          background: var(--node-color);
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 0.9rem;
          box-shadow: 0 0 15px var(--node-color);
          border: 2px solid rgba(255,255,255,0.4);
        }
        .node-label {
          position: absolute;
          left: 36px; top: 0;
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(4px);
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.1);
          white-space: nowrap;
          display: flex; flex-direction: column;
        }
        .node-id { font-size: 0.7rem; font-weight: 700; color: #fff; }
        .node-eta { font-size: 0.65rem; color: #94a3b8; }
        .node-trace {
          position: absolute;
          top: 14px; left: 14px;
          width: 4px; height: 4px;
          background: var(--node-color);
          border-radius: 50%;
          opacity: 0.5;
          box-shadow: 0 0 10px var(--node-color);
        }
        .tracker-hud {
          position: absolute;
          bottom: 15px; left: 15px; right: 15px;
          display: flex; gap: 20px;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          padding: 10px 15px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          z-index: 10;
        }
        .hud-group { display: flex; flex-direction: column; gap: 2px; }
        .hud-label { font-size: 0.6rem; text-transform: uppercase; color: #94a3b8; font-weight: 600; letter-spacing: 0.05em; }
        .hud-value { font-size: 0.75rem; color: #f1f5f9; font-weight: 600; display: flex; align-items: center; gap: 6px; }
        .status-dot-green { width: 6px; height: 6px; background: #10b981; border-radius: 50%; box-shadow: 0 0 5px #10b981; }
      `}</style>
    </div>
  );
}
