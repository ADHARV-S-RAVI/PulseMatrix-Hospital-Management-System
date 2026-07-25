import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const MOCK_NOTIFICATIONS = [
  { id: 1, type: "medication", title: "Medication Due", body: "Paracetamol 500mg PO due at 12:30 PM", time: "10 min ago", read: false, icon: "bi-capsule", color: "#0ea5e9" },
  { id: 2, type: "doctor", title: "Doctor Update", body: "Dr. Chen reviewed your latest lab results", time: "25 min ago", read: false, icon: "bi-person-badge", color: "#10b981" },
  { id: 3, type: "report", title: "Report Available", body: "Complete Blood Count results are ready", time: "1 hr ago", read: true, icon: "bi-clipboard2-pulse", color: "#f59e0b" },
  { id: 4, type: "appointment", title: "Upcoming Appointment", body: "CT Scan scheduled for tomorrow at 2:00 PM", time: "2 hrs ago", read: true, icon: "bi-calendar-event", color: "#8b5cf6" },
  { id: 5, type: "emergency", title: "Emergency Protocol", body: "Floor 3 evacuation drill completed", time: "3 hrs ago", read: true, icon: "bi-exclamation-triangle", color: "#f43f5e" },
];

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState("all");
  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = filter === "all" ? notifications : notifications.filter(n => n.type === filter);

  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <motion.div className="glass-panel p-4 hud-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="hud-card-title mb-0">
          <i className="bi bi-bell me-2" />Notifications
          {unreadCount > 0 && <span className="badge ms-2 rounded-pill" style={{ background: "#f43f5e", fontSize: "0.55rem", verticalAlign: "middle" }}>{unreadCount}</span>}
        </h3>
        {unreadCount > 0 && <button onClick={markAllRead} className="btn btn-sm p-0 border-0" style={{ color: "#0ea5e9", fontSize: "0.65rem" }}>Mark all read</button>}
      </div>

      <div className="d-flex gap-1 mb-3 flex-wrap">
        {["all", "medication", "doctor", "report", "appointment", "emergency"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className="badge border-0" style={{ background: filter === f ? "#0ea5e9" : "rgba(255,255,255,0.05)", color: filter === f ? "#fff" : "#94a3b8", cursor: "pointer", fontSize: "0.55rem", padding: "3px 7px", textTransform: "capitalize" }}>{f}</button>
        ))}
      </div>

      <div className="d-flex flex-column gap-1" style={{ maxHeight: 280, overflowY: "auto" }}>
        <AnimatePresence>
          {filtered.map(n => (
            <motion.div key={n.id} layout exit={{ opacity: 0, x: -50 }} onClick={() => markRead(n.id)} className="d-flex align-items-start gap-2 p-2 rounded-2" style={{ background: n.read ? "transparent" : `${n.color}08`, border: `1px solid ${n.read ? "rgba(255,255,255,0.04)" : `${n.color}20`}`, cursor: "pointer", transition: "all 0.2s" }}>
              <div className="rounded-2 d-flex align-items-center justify-content-center mt-1" style={{ width: 28, height: 28, background: `${n.color}15`, color: n.color, fontSize: "0.8rem", flexShrink: 0 }}>
                <i className={`bi ${n.icon}`} />
              </div>
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between">
                  <span className="fw-bold" style={{ fontSize: "0.7rem", color: n.read ? "#94a3b8" : "#e2e8f0" }}>{n.title}</span>
                  <span style={{ fontSize: "0.55rem", color: "#64748b" }}>{n.time}</span>
                </div>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", lineHeight: 1.4 }}>{n.body}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); dismiss(n.id); }} className="btn btn-sm p-0 border-0 mt-1" style={{ color: "#475569", fontSize: "0.7rem" }}><i className="bi bi-x" /></button>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && <div className="text-center p-3" style={{ fontSize: "0.7rem", color: "#64748b" }}>No notifications</div>}
      </div>
    </motion.div>
  );
}
