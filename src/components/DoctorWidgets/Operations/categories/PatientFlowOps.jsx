// PatientFlowOps.jsx — Discharge Workflow, Bed/ICU Transfer, Referral/Transfer, Transport, Patient Movement, Shift Handover
import { useState } from "react";
import { motion } from "motion/react";
import { createOperation } from "../../../../services/api";
import { aiHandover } from "../../../../services/api";
import PatientContextBar from "../PatientContextBar";
import ConfirmModal from "../ConfirmModal";

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

// ── Discharge Workflow (existing, preserved + API-connected) ───────────────────
function DischargeForm({ patient, doctorId, onSuccess }) {
  const [followup, setFollowup] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const canDischarge = patient.severity_score <= 30;

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "discharge",
        doctor_id: doctorId,
        priority: "Normal",
        details: { followup_date: followup, authorized_by_doctor: doctorId, severity_at_discharge: patient.severity_score }
      });
      setSuccess(`Discharge approved for ${patient.name}. Discharge workflow initiated.`);
      setAuthorized(false); setFollowup(""); setConfirmOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1"><i className="bi bi-door-open-fill text-success" /><span className="text-white fw-bold">Discharge Workflow</span></div>
      <div className="p-3 rounded-3" style={{ background: canDischarge ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)", border: `1px solid ${canDischarge ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}` }}>
        <div className="d-flex align-items-center gap-2">
          <i className={`bi ${canDischarge ? "bi-check-circle-fill text-success" : "bi-exclamation-triangle-fill text-warning"}`} />
          <span className={`fw-bold small ${canDischarge ? "text-success" : "text-warning"}`}>
            {canDischarge ? "Patient cleared for discharge assessment." : `AI Readiness: ${100 - patient.severity_score}% — Score must be ≤ 30 for discharge.`}
          </span>
        </div>
      </div>
      <div>
        <label className={labelCls}>Follow-Up Appointment (Optional)</label>
        <input className={inputCls} type="datetime-local" value={followup} onChange={e => setFollowup(e.target.value)} />
      </div>
      <div className="form-check">
        <input className="form-check-input" type="checkbox" id="discharge-auth" checked={authorized} onChange={e => setAuthorized(e.target.checked)} />
        <label className="form-check-label text-white small" htmlFor="discharge-auth">
          I authorize the clinical discharge of {patient.name}.
        </label>
      </div>
      {error && <div className="text-danger small"><i className="bi bi-exclamation-circle me-1" />{error}</div>}
      <button className="btn btn-success fw-bold" disabled={!canDischarge || !authorized || loading} onClick={() => setConfirmOpen(true)} style={{ borderRadius: 8 }}>
        <i className="bi bi-door-open me-2" />Approve Discharge
      </button>
      <ConfirmModal
        open={confirmOpen}
        title="Confirm Discharge Approval"
        patient={patient}
        action="Patient Discharge"
        description="This will initiate the discharge workflow. Ensure all pending orders are resolved."
        confirmLabel="Approve Discharge"
        confirmVariant="success"
        loading={loading}
        onConfirm={handleSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

// ── Bed / ICU Transfer (existing, preserved + API-connected) ───────────────────
function BedTransferForm({ patient, doctorId, onSuccess }) {
  const [targetUnit, setTargetUnit] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "bed_transfer",
        doctor_id: doctorId,
        priority: "Urgent",
        details: { target_unit: targetUnit, reason, current_bed: patient.assigned_bed_type }
      });
      setSuccess(`Transfer to ${targetUnit} requested for ${patient.name}.`);
      setTargetUnit(""); setReason(""); setConfirmOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1"><i className="bi bi-hospital text-info" /><span className="text-white fw-bold">Bed / ICU Transfer</span></div>
      <p className="small text-muted mb-0">Current: <span className="text-white fw-bold">{patient.assigned_bed_type || "No bed assigned"}</span></p>
      <div>
        <label className={labelCls}>Target Unit *</label>
        <select className={selectCls} value={targetUnit} onChange={e => setTargetUnit(e.target.value)}>
          <option value="">Select target unit...</option>
          <option>Intensive Care Unit (ICU)</option><option>Step-Down Unit</option>
          <option>General Ward</option><option>Operating Recovery</option><option>Coronary Care Unit</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Clinical Reason</label>
        <textarea className={inputCls} rows={2} placeholder="Reason for transfer..." value={reason} onChange={e => setReason(e.target.value)} />
      </div>
      {error && <div className="text-danger small"><i className="bi bi-exclamation-circle me-1" />{error}</div>}
      <button className="btn btn-info text-dark fw-bold" disabled={!targetUnit || loading} onClick={() => setConfirmOpen(true)} style={{ borderRadius: 8 }}>
        <i className="bi bi-arrow-right-circle me-2" />Request Transfer
      </button>
      <ConfirmModal
        open={confirmOpen}
        title="Confirm Transfer Request"
        patient={patient}
        action={`Transfer to ${targetUnit}`}
        description="This will notify the bed management team for transfer coordination."
        confirmLabel="Confirm Transfer"
        confirmVariant="info"
        loading={loading}
        onConfirm={handleSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

// ── Referral / Hospital Transfer ───────────────────────────────────────────────
function ReferralForm({ patient, doctorId, onSuccess }) {
  const [form, setForm] = useState({ referral_type: "Department Referral", destination: "", reason: "", urgency: "Routine", summary: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.destination || !form.reason.trim()) { setError("Destination and reason required."); return; }
    setLoading(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "referral",
        doctor_id: doctorId,
        priority: form.urgency,
        details: form
      });
      setSuccess(`${form.referral_type} to ${form.destination} submitted for ${patient.name}.`);
      setForm({ referral_type: "Department Referral", destination: "", reason: "", urgency: "Routine", summary: "" });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1"><i className="bi bi-arrow-left-right" style={{ color: "#8b5cf6" }} /><span className="text-white fw-bold">Referral / Hospital Transfer</span></div>
      <div className="row g-2">
        <div className="col-md-6">
          <label className={labelCls}>Referral Type</label>
          <select className={selectCls} value={form.referral_type} onChange={e => set("referral_type", e.target.value)}>
            <option>Department Referral</option><option>Internal Hospital Transfer</option><option>External Hospital Referral</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Urgency</label>
          <select className={selectCls} value={form.urgency} onChange={e => set("urgency", e.target.value)}>
            <option>Routine</option><option>Urgent</option><option>Emergency</option>
          </select>
        </div>
        <div className="col-md-12">
          <label className={labelCls}>Destination *</label>
          <input className={inputCls} placeholder="Department, hospital, or facility name" value={form.destination} onChange={e => set("destination", e.target.value)} />
        </div>
        <div className="col-md-12">
          <label className={labelCls}>Reason for Referral *</label>
          <textarea className={inputCls} rows={2} placeholder="Clinical indication for referral..." value={form.reason} onChange={e => set("reason", e.target.value)} />
        </div>
        <div className="col-md-12">
          <label className={labelCls}>Clinical Summary</label>
          <textarea className={inputCls} rows={2} placeholder="Brief clinical summary for receiving team..." value={form.summary} onChange={e => set("summary", e.target.value)} />
        </div>
      </div>
      {error && <div className="text-danger small"><i className="bi bi-exclamation-circle me-1" />{error}</div>}
      <button className="btn fw-bold" disabled={loading || !form.destination || !form.reason.trim()} type="submit" style={{ borderRadius: 8, background: "#7c3aed", color: "#fff" }}>
        {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-send me-2" />}
        Submit Referral
      </button>
    </form>
  );
}

// ── Transport Request ──────────────────────────────────────────────────────────
function TransportForm({ patient, doctorId, onSuccess }) {
  const [form, setForm] = useState({ transport_type: "Internal Transport", origin: "", destination: "", urgency: "Normal", mobility: "Stretcher" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.destination) { setError("Destination required."); return; }
    setLoading(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "transport",
        doctor_id: doctorId,
        priority: form.urgency,
        details: form
      });
      setSuccess(`${form.transport_type} request submitted for ${patient.name}.`);
      setForm({ transport_type: "Internal Transport", origin: "", destination: "", urgency: "Normal", mobility: "Stretcher" });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1"><i className="bi bi-ambulance text-info" /><span className="text-white fw-bold">Ambulance / Patient Transport</span></div>
      <div className="row g-2">
        <div className="col-md-6">
          <label className={labelCls}>Transport Type</label>
          <select className={selectCls} value={form.transport_type} onChange={e => set("transport_type", e.target.value)}>
            <option>Internal Transport</option><option>Ambulance</option><option>Inter-hospital Transfer</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Urgency</label>
          <select className={selectCls} value={form.urgency} onChange={e => set("urgency", e.target.value)}>
            <option>Normal</option><option>Urgent</option><option>Emergency</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Origin</label>
          <input className={inputCls} placeholder="Ward / Room / Department" value={form.origin} onChange={e => set("origin", e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Destination *</label>
          <input className={inputCls} placeholder="Ward / Department / Hospital" value={form.destination} onChange={e => set("destination", e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Patient Mobility</label>
          <select className={selectCls} value={form.mobility} onChange={e => set("mobility", e.target.value)}>
            <option>Stretcher</option><option>Wheelchair</option><option>Ambulatory</option><option>Critical — Full Support</option>
          </select>
        </div>
      </div>
      {error && <div className="text-danger small"><i className="bi bi-exclamation-circle me-1" />{error}</div>}
      <button className="btn btn-info text-dark fw-bold" disabled={loading || !form.destination} type="submit" style={{ borderRadius: 8 }}>
        {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-send me-2" />}
        Request Transport
      </button>
    </form>
  );
}

// ── Patient Movement ───────────────────────────────────────────────────────────
function PatientMovementForm({ patient, doctorId, onSuccess }) {
  const [form, setForm] = useState({ equipment: "Wheelchair", from: "", to: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.to) { setError("Destination required."); return; }
    setLoading(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "patient_movement",
        doctor_id: doctorId,
        priority: "Normal",
        details: form
      });
      setSuccess(`Patient movement (${form.equipment}) requested for ${patient.name}.`);
      setForm({ equipment: "Wheelchair", from: "", to: "", notes: "" });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1"><i className="bi bi-person-walking text-success" /><span className="text-white fw-bold">Patient Movement Request</span></div>
      <div className="row g-2">
        <div className="col-md-6">
          <label className={labelCls}>Equipment</label>
          <select className={selectCls} value={form.equipment} onChange={e => set("equipment", e.target.value)}>
            <option>Wheelchair</option><option>Stretcher</option><option>Assisted Walk</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className={labelCls}>From</label>
          <input className={inputCls} placeholder="Current location" value={form.from} onChange={e => set("from", e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className={labelCls}>To *</label>
          <input className={inputCls} placeholder="Destination" value={form.to} onChange={e => set("to", e.target.value)} />
        </div>
        <div className="col-md-12">
          <label className={labelCls}>Notes</label>
          <input className={inputCls} placeholder="Special handling notes..." value={form.notes} onChange={e => set("notes", e.target.value)} />
        </div>
      </div>
      {error && <div className="text-danger small"><i className="bi bi-exclamation-circle me-1" />{error}</div>}
      <button className="btn btn-success fw-bold" disabled={loading || !form.to} type="submit" style={{ borderRadius: 8 }}>
        {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-send me-2" />}
        Request Movement
      </button>
    </form>
  );
}

// ── Shift Handover ─────────────────────────────────────────────────────────────
function ShiftHandoverForm({ patient, doctorId, onSuccess }) {
  const [handoverData, setHandoverData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toDoctor, setToDoctor] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [aiAvailable, setAiAvailable] = useState(true);

  const generateHandover = async () => {
    setGenerating(true); setError(null);
    try {
      const result = await aiHandover(patient.patient_id, doctorId);
      setHandoverData(result.handover);
      setAiAvailable(result.ai_available);
    } catch (err) {
      // Fallback structure
      setHandoverData({
        patient_condition: `${patient.name}, ${patient.age}yo. Severity: ${patient.severity_score}/100.`,
        latest_vitals_summary: "Check bedside monitor for current vitals.",
        important_medications: "Review prescriptions tab.",
        recent_diagnostics: "Review diagnostics tab.",
        pending_tests: "Not documented.",
        pending_operations: "Review operations timeline.",
        risk_flags: patient.severity_score >= 70 ? "High acuity patient — monitor closely." : "Moderate acuity.",
        recommended_followup: "Review within 30 minutes of handover."
      });
      setAiAvailable(false);
      setError("AI generation failed — default template loaded. Please edit before submitting.");
    } finally { setGenerating(false); }
  };

  const setField = (k, v) => setHandoverData(d => ({ ...d, [k]: v }));

  const handleSubmit = async () => {
    if (!handoverData) { setError("Generate or fill handover first."); return; }
    setSubmitting(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "handover",
        doctor_id: doctorId,
        priority: "Normal",
        details: { ...handoverData, to_doctor: toDoctor, ai_generated: aiAvailable }
      });
      setSuccess(`Shift handover submitted for ${patient.name}.`);
      setHandoverData(null); setToDoctor("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed.");
    } finally { setSubmitting(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  const textAreaStyle = { ...{ className: inputCls }, style: { fontSize: "0.8rem", minHeight: 60 } };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex align-items-center justify-content-between mb-1">
        <div className="d-flex gap-2 align-items-center">
          <i className="bi bi-arrow-clockwise text-info" />
          <span className="text-white fw-bold">Shift Handover</span>
        </div>
        <button className="btn btn-sm btn-outline-info" onClick={generateHandover} disabled={generating}>
          {generating ? <><span className="spinner-border spinner-border-sm me-1" />Generating...</> : <><i className="bi bi-robot me-1" />AI Generate</>}
        </button>
      </div>

      {!aiAvailable && !generating && (
        <div className="p-2 rounded" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", fontSize: "0.75rem", color: "#f59e0b" }}>
          <i className="bi bi-exclamation-triangle me-1" />AI service not configured. Showing template — please fill in.
        </div>
      )}

      {!handoverData && !generating && (
        <div className="text-center py-4 text-muted" style={{ fontSize: "0.82rem" }}>
          <i className="bi bi-robot mb-2" style={{ fontSize: "2rem", opacity: 0.4 }} />
          <div className="mt-2">Click "AI Generate" to create a handover from patient data,<br />or fill in manually below.</div>
          <button className="btn btn-outline-secondary btn-sm mt-2" onClick={() => setHandoverData({ patient_condition: "", latest_vitals_summary: "", important_medications: "", recent_diagnostics: "", pending_tests: "", pending_operations: "", risk_flags: "", recommended_followup: "" })}>
            Fill Manually
          </button>
        </div>
      )}

      {handoverData && (
        <div className="d-flex flex-column gap-2">
          {aiAvailable && <div className="text-info small mb-1"><i className="bi bi-robot me-1" />AI Generated — Review and edit before submitting.</div>}
          {[
            ["patient_condition", "Patient Condition"],
            ["latest_vitals_summary", "Vitals Summary"],
            ["important_medications", "Important Medications"],
            ["recent_diagnostics", "Recent Diagnostics"],
            ["pending_tests", "Pending Tests"],
            ["pending_operations", "Pending Operations"],
            ["risk_flags", "Risk Flags"],
            ["recommended_followup", "Recommended Follow-Up"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className={labelCls}>{label}</label>
              <textarea
                className={inputCls}
                style={{ fontSize: "0.8rem", minHeight: 54 }}
                value={handoverData[key] || ""}
                onChange={e => setField(key, e.target.value)}
                rows={2}
              />
            </div>
          ))}
          <div>
            <label className={labelCls}>Handover To (Doctor Name)</label>
            <input className={inputCls} placeholder="Receiving doctor's name" value={toDoctor} onChange={e => setToDoctor(e.target.value)} />
          </div>
        </div>
      )}

      {error && <div className="text-warning small"><i className="bi bi-exclamation-triangle me-1" />{error}</div>}

      {handoverData && (
        <button className="btn btn-primary fw-bold" disabled={submitting} onClick={handleSubmit} style={{ borderRadius: 8 }}>
          {submitting ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-check-lg me-2" />}
          Submit Handover
        </button>
      )}
    </div>
  );
}

// ── Main PatientFlowOps component ─────────────────────────────────────────────
const FLOW_OPS = [
  { id: "discharge", label: "Discharge Workflow", icon: "bi-door-open-fill", color: "#10b981" },
  { id: "bed_transfer", label: "Bed / ICU Transfer", icon: "bi-hospital", color: "#0ea5e9" },
  { id: "referral", label: "Referral / Transfer", icon: "bi-arrow-left-right", color: "#8b5cf6" },
  { id: "transport", label: "Patient Transport", icon: "bi-ambulance", color: "#06b6d4" },
  { id: "patient_movement", label: "Patient Movement", icon: "bi-person-walking", color: "#10b981" },
  { id: "handover", label: "Shift Handover", icon: "bi-arrow-clockwise", color: "#0ea5e9" },
];

export default function PatientFlowOps({ patient, doctorId, onOperationCreated }) {
  const [selected, setSelected] = useState(null);

  const renderForm = () => {
    const props = { patient, doctorId, onSuccess: onOperationCreated };
    switch (selected) {
      case "discharge": return <DischargeForm {...props} />;
      case "bed_transfer": return <BedTransferForm {...props} />;
      case "referral": return <ReferralForm {...props} />;
      case "transport": return <TransportForm {...props} />;
      case "patient_movement": return <PatientMovementForm {...props} />;
      case "handover": return <ShiftHandoverForm {...props} />;
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 flex-wrap">
        {FLOW_OPS.map(op => (
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
        <div className="p-3 rounded-3" style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(14,165,233,0.2)" }}>
          <PatientContextBar patient={patient} />
          {renderForm()}
        </div>
      )}
      {!selected && (
        <div className="text-center py-4 text-muted" style={{ fontSize: "0.82rem" }}>
          <i className="bi bi-signpost-split mb-2" style={{ fontSize: "2rem", opacity: 0.4 }} />
          <div className="mt-2">Select a patient flow operation above.</div>
        </div>
      )}
    </motion.div>
  );
}
