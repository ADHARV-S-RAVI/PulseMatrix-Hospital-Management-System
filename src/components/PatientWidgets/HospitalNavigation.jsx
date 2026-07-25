import { motion } from "motion/react";

export default function HospitalNavigation({ patient }) {
  const bed = patient?.assignedBed || "BED-12";
  return (
    <motion.div className="glass-panel p-4 hud-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h3 className="hud-card-title mb-3"><i className="bi bi-geo-alt me-2" />Hospital Navigation</h3>
      <div className="row g-2 mb-3">
        <div className="col-6">
          <div className="p-2 rounded-2 text-center" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.12)" }}>
            <div style={{ fontSize: "0.55rem", color: "#64748b" }}>Your Room</div>
            <div className="fw-bold small text-white">Room 312-B</div>
          </div>
        </div>
        <div className="col-6">
          <div className="p-2 rounded-2 text-center" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.12)" }}>
            <div style={{ fontSize: "0.55rem", color: "#64748b" }}>Bed</div>
            <div className="fw-bold small text-white">{bed}</div>
          </div>
        </div>
        <div className="col-6">
          <div className="p-2 rounded-2 text-center" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.12)" }}>
            <div style={{ fontSize: "0.55rem", color: "#64748b" }}>Ward</div>
            <div className="fw-bold small text-white">{patient?.department || "Cardiology"}</div>
          </div>
        </div>
        <div className="col-6">
          <div className="p-2 rounded-2 text-center" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.12)" }}>
            <div style={{ fontSize: "0.55rem", color: "#64748b" }}>Floor</div>
            <div className="fw-bold small text-white">3rd Floor</div>
          </div>
        </div>
      </div>

      {/* Simple floor map */}
      <div className="p-3 rounded-2" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="x-small fw-bold text-muted mb-2" style={{ letterSpacing: 1 }}>FLOOR 3 — CARDIOLOGY WING</div>
        <div className="d-flex gap-1 flex-wrap">
          {["301", "302", "303", "304", "305", "306", "307", "308", "309", "310", "311", "312"].map(room => (
            <div key={room} className="rounded-1 d-flex align-items-center justify-content-center" style={{ width: 38, height: 28, background: room === "312" ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.04)", border: `1px solid ${room === "312" ? "#0ea5e9" : "rgba(255,255,255,0.08)"}`, fontSize: "0.55rem", color: room === "312" ? "#0ea5e9" : "#64748b", fontWeight: room === "312" ? 700 : 400 }}>
              {room}
            </div>
          ))}
        </div>
        <div className="mt-2 d-flex gap-3" style={{ fontSize: "0.55rem" }}>
          <span><span className="d-inline-block rounded-1 me-1" style={{ width: 8, height: 8, background: "rgba(14,165,233,0.3)", border: "1px solid #0ea5e9" }} /> Your Room</span>
          <span><span className="d-inline-block rounded-1 me-1" style={{ width: 8, height: 8, background: "rgba(255,255,255,0.04)" }} /> Other Rooms</span>
        </div>
      </div>

      <div className="mt-3 d-flex flex-column gap-1">
        <div className="d-flex justify-content-between x-small"><span className="text-muted"><i className="bi bi-hospital me-1" />Nurse Station</span><span className="text-white">15m → Turn left</span></div>
        <div className="d-flex justify-content-between x-small"><span className="text-muted"><i className="bi bi-cup-hot me-1" />Cafeteria</span><span className="text-white">Floor 1 → Elevator</span></div>
        <div className="d-flex justify-content-between x-small"><span className="text-muted"><i className="bi bi-flower1 me-1" />Garden</span><span className="text-white">Floor 1 → East Wing</span></div>
      </div>
    </motion.div>
  );
}
