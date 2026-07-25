// EmergencyOps.jsx — Emergency Code, Deterioration Escalation, ICU Team Activation, Emergency OT
import { useState } from "react";
import { motion } from "motion/react";
import { createOperation } from "../../../../services/api";
import PatientContextBar from "../PatientContextBar";
import ConfirmModal from "../ConfirmModal";

const inputCls = "form-control form-control-sm bg-dark text-white border-secondary";
const selectCls = "form-select form-select-sm bg-dark text-white border-secondary";
const labelCls = "form-label small text-muted mb-1";

function FormSuccess({ message, onClose }) {
  return (
    <div className="p-3 rounded-3 d-flex align-items-start gap-3" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
      <i className="bi bi-check-circle-fill text-success fs-5 mt-1" />
      <div className="flex-grow-1">
        <div className="text-success fw-bold small">Request Submitted</div>
        <div className="text-muted" style={{ fontSize: "0.8rem" }}>{message}</div>
      </div>
      <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={onClose}><i className="bi bi-x" /></button>
    </div>
  );
}

function FormError({ error }) {
  if (!error) return null;
  return (
    <div className="p-2 rounded" style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", fontSize: "0.8rem", color: "#f43f5e" }}>
      <i className="bi bi-exclamation-circle me-1" />{error}
    </div>
  );
}

