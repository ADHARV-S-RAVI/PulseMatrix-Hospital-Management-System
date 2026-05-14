import { motion } from "motion/react";
import { useState, useEffect } from "react";

const AMBULANCES = [
  { id: "AMB-01", status: "In Transit", eta: "4 mins", x: 20, y: 30, color: "#f43f5e" },
  { id: "AMB-02", status: "Responding", eta: "9 mins", x: 60, y: 70, color: "#f59e0b" },
  { id: "AMB-03", status: "Standby", eta: "0 mins", x: 80, y: 15, color: "#10b981" },
];

export default function AmbulanceTracker() {
  const [vehicles, setVehicles] = useState(AMBULANCES);

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => ({
        ...v,
        x: v.status === "Standby" ? v.x : v.x + (Math.random() - 0.5) * 2,
        y: v.status === "Standby" ? v.y : v.y + (Math.random() - 0.5) * 2,
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ambulance-tracker-container" style={{ position: "relative", height: "400px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
      {/* City Grid Background */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.1, background: "linear-gradient(rgba(14, 165, 233, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.2) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      
      {/* Scanning Radar Line */}
      <motion.div
        animate={{ top: ["-100%", "100%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", left: 0, right: 0, height: "100px", background: "linear-gradient(transparent, rgba(14, 165, 233, 0.1), transparent)", zIndex: 1 }}
      />

      {/* Hospital Node */}
      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 2 }}>
        <div className="hospital-node">
          <div className="pulse-ring" />
          <i className="bi bi-hospital-fill" style={{ color: "#0ea5e9", fontSize: "2rem" }} />
        </div>
      </div>

      {/* Ambulance Markers */}
      {vehicles.map(v => (
        <motion.div
          key={v.id}
          animate={{ left: `${v.x}%`, top: `${v.y}%` }}
          style={{ position: "absolute", zIndex: 3, cursor: "pointer" }}
        >
          <div style={{ position: "relative" }}>
            <div style={{ width: "12px", height: "12px", background: v.color, borderRadius: "50%", boxShadow: `0 0 15px ${v.color}` }} />
            <div style={{ position: "absolute", top: "15px", left: "15px", background: "rgba(0,0,0,0.8)", padding: "4px 8px", borderRadius: "4px", fontSize: "0.6rem", whiteSpace: "nowrap", border: `1px solid ${v.color}44` }}>
              <div style={{ fontWeight: "bold", color: v.color }}>{v.id}</div>
              <div style={{ color: "#94a3b8" }}>ETA: {v.eta}</div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* HUD Info Bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.4)", padding: "10px 20px", backdropFilter: "blur(10px)", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", zIndex: 4 }}>
        <div style={{ fontSize: "0.75rem", color: "#e2e8f0" }}>
          <i className="bi bi-geo-alt-fill me-2 text-info" />
          Live Route Optimization Active
        </div>
        <div style={{ display: "flex", gap: "15px" }}>
          <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}><span style={{ color: "#10b981" }}>●</span> 3 Ready</span>
          <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}><span style={{ color: "#f43f5e" }}>●</span> 2 Active</span>
        </div>
      </div>

      <style>{`
        .hospital-node {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pulse-ring {
          position: absolute;
          width: 60px;
          height: 60px;
          border: 2px solid #0ea5e9;
          border-radius: 50%;
          animation: map-pulse 2s infinite;
        }
        @keyframes map-pulse {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
