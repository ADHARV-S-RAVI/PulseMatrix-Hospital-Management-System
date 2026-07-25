import { motion } from "motion/react";

const MILESTONES = [
  { name: "Admission Complete", progress: 100, date: "Jun 14", status: "done" },
  { name: "Initial Assessment", progress: 100, date: "Jun 14", status: "done" },
  { name: "Diagnostic Testing", progress: 100, date: "Jun 15", status: "done" },
  { name: "Treatment Plan Set", progress: 100, date: "Jun 16", status: "done" },
  { name: "Medication Response", progress: 72, date: "Jun 17", status: "active" },
  { name: "Physical Therapy Start", progress: 30, date: "Jun 18", status: "active" },
  { name: "Independent Mobility", progress: 0, date: "Pending", status: "pending" },
  { name: "Discharge Clearance", progress: 0, date: "Pending", status: "pending" },
];

const DAILY_GOALS = [
  { name: "Take all medications on time", done: true },
  { name: "Complete breathing exercises (3x)", done: true },
  { name: "Walk 200 meters with assistance", done: false },
  { name: "Eat full meal", done: false },
  { name: "Rest 8+ hours", done: true },
];

export default function RecoveryGoals() {
  const overallProgress = Math.round(MILESTONES.reduce((s, m) => s + m.progress, 0) / MILESTONES.length);
  const dailyDone = DAILY_GOALS.filter(g => g.done).length;

  return (
    <motion.div className="glass-panel p-4 hud-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h3 className="hud-card-title mb-3"><i className="bi bi-trophy me-2" />Recovery Goals</h3>

      {/* Overall Progress Ring */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div style={{ position: "relative", width: 70, height: 70 }}>
          <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeDasharray={`${overallProgress} ${100 - overallProgress}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1s" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#0ea5e9", fontSize: "0.9rem" }}>{overallProgress}%</div>
        </div>
        <div>
          <div className="fw-bold text-white small">Treatment Progress</div>
          <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{MILESTONES.filter(m => m.status === "done").length} of {MILESTONES.length} milestones completed</div>
        </div>
      </div>

      {/* Milestones */}
      <div className="mb-3">
        <div className="x-small fw-bold text-muted mb-2" style={{ letterSpacing: 1 }}>MILESTONES</div>
        <div className="d-flex flex-column gap-1" style={{ maxHeight: 200, overflowY: "auto" }}>
          {MILESTONES.map(m => (
            <div key={m.name} className="d-flex align-items-center gap-2 p-1">
              <i className={`bi ${m.status === "done" ? "bi-check-circle-fill text-success" : m.status === "active" ? "bi-circle-half text-info" : "bi-circle text-secondary"}`} style={{ fontSize: "0.8rem" }} />
              <div className="flex-grow-1">
                <div style={{ fontSize: "0.7rem", color: m.status === "pending" ? "#64748b" : "#e2e8f0" }}>{m.name}</div>
                <div className="progress" style={{ height: 2, background: "rgba(255,255,255,0.05)" }}>
                  <div className="progress-bar" style={{ width: `${m.progress}%`, background: m.status === "done" ? "#10b981" : "#0ea5e9" }} />
                </div>
              </div>
              <span style={{ fontSize: "0.55rem", color: "#64748b", flexShrink: 0 }}>{m.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Goals */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="x-small fw-bold text-muted" style={{ letterSpacing: 1 }}>TODAY'S GOALS</span>
          <span className="badge" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", fontSize: "0.55rem" }}>{dailyDone}/{DAILY_GOALS.length}</span>
        </div>
        {DAILY_GOALS.map(g => (
          <div key={g.name} className="d-flex align-items-center gap-2 py-1">
            <i className={`bi ${g.done ? "bi-check-square-fill text-success" : "bi-square"}`} style={{ fontSize: "0.8rem", color: g.done ? undefined : "#475569" }} />
            <span style={{ fontSize: "0.7rem", color: g.done ? "#94a3b8" : "#e2e8f0", textDecoration: g.done ? "line-through" : "none" }}>{g.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