// ── Emergency Code ─────────────────────────────────────────────────────────────
function EmergencyCodeForm({ patient, doctorId, onSuccess }) {
  const [codeType, setCodeType] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const codeTypes = [
    { value: "code_blue", label: "Code Blue — Cardiac/Respiratory Arrest", color: "#0ea5e9" },
    { value: "rapid_response", label: "Rapid Response Team", color: "#f59e0b" },
    { value: "cardiac_emergency", label: "Cardiac Emergency", color: "#f43f5e" },
    { value: "trauma_alert", label: "Trauma Alert", color: "#ef4444" },
  ];

  const selected = codeTypes.find(c => c.value === codeType);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "emergency_code",
        doctor_id: doctorId,
        priority: "Emergency",
        details: { code_type: codeType, code_label: selected?.label, notes, activation_time: new Date().toISOString() }
      });
      setSuccess(`${selected?.label || "Emergency code"} activated for ${patient.name}. Emergency response team has been notified.`);
      setCodeType(""); setNotes("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to activate emergency code.");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1">
        <i className="bi bi-lightning-fill text-danger" style={{ fontSize: "1.1rem" }} />
        <span className="text-white fw-bold">Emergency Code Activation</span>
        <span className="badge bg-danger ms-auto" style={{ fontSize: "0.6rem" }}>HIGH RISK</span>
      </div>
      <div>
        <label className={labelCls}>Code Type *</label>
        <div className="d-flex flex-column gap-2">
          {codeTypes.map(c => (
            <label key={c.value} className="d-flex align-items-center gap-2 p-2 rounded-3 cursor-pointer" style={{ background: codeType === c.value ? `${c.color}15` : "rgba(255,255,255,0.03)", border: `1px solid ${codeType === c.value ? c.color + "50" : "rgba(255,255,255,0.06)"}`, cursor: "pointer" }}>
              <input type="radio" name="codeType" value={c.value} checked={codeType === c.value} onChange={e => setCodeType(e.target.value)} className="form-check-input" />
              <span className="text-white" style={{ fontSize: "0.82rem" }}>{c.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className={labelCls}>Additional Notes</label>
        <textarea className={inputCls} rows={2} placeholder="Additional context for the response team..." value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
      <FormError error={error} />
      <button
        className="btn btn-danger fw-bold"
        disabled={!codeType || loading}
        onClick={() => setConfirmOpen(true)}
        style={{ borderRadius: 8 }}
      >
        <i className="bi bi-lightning-fill me-2" />Activate Emergency Code
      </button>
      <ConfirmModal
        open={confirmOpen}
        title="CONFIRM EMERGENCY ACTIVATION"
        patient={patient}
        action={selected?.label || "Emergency Code"}
        description="This immediately alerts the emergency response workflow. Use only when clinically required."
        confirmLabel="Confirm Activation"
        confirmVariant="danger"
        loading={loading}
        onConfirm={handleSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

// ── Deterioration Escalation ───────────────────────────────────────────────────
function DeteriorationForm({ patient, doctorId, onSuccess }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async () => {
    if (!reason.trim()) { setError("Reason for escalation is required."); return; }
    setLoading(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "deterioration",
        doctor_id: doctorId,
        priority: "Emergency",
        details: { reason, severity_score: patient.severity_score, escalated_at: new Date().toISOString() }
      });
      setSuccess(`Deterioration escalation submitted for ${patient.name}. Critical care team notified.`);
      setReason("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to submit escalation.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1">
        <i className="bi bi-graph-down-arrow text-danger" />
        <span className="text-white fw-bold">Patient Deterioration Escalation</span>
      </div>
      <div className="p-3 rounded-3" style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)" }}>
        <div className="small text-muted mb-1">Current Severity Score</div>
        <div className="fw-bold" style={{ color: patient.severity_score >= 70 ? "#f43f5e" : "#f59e0b", fontSize: "1.5rem" }}>
          {patient.severity_score}<span className="text-muted fs-6">/100</span>
        </div>
      </div>
      <div>
        <label className={labelCls}>Reason for Escalation *</label>
        <textarea className={inputCls} rows={3} placeholder="Describe clinical signs of deterioration..." value={reason} onChange={e => setReason(e.target.value)} />
      </div>
      <FormError error={error} />
      <button className="btn btn-warning text-dark fw-bold" disabled={loading || !reason.trim()} onClick={handleSubmit} style={{ borderRadius: 8 }}>
        {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-send-fill me-2" />}
        Escalate to Critical Care
      </button>
    </div>
  );
}

// ── ICU Team Activation ───────────────────────────────────────────────────────
function ICUTeamForm({ patient, doctorId, onSuccess }) {
  const [reason, setReason] = useState("");
  const [urgency, setUrgency] = useState("Urgent");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "icu_team",
        doctor_id: doctorId,
        priority: urgency,
        details: { reason, urgency }
      });
      setSuccess(`ICU Team activation request submitted for ${patient.name}. Team will be notified immediately.`);
      setReason(""); setConfirmOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to activate ICU team.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1">
        <i className="bi bi-hospital-fill text-danger" />
        <span className="text-white fw-bold">ICU Team Activation</span>
      </div>
      <div>
        <label className={labelCls}>Urgency Level</label>
        <select className={selectCls} value={urgency} onChange={e => setUrgency(e.target.value)}>
          <option value="Urgent">Urgent</option>
          <option value="Emergency">Emergency (Immediate)</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Clinical Reason *</label>
        <textarea className={inputCls} rows={3} placeholder="Reason for ICU team review..." value={reason} onChange={e => setReason(e.target.value)} />
      </div>
      <FormError error={error} />
      <button className="btn btn-danger fw-bold" disabled={loading || !reason.trim()} onClick={() => setConfirmOpen(true)} style={{ borderRadius: 8 }}>
        <i className="bi bi-hospital-fill me-2" />Request ICU Team
      </button>
      <ConfirmModal
        open={confirmOpen}
        title="Activate ICU Team"
        patient={patient}
        action="ICU/Critical Care Team Activation"
        description="This will immediately request the ICU team to review this patient. Confirm only if clinically required."
        confirmLabel="Activate Team"
        confirmVariant="danger"
        loading={loading}
        onConfirm={handleSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

// ── Emergency OT ──────────────────────────────────────────────────────────────
function EmergencyOTForm({ patient, doctorId, onSuccess }) {
  const [form, setForm] = useState({ procedure: "", urgency: "Emergency", surgeon: "", anesthesia: "General", duration: "", equipment: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "emergency_ot",
        doctor_id: doctorId,
        priority: form.urgency,
        details: form
      });
      setSuccess(`Emergency OT request submitted for ${patient.name}. OR scheduling team notified.`);
      setForm({ procedure: "", urgency: "Emergency", surgeon: "", anesthesia: "General", duration: "", equipment: "" });
      setConfirmOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to submit OT request.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1">
        <i className="bi bi-scissors text-danger" />
        <span className="text-white fw-bold">Emergency Operating Theatre Request</span>
      </div>
      <div className="row g-2">
        <div className="col-md-6">
          <label className={labelCls}>Procedure *</label>
          <input className={inputCls} placeholder="e.g. Emergency Laparotomy" value={form.procedure} onChange={e => set("procedure", e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Urgency</label>
          <select className={selectCls} value={form.urgency} onChange={e => set("urgency", e.target.value)}>
            <option>Emergency</option><option>Urgent</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Surgeon Required</label>
          <input className={inputCls} placeholder="Surgeon name or specialty" value={form.surgeon} onChange={e => set("surgeon", e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Anesthesia</label>
          <select className={selectCls} value={form.anesthesia} onChange={e => set("anesthesia", e.target.value)}>
            <option>General</option><option>Regional</option><option>Local</option><option>Spinal</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Est. Duration (mins)</label>
          <input className={inputCls} type="number" placeholder="e.g. 90" value={form.duration} onChange={e => set("duration", e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Required Equipment</label>
          <input className={inputCls} placeholder="e.g. Laparoscopy set" value={form.equipment} onChange={e => set("equipment", e.target.value)} />
        </div>
      </div>
      <FormError error={error} />
      <button className="btn btn-danger fw-bold" disabled={loading || !form.procedure} onClick={() => setConfirmOpen(true)} style={{ borderRadius: 8 }}>
        <i className="bi bi-scissors me-2" />Request Emergency OT
      </button>
      <ConfirmModal
        open={confirmOpen}
        title="Confirm Emergency OT Request"
        patient={patient}
        action={`Emergency OT: ${form.procedure}`}
        description="This will notify the OR scheduling team for an emergency operating theatre slot."
        confirmLabel="Confirm OT Request"
        confirmVariant="danger"
        loading={loading}
        onConfirm={handleSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

// ── Main EmergencyOps component ────────────────────────────────────────────────
const EMERGENCY_OPS = [
  { id: "emergency_code", label: "Emergency Code", icon: "bi-lightning-fill", color: "#f43f5e" },
  { id: "deterioration", label: "Deterioration Escalation", icon: "bi-graph-down-arrow", color: "#f59e0b" },
  { id: "icu_team", label: "ICU Team Activation", icon: "bi-hospital-fill", color: "#ef4444" },
  { id: "emergency_ot", label: "Emergency OT", icon: "bi-scissors", color: "#dc2626" },
];

export default function EmergencyOps({ patient, doctorId, onOperationCreated }) {
  const [selected, setSelected] = useState(null);

  const renderForm = () => {
    const props = { patient, doctorId, onSuccess: onOperationCreated };
    switch (selected) {
      case "emergency_code": return <EmergencyCodeForm {...props} />;
      case "deterioration": return <DeteriorationForm {...props} />;
      case "icu_team": return <ICUTeamForm {...props} />;
      case "emergency_ot": return <EmergencyOTForm {...props} />;
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="d-flex flex-column gap-3">
      {/* Category nav */}
      <div className="d-flex gap-2 flex-wrap">
        {EMERGENCY_OPS.map(op => (
          <button
            key={op.id}
            onClick={() => setSelected(selected === op.id ? null : op.id)}
            style={{
              background: selected === op.id ? `${op.color}20` : "rgba(255,255,255,0.04)",
              border: `1px solid ${selected === op.id ? op.color + "60" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 8, padding: "6px 14px", color: selected === op.id ? op.color : "#94a3b8",
              fontSize: "0.78rem", fontWeight: selected === op.id ? 700 : 400, cursor: "pointer", transition: "all 0.15s"
            }}
          >
            <i className={`bi ${op.icon} me-2`} />
            {op.label}
          </button>
        ))}
      </div>

      {/* Form area */}
      {selected && (
        <div className="p-3 rounded-3" style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(244,63,94,0.2)" }}>
          <PatientContextBar patient={patient} />
          {renderForm()}
        </div>
      )}

      {!selected && (
        <div className="text-center py-4 text-muted" style={{ fontSize: "0.82rem" }}>
          <i className="bi bi-lightning text-danger mb-2" style={{ fontSize: "2rem" }} />
          <div className="mt-2">Select an emergency operation above.</div>
          <div className="text-danger mt-1" style={{ fontSize: "0.75rem" }}>Emergency operations require confirmation before activation.</div>
        </div>
      )}
    </motion.div>
  );
}
