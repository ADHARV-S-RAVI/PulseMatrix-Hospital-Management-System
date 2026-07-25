// NotificationCenter.jsx — Bell icon with dropdown notification panel for the Doctor Portal
import { useState, useEffect, useCallback } from "react";
import { getDoctorNotifications, markNotificationRead, markAllNotificationsRead } from "../../services/api";

const PRIORITY_CONFIG = {
  Critical: { color: "#f43f5e", bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.3)" },
  High: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  Normal: { color: "#0ea5e9", bg: "rgba(14,165,233,0.08)", border: "rgba(14,165,233,0.2)" },
};

const TYPE_ICONS = {
  emergency_code: "bi-lightning-fill",
  blood_request: "bi-droplet-fill",
  icu_team: "bi-hospital-fill",
  deterioration: "bi-graph-down-arrow",
  emergency_ot: "bi-scissors",
  default: "bi-bell-fill",
};

function formatRelativeTime(ts) {
  if (!ts) return "";
  try {
    const diff = (Date.now() - new Date(ts + "Z").getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(ts).toLocaleDateString();
  } catch { return ts; }
}

export default function NotificationCenter({ doctorId }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!doctorId) return;
    try {
      const data = await getDoctorNotifications(doctorId);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch {
      // Silently fail — notifications are non-critical
    }
  }, [doctorId]);

  // Initial load + 30s polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkRead = async (notifId) => {
    try {
      await markNotificationRead(notifId);
      setNotifications(ns => ns.map(n => n.notification_id === notifId ? { ...n, is_read: 1 } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch { }
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await markAllNotificationsRead(doctorId);
      setNotifications(ns => ns.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch { }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        onClick={() => setOpen(o => !o)}
        style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 8,
          width: 36, height: 36,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", position: "relative", flexShrink: 0
        }}
      >
        <i className="bi bi-bell-fill" style={{ color: unreadCount > 0 ? "#f43f5e" : "#94a3b8", fontSize: "0.9rem" }} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            background: "#f43f5e", color: "#fff",
            borderRadius: "50%", width: 16, height: 16,
            fontSize: "0.55rem", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1.5px solid rgba(10,15,28,1)"
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div style={{ position: "fixed", inset: 0, zIndex: 1040 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: "absolute", right: 0, top: 44, zIndex: 1041,
              width: 340,
              background: "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(10,15,28,0.98))",
              border: "1px solid rgba(14,165,233,0.3)",
              borderRadius: 12,
              boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-25">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-bell-fill text-primary" />
                <span className="text-white fw-bold" style={{ fontSize: "0.9rem" }}>Notifications</span>
                {unreadCount > 0 && (
                  <span className="badge" style={{ background: "rgba(244,63,94,0.2)", color: "#f43f5e", fontSize: "0.6rem" }}>
                    {unreadCount} unread
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button className="btn btn-sm" style={{ fontSize: "0.7rem", color: "#0ea5e9" }} onClick={handleMarkAllRead} disabled={loading}>
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification list */}
            <div style={{ maxHeight: 380, overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div className="text-center p-4 text-muted" style={{ fontSize: "0.82rem" }}>
                  <i className="bi bi-check-circle mb-2" style={{ fontSize: "1.5rem", opacity: 0.4 }} />
                  <div className="mt-2">No notifications yet.</div>
                </div>
              ) : (
                notifications.map(n => {
                  const p = PRIORITY_CONFIG[n.priority] || PRIORITY_CONFIG.Normal;
                  const icon = TYPE_ICONS[n.type] || TYPE_ICONS.default;
                  return (
                    <div
                      key={n.notification_id}
                      onClick={() => !n.is_read && handleMarkRead(n.notification_id)}
                      style={{
                        padding: "10px 14px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        background: n.is_read ? "transparent" : p.bg,
                        cursor: n.is_read ? "default" : "pointer",
                        transition: "background 0.15s"
                      }}
                    >
                      <div className="d-flex gap-2 align-items-start">
                        <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: p.bg, border: `1px solid ${p.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className={`bi ${icon}`} style={{ color: p.color, fontSize: "0.7rem" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="d-flex align-items-center justify-content-between">
                            <span style={{ color: n.is_read ? "#94a3b8" : "#fff", fontWeight: n.is_read ? 400 : 700, fontSize: "0.78rem" }}>{n.title}</span>
                            {!n.is_read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, flexShrink: 0 }} />}
                          </div>
                          <div style={{ color: "#64748b", fontSize: "0.72rem", lineHeight: 1.4, marginTop: 2 }}>{n.message}</div>
                          <div className="d-flex gap-2 mt-1" style={{ fontSize: "0.65rem", color: "#475569" }}>
                            {n.patient_name && <span><i className="bi bi-person me-1" />{n.patient_name}</span>}
                            <span><i className="bi bi-clock me-1" />{formatRelativeTime(n.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
