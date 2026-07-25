// OperationStatusBadge.jsx — Reusable status badge for all operation states
export default function OperationStatusBadge({ status, size = "sm" }) {
  const config = {
    Draft:        { bg: "rgba(100,116,139,0.15)", color: "#94a3b8", border: "#475569" },
    Submitted:    { bg: "rgba(14,165,233,0.15)",  color: "#0ea5e9", border: "#0ea5e9" },
    Acknowledged: { bg: "rgba(99,102,241,0.15)",  color: "#818cf8", border: "#6366f1" },
    Assigned:     { bg: "rgba(168,85,247,0.15)",  color: "#c084fc", border: "#a855f7" },
    "In Progress":{ bg: "rgba(245,158,11,0.15)",  color: "#fbbf24", border: "#f59e0b" },
    Completed:    { bg: "rgba(16,185,129,0.15)",  color: "#10b981", border: "#059669" },
    Rejected:     { bg: "rgba(244,63,94,0.15)",   color: "#f43f5e", border: "#e11d48" },
    Cancelled:    { bg: "rgba(100,116,139,0.15)", color: "#94a3b8", border: "#475569" },
    Failed:       { bg: "rgba(244,63,94,0.15)",   color: "#f43f5e", border: "#e11d48" },
  };
  const c = config[status] || config.Submitted;
  const fs = size === "xs" ? "0.55rem" : "0.65rem";
  return (
    <span style={{
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      borderRadius: 4,
      padding: size === "xs" ? "1px 6px" : "2px 8px",
      fontSize: fs,
      fontWeight: 700,
      letterSpacing: "0.5px",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}>
      {status}
    </span>
  );
}
