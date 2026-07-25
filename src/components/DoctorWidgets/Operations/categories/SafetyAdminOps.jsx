// SafetyAdminOps.jsx — Isolation Request, Incident/Adverse Event Reporting, Medical Certificate/Documents
import { useState } from "react";
import { motion } from "motion/react";
import { createOperation } from "../../../../services/api";
import PatientContextBar from "../PatientContextBar";

const inputCls = "form-control form-control-sm bg-dark text-white border-secondary";
const selectCls = "form-select form-select-sm bg-dark text-white border-secondary";
const labelCls = "form-label small text-muted mb-1";

function FormSuccess({ message, onClose }) {
  return (
    <div className="p-3 rounded-3 d-flex gap-3" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
      <i className="bi bi-check-circle-fill text-success fs-5" />
      <div className="flex-grow-1">
        <div className="text-success fw-bold small">Submitted</div>
        <div className="text-muted" style={{ fontSize: "0.8rem" }}>{message}</div>
      </div>
      <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={onClose}><i className="bi bi-x" /></button>
    </div>
  );
}

// ── Isolation Request ─────────────────────────────────────────────────────────
function IsolationForm({ patient, doctorId, onSuccess }) {
  const [form, setForm] = useState({ isolation_type: "Contact Precautions", reason: "", precautions: "", urgency: "Urgent" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reason.trim()) { setError("Reason required."); return; }
    setLoading(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "isolation",
        doctor_id: doctorId,
        priority: form.urgency,
        details: form
      });
      setSuccess(`Isolation request (${form.isolation_type}) submitted for ${patient.name}.`);
      setForm({ isolation_type: "Contact Precautions", reason: "", precautions: "", urgency: "Urgent" });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1"><i className="bi bi-shield-fill-exclamation text-warning" /><span className="text-white fw-bold">Isolation Request</span></div>
      <div className="row g-2">
        <div className="col-md-6">
          <label className={labelCls}>Isolation Type</label>
          <select className={selectCls} value={form.isolation_type} onChange={e => set("isolation_type", e.target.value)}>
            <option>Contact Precautions</option><option>Droplet Precautions</option><option>Airborne Precautions</option><option>Strict Isolation</option><option>Reverse Isolation</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Urgency</label>
          <select className={selectCls} value={form.urgency} onChange={e => set("urgency", e.target.value)}>
            <option>Normal</option><option>Urgent</option><option>Emergency</option>
          </select>
        </div>
        <div className="col-md-12">
          <label className={labelCls}>Suspected Reason / Diagnosis *</label>
          <input className={inputCls} placeholder="e.g. Suspected TB, MRSA, COVID-19..." value={form.reason} onChange={e => set("reason", e.target.value)} />
        </div>
        <div className="col-md-12">
          <label className={labelCls}>Additional Infection Precautions</label>
          <textarea className={inputCls} rows={2} placeholder="PPE requirements, visitor restrictions..." value={form.precautions} onChange={e => set("precautions", e.target.value)} />
        </div>
      </div>
      {error && <div className="text-danger small"><i className="bi bi-exclamation-circle me-1" />{error}</div>}
      <button className="btn btn-warning text-dark fw-bold" disabled={loading || !form.reason.trim()} type="submit" style={{ borderRadius: 8 }}>
        {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-shield-fill-exclamation me-2" />}
        Request Isolation Room
      </button>
    </form>
  );
}

// ── Incident / Adverse Event Reporting ────────────────────────────────────────
function IncidentForm({ patient, doctorId, onSuccess }) {
  const [form, setForm] = useState({ incident_type: "Patient Fall", description: "", severity: "Moderate", actions_taken: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) { setError("Description required."); return; }
    setLoading(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "incident",
        doctor_id: doctorId,
        priority: form.severity === "Critical" ? "Emergency" : form.severity === "Severe" ? "Urgent" : "Normal",
        details: { ...form, reported_at: new Date().toISOString() }
      });
      setSuccess(`Incident report (${form.incident_type}) filed for ${patient.name}.`);
      setForm({ incident_type: "Patient Fall", description: "", severity: "Moderate", actions_taken: "" });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed.");
    } finally { setLoading(false); }
  };

  const SEVERITY_COLORS = { Minor: "#10b981", Moderate: "#f59e0b", Severe: "#ef4444", Critical: "#f43f5e" };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1"><i className="bi bi-exclamation-octagon-fill text-danger" /><span className="text-white fw-bold">Incident / Adverse Event Report</span></div>
      <div className="row g-2">
        <div className="col-md-6">
          <label className={labelCls}>Incident Type</label>
          <select className={selectCls} value={form.incident_type} onChange={e => set("incident_type", e.target.value)}>
            <option>Patient Fall</option><option>Medication Reaction</option><option>Equipment Failure</option>
            <option>Treatment Complication</option><option>Safety Incident</option><option>Pressure Injury</option><option>Other</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Severity</label>
          <select className={selectCls} value={form.severity} onChange={e => set("severity", e.target.value)} style={{ color: SEVERITY_COLORS[form.severity] }}>
            <option>Minor</option><option>Moderate</option><option>Severe</option><option>Critical</option>
          </select>
        </div>
        <div className="col-md-12">
          <label className={labelCls}>Description *</label>
          <textarea className={inputCls} rows={3} placeholder="Describe the incident in detail..." value={form.description} onChange={e => set("description", e.target.value)} />
        </div>
        <div className="col-md-12">
          <label className={labelCls}>Actions Taken</label>
          <textarea className={inputCls} rows={2} placeholder="Immediate actions taken in response..." value={form.actions_taken} onChange={e => set("actions_taken", e.target.value)} />
        </div>
      </div>
      {error && <div className="text-danger small"><i className="bi bi-exclamation-circle me-1" />{error}</div>}
      <button className="btn btn-danger fw-bold" disabled={loading || !form.description.trim()} type="submit" style={{ borderRadius: 8 }}>
        {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-send me-2" />}
        File Incident Report
      </button>
    </form>
  );
}

