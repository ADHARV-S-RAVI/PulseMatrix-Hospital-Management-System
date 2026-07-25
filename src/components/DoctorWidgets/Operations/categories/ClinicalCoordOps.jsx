// ClinicalCoordOps.jsx — Surgery Scheduling, Specialist Consultation, Nurse Assistance, IV/Infusion, Lab Escalation, Imaging Priority
import { useState } from "react";
import { motion } from "motion/react";
import { createOperation, scheduleSurgery } from "../../../../services/api";
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

// ── Surgery Scheduling (existing feature, preserved + API-connected) ───────────
function SurgeryForm({ patient, doctorId, onSuccess }) {
  const [procedure, setProcedure] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!procedure || !date) { setError("Procedure and date required."); return; }
    setLoading(true); setError(null);
    try {
      await scheduleSurgery({ patient_id: patient.patient_id, doctor_id: doctorId, surgery_type: procedure, scheduled_date: date, notes });
      // Also log as operation for timeline
      await createOperation(patient.patient_id, {
        operation_type: "surgery",
        doctor_id: doctorId,
        priority: "Urgent",
        details: { procedure, date, notes }
      });
      setSuccess(`Surgery "${procedure}" scheduled for ${patient.name} on ${new Date(date).toLocaleString()}.`);
      setProcedure(""); setDate(""); setNotes("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to schedule surgery.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1"><i className="bi bi-bandaid-fill text-danger" /><span className="text-white fw-bold">Surgery Scheduling</span></div>
      <div>
        <label className={labelCls}>Procedure *</label>
        <input className={inputCls} placeholder="e.g. CABG, Appendectomy" value={procedure} onChange={e => setProcedure(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Scheduled Date & Time *</label>
        <input className={inputCls} type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Notes</label>
        <textarea className={inputCls} rows={2} placeholder="Pre-op requirements, special considerations..." value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
      {error && <div className="text-danger small"><i className="bi bi-exclamation-circle me-1" />{error}</div>}
      <button className="btn btn-danger fw-bold" disabled={loading || !procedure || !date} type="submit" style={{ borderRadius: 8 }}>
        {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-calendar-plus me-2" />}
        Book OR
      </button>
    </form>
  );
}

// ── Specialist Consultation ────────────────────────────────────────────────────
function SpecialistConsultForm({ patient, doctorId, onSuccess }) {
  const [form, setForm] = useState({ department: "", consultation_type: "Routine", reason: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.department || !form.reason.trim()) { setError("Department and reason required."); return; }
    setLoading(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "specialist_consult",
        doctor_id: doctorId,
        priority: form.consultation_type === "Emergency" ? "Emergency" : form.consultation_type === "Urgent" ? "Urgent" : "Normal",
        details: form
      });
      setSuccess(`${form.department} consultation (${form.consultation_type}) requested for ${patient.name}.`);
      setForm({ department: "", consultation_type: "Routine", reason: "" });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to request consultation.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1"><i className="bi bi-person-badge-fill text-purple" style={{ color: "#8b5cf6" }} /><span className="text-white fw-bold">Specialist Consultation</span></div>
      <div className="row g-2">
        <div className="col-md-6">
          <label className={labelCls}>Department *</label>
          <select className={selectCls} value={form.department} onChange={e => set("department", e.target.value)}>
            <option value="">Select department...</option>
            <option>Cardiology</option><option>Neurology</option><option>Orthopedics</option><option>General Surgery</option>
            <option>Pulmonology</option><option>Nephrology</option><option>Anesthesiology</option><option>Oncology</option>
            <option>Gastroenterology</option><option>Psychiatry</option><option>Dermatology</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Consultation Type</label>
          <select className={selectCls} value={form.consultation_type} onChange={e => set("consultation_type", e.target.value)}>
            <option>Routine</option><option>Urgent</option><option>Emergency</option>
          </select>
        </div>
        <div className="col-md-12">
          <label className={labelCls}>Reason for Consultation *</label>
          <textarea className={inputCls} rows={3} placeholder="Clinical question or reason for specialist review..." value={form.reason} onChange={e => set("reason", e.target.value)} />
        </div>
      </div>
      {error && <div className="text-danger small"><i className="bi bi-exclamation-circle me-1" />{error}</div>}
      <button className="btn fw-bold" disabled={loading || !form.department || !form.reason.trim()} type="submit" style={{ borderRadius: 8, background: "#7c3aed", color: "#fff" }}>
        {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-send me-2" />}
        Request Consultation
      </button>
    </form>
  );
}

// ── Nurse Assistance ───────────────────────────────────────────────────────────
function NurseAssistanceForm({ patient, doctorId, onSuccess }) {
  const [form, setForm] = useState({ nurse_type: "General", urgency: "Normal", reason: "" });
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
        operation_type: "nurse_assistance",
        doctor_id: doctorId,
        priority: form.urgency,
        details: form
      });
      setSuccess(`${form.nurse_type} nurse assistance requested for ${patient.name}.`);
      setForm({ nurse_type: "General", urgency: "Normal", reason: "" });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1"><i className="bi bi-heart-pulse-fill text-pink" style={{ color: "#ec4899" }} /><span className="text-white fw-bold">Nurse Assistance Request</span></div>
      <div className="row g-2">
        <div className="col-md-6">
          <label className={labelCls}>Nurse Type</label>
          <select className={selectCls} value={form.nurse_type} onChange={e => set("nurse_type", e.target.value)}>
            <option>General</option><option>ICU Nurse</option><option>Emergency Nurse</option><option>Procedure Assistance</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Urgency</label>
          <select className={selectCls} value={form.urgency} onChange={e => set("urgency", e.target.value)}>
            <option>Normal</option><option>Urgent</option><option>Emergency</option>
          </select>
        </div>
        <div className="col-md-12">
          <label className={labelCls}>Reason *</label>
          <textarea className={inputCls} rows={2} placeholder="Describe the assistance needed..." value={form.reason} onChange={e => set("reason", e.target.value)} />
        </div>
      </div>
      {error && <div className="text-danger small"><i className="bi bi-exclamation-circle me-1" />{error}</div>}
      <button className="btn fw-bold" disabled={loading || !form.reason.trim()} type="submit" style={{ borderRadius: 8, background: "rgba(236,72,153,0.8)", color: "#fff" }}>
        {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-send me-2" />}
        Request Nurse
      </button>
    </form>
  );
}

// ── IV / Infusion Request ──────────────────────────────────────────────────────
function InfusionForm({ patient, doctorId, onSuccess }) {
  const [form, setForm] = useState({ infusion_type: "IV Fluid Setup", fluid: "", rate: "", urgency: "Normal" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "infusion",
        doctor_id: doctorId,
        priority: form.urgency,
        details: form
      });
      setSuccess(`${form.infusion_type} request submitted for ${patient.name}.`);
      setForm({ infusion_type: "IV Fluid Setup", fluid: "", rate: "", urgency: "Normal" });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1"><i className="bi bi-droplet-half text-info" /><span className="text-white fw-bold">IV / Infusion Request</span></div>
      <div className="row g-2">
        <div className="col-md-6">
          <label className={labelCls}>Request Type</label>
          <select className={selectCls} value={form.infusion_type} onChange={e => set("infusion_type", e.target.value)}>
            <option>IV Fluid Setup</option><option>Infusion Pump</option><option>Continuous Infusion</option><option>IV Medication</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Urgency</label>
          <select className={selectCls} value={form.urgency} onChange={e => set("urgency", e.target.value)}>
            <option>Normal</option><option>Urgent</option><option>Emergency</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Fluid / Medication</label>
          <input className={inputCls} placeholder="e.g. NS 0.9%, Ringers Lactate" value={form.fluid} onChange={e => set("fluid", e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Rate (mL/hr)</label>
          <input className={inputCls} placeholder="e.g. 125" value={form.rate} onChange={e => set("rate", e.target.value)} />
        </div>
      </div>
      {error && <div className="text-danger small"><i className="bi bi-exclamation-circle me-1" />{error}</div>}
      <button className="btn btn-info text-dark fw-bold" disabled={loading} type="submit" style={{ borderRadius: 8 }}>
        {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-droplet me-2" />}
        Submit IV Request
      </button>
    </form>
  );
}

// ── Lab Escalation ─────────────────────────────────────────────────────────────
function LabEscalationForm({ patient, doctorId, onSuccess }) {
  const [form, setForm] = useState({ test_name: "", escalation_level: "STAT", reason: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.test_name || !form.reason.trim()) { setError("Test name and reason required."); return; }
    setLoading(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "lab_escalation",
        doctor_id: doctorId,
        priority: "Emergency",
        details: form
      });
      setSuccess(`Lab escalation to ${form.escalation_level} priority submitted for ${form.test_name}.`);
      setForm({ test_name: "", escalation_level: "STAT", reason: "" });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1"><i className="bi bi-flask-fill text-warning" /><span className="text-white fw-bold">Urgent Lab Escalation</span></div>
      <div className="row g-2">
        <div className="col-md-6">
          <label className={labelCls}>Test Name *</label>
          <input className={inputCls} placeholder="e.g. CBC, Troponin, D-Dimer" value={form.test_name} onChange={e => set("test_name", e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Escalation Level</label>
          <select className={selectCls} value={form.escalation_level} onChange={e => set("escalation_level", e.target.value)}>
            <option>STAT</option><option>Emergency Priority</option>
          </select>
        </div>
        <div className="col-md-12">
          <label className={labelCls}>Clinical Reason *</label>
          <textarea className={inputCls} rows={2} placeholder="Reason for escalation..." value={form.reason} onChange={e => set("reason", e.target.value)} />
        </div>
      </div>
      {error && <div className="text-danger small"><i className="bi bi-exclamation-circle me-1" />{error}</div>}
      <button className="btn btn-warning text-dark fw-bold" disabled={loading || !form.test_name || !form.reason.trim()} type="submit" style={{ borderRadius: 8 }}>
        {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-arrow-up-square me-2" />}
        Escalate to {form.escalation_level}
      </button>
    </form>
  );
}

// ── Imaging Priority ───────────────────────────────────────────────────────────
function ImagingPriorityForm({ patient, doctorId, onSuccess }) {
  const [form, setForm] = useState({ imaging_type: "CT", urgency: "Urgent", body_part: "", clinical_indication: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clinical_indication.trim()) { setError("Clinical indication required."); return; }
    setLoading(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "imaging_priority",
        doctor_id: doctorId,
        priority: form.urgency,
        details: form
      });
      setSuccess(`Priority ${form.imaging_type} request submitted for ${patient.name}.`);
      setForm({ imaging_type: "CT", urgency: "Urgent", body_part: "", clinical_indication: "" });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1"><i className="bi bi-camera-fill text-purple" style={{ color: "#6366f1" }} /><span className="text-white fw-bold">Imaging Priority Request</span></div>
      <div className="row g-2">
        <div className="col-md-4">
          <label className={labelCls}>Imaging Type</label>
          <select className={selectCls} value={form.imaging_type} onChange={e => set("imaging_type", e.target.value)}>
            <option>CT</option><option>MRI</option><option>X-Ray</option><option>Ultrasound</option><option>PET-CT</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className={labelCls}>Body Part / Area</label>
          <input className={inputCls} placeholder="e.g. Head, Chest, Abdomen" value={form.body_part} onChange={e => set("body_part", e.target.value)} />
        </div>
        <div className="col-md-4">
          <label className={labelCls}>Urgency</label>
          <select className={selectCls} value={form.urgency} onChange={e => set("urgency", e.target.value)}>
            <option>Routine</option><option>Urgent</option><option>Emergency</option>
          </select>
        </div>
        <div className="col-md-12">
          <label className={labelCls}>Clinical Indication *</label>
          <textarea className={inputCls} rows={2} placeholder="Reason for priority imaging..." value={form.clinical_indication} onChange={e => set("clinical_indication", e.target.value)} />
        </div>
      </div>
      {error && <div className="text-danger small"><i className="bi bi-exclamation-circle me-1" />{error}</div>}
      <button className="btn fw-bold" disabled={loading || !form.clinical_indication.trim()} type="submit" style={{ borderRadius: 8, background: "#4f46e5", color: "#fff" }}>
        {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-camera me-2" />}
        Request Priority {form.imaging_type}
      </button>
    </form>
  );
}

// ── Main ClinicalCoordOps component ───────────────────────────────────────────
const CLINICAL_OPS = [
  { id: "surgery", label: "Surgery Scheduling", icon: "bi-bandaid-fill", color: "#f43f5e" },
  { id: "specialist_consult", label: "Specialist Consultation", icon: "bi-person-badge-fill", color: "#8b5cf6" },
  { id: "nurse_assistance", label: "Nurse Assistance", icon: "bi-heart-pulse-fill", color: "#ec4899" },
  { id: "infusion", label: "IV / Infusion", icon: "bi-droplet-half", color: "#06b6d4" },
  { id: "lab_escalation", label: "Lab Escalation", icon: "bi-flask-fill", color: "#f59e0b" },
  { id: "imaging_priority", label: "Imaging Priority", icon: "bi-camera-fill", color: "#6366f1" },
];

export default function ClinicalCoordOps({ patient, doctorId, onOperationCreated }) {
  const [selected, setSelected] = useState(null);

  const renderForm = () => {
    const props = { patient, doctorId, onSuccess: onOperationCreated };
    switch (selected) {
      case "surgery": return <SurgeryForm {...props} />;
      case "specialist_consult": return <SpecialistConsultForm {...props} />;
      case "nurse_assistance": return <NurseAssistanceForm {...props} />;
      case "infusion": return <InfusionForm {...props} />;
      case "lab_escalation": return <LabEscalationForm {...props} />;
      case "imaging_priority": return <ImagingPriorityForm {...props} />;
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 flex-wrap">
        {CLINICAL_OPS.map(op => (
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
        <div className="p-3 rounded-3" style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <PatientContextBar patient={patient} />
          {renderForm()}
        </div>
      )}
      {!selected && (
        <div className="text-center py-4 text-muted" style={{ fontSize: "0.82rem" }}>
          <i className="bi bi-stethoscope mb-2" style={{ fontSize: "2rem", opacity: 0.4 }} />
          <div className="mt-2">Select a clinical coordination request above.</div>
        </div>
      )}
    </motion.div>
  );
}
