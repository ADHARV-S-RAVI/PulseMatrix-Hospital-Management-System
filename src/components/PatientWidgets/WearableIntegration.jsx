import { motion } from "motion/react";

export default function WearableIntegration() {
  return (
    <motion.div className="glass-panel p-4 hud-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h3 className="hud-card-title mb-3"><i className="bi bi-smartwatch me-2" />Wearable Devices</h3>
      <div className="d-flex align-items-center gap-3 p-2 rounded-2 mb-3" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
        <div className="rounded-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, background: "rgba(16,185,129,0.15)", color: "#10b981", fontSize: "1.1rem" }}>
          <i className="bi bi-smartwatch" />
        </div>
        <div className="flex-grow-1">
          <div className="fw-bold small text-white">Apple Watch Series 9</div>
          <div style={{ fontSize: "0.6rem", color: "#10b981" }}><i className="bi bi-link-45deg me-1" />Connected · Synced 2 min ago</div>
        </div>
        <span className="badge" style={{ background: "rgba(16,185,129,0.2)", color: "#10b981", fontSize: "0.55rem" }}>PAIRED</span>
      </div>
      <div className="d-flex flex-column gap-2">
        <div className="d-flex justify-content-between x-small"><span className="text-muted">Steps Today</span><span className="text-white fw-bold">342</span></div>
        <div className="d-flex justify-content-between x-small"><span className="text-muted">Resting Heart Rate</span><span className="text-info">72 BPM</span></div>
        <div className="d-flex justify-content-between x-small"><span className="text-muted">Sleep Duration</span><span className="text-white">6h 45m</span></div>
        <div className="d-flex justify-content-between x-small"><span className="text-muted">Blood Oxygen (Wearable)</span><span className="text-success fw-bold">97%</span></div>
        <div className="d-flex justify-content-between x-small"><span className="text-muted">Skin Temperature</span><span className="text-white">36.8°C</span></div>
        <div className="d-flex justify-content-between x-small"><span className="text-muted">Battery Level</span><span className="text-warning">58%</span></div>
      </div>
    </motion.div>
  );
}
