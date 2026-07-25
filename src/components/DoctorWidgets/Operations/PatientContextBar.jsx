// PatientContextBar.jsx — Always-visible patient identity strip inside operations
export default function PatientContextBar({ patient }) {
  if (!patient) return null;

  const getSeverityColor = (score) => {
    if (score >= 90) return "#f43f5e";
    if (score >= 70) return "#f59e0b";
    if (score >= 50) return "#0ea5e9";
    return "#10b981";
  };

  const color = getSeverityColor(patient.severity_score);

  return (
    <div style={{
      background: "rgba(10,15,28,0.7)",
      border: `1px solid ${color}40`,
      borderRadius: 10,
      padding: "10px 16px",
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 16,
      marginBottom: 16,
    }}>
      {/* Avatar */}
      <div style={{
        width: 38, height: 38, borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}30, ${color}15)`,
        border: `2px solid ${color}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color, fontWeight: 700, fontSize: "0.8rem", flexShrink: 0
      }}>
        {patient.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
      </div>

      {/* Name & ID */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>{patient.name}</div>
        <div style={{ color: "#94a3b8", fontSize: "0.7rem" }}>ID: {patient.patient_id} · {patient.gender} · {patient.age}y</div>
      </div>

      {/* Dept */}
      <div style={{ color: "#94a3b8", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4 }}>
        <i className="bi bi-hospital" style={{ color: "#0ea5e9" }} />
        {patient.department}
      </div>

      {/* Bed */}
      {patient.assigned_bed_type && (
        <div style={{ color: "#94a3b8", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4 }}>
          <i className="bi bi-hospital" style={{ color: "#818cf8" }} />
          {patient.assigned_bed_type}
        </div>
      )}

      {/* Severity Score */}
      <div style={{
        marginLeft: "auto",
        background: `${color}15`,
        border: `1px solid ${color}40`,
        borderRadius: 6,
        padding: "3px 10px",
        display: "flex", alignItems: "center", gap: 6, flexShrink: 0
      }}>
        <i className="bi bi-activity" style={{ color }} />
        <span style={{ color, fontWeight: 700, fontSize: "0.8rem" }}>Score: {patient.severity_score}</span>
      </div>

      {/* Critical indicator */}
      {patient.severity_score >= 90 && (
        <span style={{
          background: "rgba(244,63,94,0.15)",
          border: "1px solid rgba(244,63,94,0.5)",
          color: "#f43f5e",
          borderRadius: 4,
          padding: "2px 8px",
          fontSize: "0.6rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1px",
          animation: "blink 1.2s infinite"
        }}>
          CRITICAL
        </span>
      )}
    </div>
  );
}
