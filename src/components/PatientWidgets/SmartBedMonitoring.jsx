import { motion } from "motion/react";

export default function SmartBedMonitoring() {
  return (
    <motion.div className="glass-panel p-4 hud-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h3 className="hud-card-title mb-3"><i className="bi bi-tv me-2" />Smart Bed Monitoring</h3>
      <div className="row g-2 mb-3">
        <div className="col-6">
          <div className="p-2 rounded-2" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}>
            <div style={{ fontSize: "0.6rem", color: "#64748b" }}>Occupancy</div>
            <div className="fw-bold small" style={{ color: "#10b981" }}><i className="bi bi-check-circle-fill me-1" />Occupied</div>
          </div>
        </div>
        <div className="col-6">
          <div className="p-2 rounded-2" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.12)" }}>
            <div style={{ fontSize: "0.6rem", color: "#64748b" }}>Fall Risk</div>
            <div className="fw-bold small" style={{ color: "#f59e0b" }}><i className="bi bi-exclamation-triangle me-1" />Moderate</div>
          </div>
        </div>
      </div>
      <div className="d-flex flex-column gap-2">
        <div className="d-flex justify-content-between x-small"><span className="text-muted">Bed Incline</span><span className="text-white">35°</span></div>
        <div className="d-flex justify-content-between x-small"><span className="text-muted">Weight Distribution</span><span className="text-success" style={{ textShadow: "0 0 5px #10b981" }}>Optimal</span></div>
        <div className="d-flex justify-content-between x-small"><span className="text-muted">Movement Detection</span><span className="text-info">Minimal (Resting)</span></div>
        <div className="d-flex justify-content-between x-small"><span className="text-muted">Sleep Quality (Last Night)</span><span className="text-white fw-bold">7.2 / 10</span></div>
        <div className="d-flex justify-content-between x-small"><span className="text-muted">Nurse Call Status</span><span className="text-success"><i className="bi bi-circle-fill me-1" style={{ fontSize: "0.4rem" }} />Ready</span></div>
        <div className="d-flex justify-content-between x-small"><span className="text-muted">Pressure Relief Mode</span><span className="text-info">Active (Auto-rotate every 2h)</span></div>
      </div>
      <div className="mt-3 progress" style={{ height: 3, background: "rgba(255,255,255,0.05)" }}>
        <div className="progress-bar bg-success" style={{ width: "50%", margin: "0 auto" }} />
      </div>
    </motion.div>
  );
}