// ── Medical Certificate / Documents ────────────────────────────────────────────
function MedicalDocsForm({ patient, doctorId, onSuccess }) {
  const [docType, setDocType] = useState("");
  const [preview, setPreview] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const doctypes = [
    "Medical Certificate", "Treatment Summary", "Fitness Certificate", "Referral Note", "Discharge Summary", "Lab Result Summary"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!docType) { setError("Document type required."); return; }
    setLoading(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "documents",
        doctor_id: doctorId,
        priority: "Normal",
        details: { document_type: docType, notes, patient_name: patient.name, patient_id: patient.patient_id, generated_at: new Date().toISOString() }
      });
      setSuccess(`${docType} request submitted for ${patient.name}.`);
      setDocType(""); setNotes(""); setPreview(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1"><i className="bi bi-file-medical-fill text-success" /><span className="text-white fw-bold">Medical Certificate / Documents</span></div>
      <div>
        <label className={labelCls}>Document Type *</label>
        <div className="d-flex flex-wrap gap-2">
          {doctypes.map(d => (
            <label key={d} className="d-flex align-items-center gap-1 px-3 py-1 rounded" style={{ background: docType === d ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${docType === d ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)"}`, cursor: "pointer" }}>
              <input type="radio" name="docType" value={d} checked={docType === d} onChange={e => setDocType(e.target.value)} className="form-check-input" />
              <span className="text-white" style={{ fontSize: "0.78rem" }}>{d}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Auto-populated patient info preview */}
      {docType && (
        <div className="p-3 rounded-3" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-success small fw-bold"><i className="bi bi-eye me-1" />{docType}</span>
            <span className="text-muted" style={{ fontSize: "0.7rem" }}>Auto-populated from patient record</span>
          </div>
          <div className="text-muted" style={{ fontSize: "0.75rem", lineHeight: 1.6 }}>
            <div><strong className="text-white">Patient:</strong> {patient.name}</div>
            <div><strong className="text-white">ID:</strong> {patient.patient_id}</div>
            <div><strong className="text-white">Age/Gender:</strong> {patient.age}y / {patient.gender}</div>
            <div><strong className="text-white">Department:</strong> {patient.department}</div>
            <div><strong className="text-white">Date:</strong> {new Date().toLocaleDateString()}</div>
          </div>
        </div>
      )}

      <div>
        <label className={labelCls}>Additional Notes</label>
        <textarea className={inputCls} rows={2} placeholder="Additional information to include in document..." value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
      {error && <div className="text-danger small"><i className="bi bi-exclamation-circle me-1" />{error}</div>}
      <button className="btn btn-success fw-bold" disabled={!docType || loading} type="submit" style={{ borderRadius: 8 }}>
        {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-file-earmark-plus me-2" />}
        Generate {docType || "Document"}
      </button>
    </form>
  );
}

// ── Main SafetyAdminOps component ─────────────────────────────────────────────
const SAFETY_OPS = [
  { id: "isolation", label: "Isolation Request", icon: "bi-shield-fill-exclamation", color: "#f59e0b" },
  { id: "incident", label: "Incident / Adverse Event", icon: "bi-exclamation-octagon-fill", color: "#ef4444" },
  { id: "documents", label: "Medical Certificate / Docs", icon: "bi-file-medical-fill", color: "#10b981" },
];

export default function SafetyAdminOps({ patient, doctorId, onOperationCreated }) {
  const [selected, setSelected] = useState(null);

  const renderForm = () => {
    const props = { patient, doctorId, onSuccess: onOperationCreated };
    switch (selected) {
      case "isolation": return <IsolationForm {...props} />;
      case "incident": return <IncidentForm {...props} />;
      case "documents": return <MedicalDocsForm {...props} />;
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 flex-wrap">
        {SAFETY_OPS.map(op => (
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
            <i className={`bi ${op.icon} me-2`} />{op.label}
          </button>
        ))}
      </div>
      {selected && (
        <div className="p-3 rounded-3" style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <PatientContextBar patient={patient} />
          {renderForm()}
        </div>
      )}
      {!selected && (
        <div className="text-center py-4 text-muted" style={{ fontSize: "0.82rem" }}>
          <i className="bi bi-shield-check mb-2" style={{ fontSize: "2rem", opacity: 0.4 }} />
          <div className="mt-2">Select a safety or administration operation above.</div>
        </div>
      )}
    </motion.div>
  );
}
