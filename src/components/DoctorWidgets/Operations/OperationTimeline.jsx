// OperationTimeline.jsx — Patient's operations activity feed
import { useState, useEffect } from "react";
import { getPatientOperations } from "../../../services/api";
import OperationStatusBadge from "./OperationStatusBadge";

const TYPE_ICONS = {
  emergency_code: { icon: "bi-lightning-fill", color: "#f43f5e" },
  blood_request: { icon: "bi-droplet-fill", color: "#ef4444" },
  specialist_consult: { icon: "bi-person-badge-fill", color: "#8b5cf6" },
  ventilator: { icon: "bi-lungs-fill", color: "#0ea5e9" },
  emergency_ot: { icon: "bi-scissors", color: "#f43f5e" },
  nurse_assistance: { icon: "bi-heart-pulse-fill", color: "#ec4899" },
  infusion: { icon: "bi-droplet-half", color: "#06b6d4" },
  lab_escalation: { icon: "bi-flask-fill", color: "#f59e0b" },
  imaging_priority: { icon: "bi-camera-fill", color: "#6366f1" },
  deterioration: { icon: "bi-graph-down-arrow", color: "#f43f5e" },
  icu_team: { icon: "bi-hospital-fill", color: "#ef4444" },
  transport: { icon: "bi-ambulance", color: "#0ea5e9" },
  patient_movement: { icon: "bi-person-walking", color: "#10b981" },
  oxygen: { icon: "bi-wind", color: "#38bdf8" },
  equipment: { icon: "bi-cpu-fill", color: "#94a3b8" },
  isolation: { icon: "bi-shield-fill-exclamation", color: "#f59e0b" },
  documents: { icon: "bi-file-medical-fill", color: "#10b981" },
  referral: { icon: "bi-arrow-left-right", color: "#8b5cf6" },
  incident: { icon: "bi-exclamation-octagon-fill", color: "#ef4444" },
  handover: { icon: "bi-arrow-clockwise", color: "#0ea5e9" },
  discharge: { icon: "bi-door-open-fill", color: "#10b981" },
  surgery: { icon: "bi-bandaid-fill", color: "#f43f5e" },
  bed_transfer: { icon: "bi-hospital", color: "#0ea5e9" },
  critical_resources: { icon: "bi-box-seam-fill", color: "#f59e0b" },
};

const TYPE_LABELS = {
  emergency_code: "Emergency Code", blood_request: "Blood Request",
  specialist_consult: "Specialist Consultation", ventilator: "Ventilator Request",
  emergency_ot: "Emergency OT", nurse_assistance: "Nurse Assistance",
  infusion: "IV/Infusion", lab_escalation: "Lab Escalation",
  imaging_priority: "Imaging Priority", deterioration: "Deterioration Escalation",
  icu_team: "ICU Team Activation", transport: "Transport Request",
  patient_movement: "Patient Movement", oxygen: "Oxygen Support",
  equipment: "Equipment Request", isolation: "Isolation Request",
  documents: "Medical Documents", referral: "Referral/Transfer",
  incident: "Incident Report", handover: "Shift Handover",
  discharge: "Discharge Workflow", surgery: "Surgery Scheduling",
  bed_transfer: "Bed/ICU Transfer", critical_resources: "Critical Resources",
};

function formatTime(ts) {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch { return ts; }
}

export default function OperationTimeline({ patient, refreshSignal }) {
  const [ops, setOps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patient) return;
    setLoading(true);
    setError(null);
    getPatientOperations(patient.patient_id)
      .then(data => setOps(data || []))
      .catch(() => setError("Failed to load operation history."))
      .finally(() => setLoading(false));
  }, [patient, refreshSignal]);

  if (!patient) return null;

  return (
    <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", padding: 16 }}>
      <h6 className="text-white mb-3 d-flex align-items-center gap-2" style={{ fontSize: "0.85rem" }}>
        <i className="bi bi-clock-history text-info" />
        Operations Activity Timeline
        {loading && <span className="spinner-border spinner-border-sm text-info ms-2" style={{ width: 12, height: 12 }} />}
      </h6>

      {error && (
        <div className="text-danger small p-2 rounded" style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}>
          <i className="bi bi-exclamation-circle me-1" />{error}
        </div>
      )}

      {!loading && !error && ops.length === 0 && (
        <div className="text-center py-3 text-muted" style={{ fontSize: "0.8rem" }}>
          <i className="bi bi-inbox" style={{ fontSize: "1.5rem", opacity: 0.4 }} />
          <div className="mt-2">No operations recorded for this patient yet.</div>
        </div>
      )}

      <div style={{ position: "relative" }}>
        {/* Vertical timeline line */}
        {ops.length > 0 && (
          <div style={{ position: "absolute", left: 17, top: 0, bottom: 0, width: 1, background: "rgba(14,165,233,0.2)" }} />
        )}

        <div className="d-flex flex-column gap-3">
          {ops.map((op, idx) => {
            const typeInfo = TYPE_ICONS[op.operation_type] || { icon: "bi-gear-fill", color: "#94a3b8" };
            const label = TYPE_LABELS[op.operation_type] || op.operation_type?.replace(/_/g, " ");
            return (
              <div key={op.operation_id} className="d-flex gap-3 align-items-start" style={{ position: "relative" }}>
                {/* Icon node */}
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", flexShrink: 0, zIndex: 1,
                  background: `${typeInfo.color}15`, border: `1px solid ${typeInfo.color}50`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className={`bi ${typeInfo.icon}`} style={{ color: typeInfo.color, fontSize: "0.8rem" }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="text-white fw-bold" style={{ fontSize: "0.82rem" }}>{label}</span>
                    <OperationStatusBadge status={op.status} size="xs" />
                  </div>
                  <div className="d-flex gap-3 text-muted mt-1 flex-wrap" style={{ fontSize: "0.7rem" }}>
                    <span><i className="bi bi-clock me-1" />{formatTime(op.created_at)}</span>
                    {op.doctor_name && <span><i className="bi bi-person me-1" />{op.doctor_name}</span>}
                    {op.priority && op.priority !== "Normal" && (
                      <span style={{ color: op.priority === "Emergency" ? "#f43f5e" : "#f59e0b" }}>
                        <i className="bi bi-flag-fill me-1" />{op.priority}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
