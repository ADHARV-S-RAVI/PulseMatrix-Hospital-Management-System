import { useState } from "react";
import { motion } from "motion/react";

const MOCK_APPOINTMENTS = [
  { id: 1, type: "Consultation", doctor: "Dr. Sarah Chen", dept: "Cardiology", date: "2026-06-19", time: "10:30 AM", status: "Confirmed", icon: "bi-chat-dots" },
  { id: 2, type: "CT Scan", doctor: "Radiology Team", dept: "Radiology", date: "2026-06-19", time: "02:00 PM", status: "Pending", icon: "bi-radioactive" },
  { id: 3, type: "Blood Work", doctor: "Lab Team", dept: "Pathology", date: "2026-06-20", time: "07:00 AM", status: "Scheduled", icon: "bi-droplet" },
  { id: 4, type: "Follow-up", doctor: "Dr. James Park", dept: "Neurology", date: "2026-06-22", time: "11:00 AM", status: "Confirmed", icon: "bi-person-check" },
  { id: 5, type: "Surgery Prep", doctor: "Dr. Anita Reddy", dept: "General Surgery", date: "2026-06-25", time: "06:00 AM", status: "Pending", icon: "bi-heart-pulse" },
];

const STATUS_COLORS = { Confirmed: "#10b981", Pending: "#f59e0b", Scheduled: "#0ea5e9", Completed: "#64748b" };

export default function AppointmentCenter() {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? MOCK_APPOINTMENTS : MOCK_APPOINTMENTS.filter(a => a.status === filter);

  return (
    <motion.div className="glass-panel p-4 hud-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="hud-card-title mb-0"><i className="bi bi-calendar-event me-2" />Appointment Center</h3>
        <div className="d-flex gap-1">
          {["All", "Confirmed", "Pending", "Scheduled"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className="badge border-0" style={{ background: filter === f ? "#0ea5e9" : "rgba(255,255,255,0.06)", color: filter === f ? "#fff" : "#94a3b8", cursor: "pointer", fontSize: "0.6rem", padding: "3px 8px" }}>{f}</button>
          ))}
        </div>
      </div>
      <div className="d-flex flex-column gap-2" style={{ maxHeight: 320, overflowY: "auto" }}>
        {filtered.map(apt => (
          <div key={apt.id} className="d-flex align-items-center gap-3 p-2 rounded-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.borderColor = STATUS_COLORS[apt.status]} onMouseOut={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}>
            <div className="rounded-2 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, background: `${STATUS_COLORS[apt.status]}15`, color: STATUS_COLORS[apt.status], fontSize: "1rem", flexShrink: 0 }}>
              <i className={`bi ${apt.icon}`} />
            </div>
            <div className="flex-grow-1 min-width-0">
              <div className="fw-bold small text-white">{apt.type}</div>
              <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{apt.doctor} · {apt.dept}</div>
            </div>
            <div className="text-end" style={{ flexShrink: 0 }}>
              <div style={{ fontSize: "0.65rem", color: "#cbd5e1" }}>{apt.date}</div>
              <div style={{ fontSize: "0.6rem", color: "#64748b" }}>{apt.time}</div>
            </div>
            <span className="badge" style={{ background: `${STATUS_COLORS[apt.status]}20`, color: STATUS_COLORS[apt.status], fontSize: "0.55rem", fontWeight: 700 }}>{apt.status}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
