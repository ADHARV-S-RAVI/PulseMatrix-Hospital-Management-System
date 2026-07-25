// ResourceOps.jsx — Critical Resources, Blood Bank, Ventilator, Oxygen Support, Medical Equipment
import { useState } from "react";
import { motion } from "motion/react";
import { createOperation } from "../../../../services/api";
import PatientContextBar from "../PatientContextBar";

const inputCls = "form-control form-control-sm bg-dark text-white border-secondary";
const selectCls = "form-select form-select-sm bg-dark text-white border-secondary";
const labelCls = "form-label small text-muted mb-1";

function FormSuccess({ message, onClose }) {
  return (
    <div className="p-3 rounded-3 d-flex align-items-start gap-3" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
      <i className="bi bi-check-circle-fill text-success fs-5" />
      <div className="flex-grow-1">
        <div className="text-success fw-bold small">Request Submitted</div>
        <div className="text-muted" style={{ fontSize: "0.8rem" }}>{message}</div>
      </div>
      <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={onClose}><i className="bi bi-x" /></button>
    </div>
  );
}

function SubmitButton({ loading, disabled, label, icon, variant = "warning" }) {
  return (
    <button className={`btn btn-${variant} text-dark fw-bold`} disabled={loading || disabled} type="submit" style={{ borderRadius: 8 }}>
      {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className={`bi ${icon} me-2`} />}
      {label}
    </button>
  );
}

// ── Blood Bank Request ─────────────────────────────────────────────────────────
function BloodBankForm({ patient, doctorId, onSuccess }) {
  const [form, setForm] = useState({ blood_group: "O+", component: "Packed RBC", units: 1, urgency: "Urgent", reason: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reason.trim()) { setError("Reason is required."); return; }
    setLoading(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "blood_request",
        doctor_id: doctorId,
        priority: form.urgency,
        details: form
      });
      setSuccess(`Blood bank request for ${form.units} unit(s) of ${form.component} (${form.blood_group}) submitted for ${patient.name}.`);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to submit blood request.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1">
        <i className="bi bi-droplet-fill text-danger" />
        <span className="text-white fw-bold">Blood Bank Request</span>
      </div>
      <div className="row g-2">
        <div className="col-md-4">
          <label className={labelCls}>Blood Group</label>
          <select className={selectCls} value={form.blood_group} onChange={e => set("blood_group", e.target.value)}>
            {["O+","O-","A+","A-","B+","B-","AB+","AB-"].map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div className="col-md-4">
          <label className={labelCls}>Component</label>
          <select className={selectCls} value={form.component} onChange={e => set("component", e.target.value)}>
            <option>Packed RBC</option><option>Fresh Frozen Plasma</option><option>Platelets</option><option>Whole Blood</option><option>Cryoprecipitate</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className={labelCls}>Units</label>
          <input className={inputCls} type="number" min={1} max={20} value={form.units} onChange={e => set("units", parseInt(e.target.value))} />
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Urgency</label>
          <select className={selectCls} value={form.urgency} onChange={e => set("urgency", e.target.value)}>
            <option>Routine</option><option>Urgent</option><option>Emergency</option>
          </select>
        </div>
        <div className="col-md-12">
          <label className={labelCls}>Clinical Reason *</label>
          <textarea className={inputCls} rows={2} placeholder="e.g. Active GI bleeding, pre-operative..." value={form.reason} onChange={e => set("reason", e.target.value)} />
        </div>
      </div>
      {error && <div className="text-danger small"><i className="bi bi-exclamation-circle me-1" />{error}</div>}
      <SubmitButton loading={loading} disabled={!form.reason.trim()} label="Submit Blood Request" icon="bi-droplet-fill" variant="danger" />
    </form>
  );
}

// ── Ventilator Request ─────────────────────────────────────────────────────────
function VentilatorForm({ patient, doctorId, onSuccess }) {
  const [form, setForm] = useState({ ventilator_type: "Invasive (Intubated)", urgency: "Urgent", mode: "", requirement: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "ventilator",
        doctor_id: doctorId,
        priority: form.urgency,
        details: form
      });
      setSuccess(`Ventilator request submitted for ${patient.name}.`);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to submit ventilator request.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1">
        <i className="bi bi-lungs-fill text-info" />
        <span className="text-white fw-bold">Ventilator Request</span>
      </div>
      <div className="row g-2">
        <div className="col-md-6">
          <label className={labelCls}>Ventilator Type</label>
          <select className={selectCls} value={form.ventilator_type} onChange={e => set("ventilator_type", e.target.value)}>
            <option>Invasive (Intubated)</option><option>Non-Invasive (BiPAP/CPAP)</option><option>High-Flow Nasal Oxygen</option><option>Portable Ventilator</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Urgency</label>
          <select className={selectCls} value={form.urgency} onChange={e => set("urgency", e.target.value)}>
            <option>Routine</option><option>Urgent</option><option>Emergency</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Ventilation Mode (if known)</label>
          <input className={inputCls} placeholder="e.g. SIMV, AC/VC, Pressure Support" value={form.mode} onChange={e => set("mode", e.target.value)} />
        </div>
        <div className="col-md-12">
          <label className={labelCls}>Patient Requirement</label>
          <textarea className={inputCls} rows={2} placeholder="Describe respiratory status and requirement..." value={form.requirement} onChange={e => set("requirement", e.target.value)} />
        </div>
      </div>
      {error && <div className="text-danger small"><i className="bi bi-exclamation-circle me-1" />{error}</div>}
      <SubmitButton loading={loading} disabled={false} label="Request Ventilator" icon="bi-lungs-fill" variant="info" />
    </form>
  );
}

// ── Oxygen Support ─────────────────────────────────────────────────────────────
function OxygenForm({ patient, doctorId, onSuccess }) {
  const [form, setForm] = useState({ oxygen_type: "Nasal Cannula", flow_rate: "", urgency: "Urgent", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "oxygen",
        doctor_id: doctorId,
        priority: form.urgency,
        details: form
      });
      setSuccess(`Oxygen support request (${form.oxygen_type}) submitted for ${patient.name}.`);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to submit oxygen request.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1">
        <i className="bi bi-wind text-info" />
        <span className="text-white fw-bold">Oxygen Support Request</span>
      </div>
      <div className="row g-2">
        <div className="col-md-6">
          <label className={labelCls}>Oxygen Delivery Type</label>
          <select className={selectCls} value={form.oxygen_type} onChange={e => set("oxygen_type", e.target.value)}>
            <option>Nasal Cannula</option><option>Simple Face Mask</option><option>Non-Rebreather Mask</option><option>High-Flow Nasal Cannula</option><option>Oxygen Cylinder</option><option>Oxygen Concentrator</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Flow Rate (L/min)</label>
          <input className={inputCls} placeholder="e.g. 4" value={form.flow_rate} onChange={e => set("flow_rate", e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Urgency</label>
          <select className={selectCls} value={form.urgency} onChange={e => set("urgency", e.target.value)}>
            <option>Routine</option><option>Urgent</option><option>Emergency</option>
          </select>
        </div>
        <div className="col-md-12">
          <label className={labelCls}>Clinical Notes</label>
          <textarea className={inputCls} rows={2} placeholder="Additional notes..." value={form.notes} onChange={e => set("notes", e.target.value)} />
        </div>
      </div>
      {error && <div className="text-danger small"><i className="bi bi-exclamation-circle me-1" />{error}</div>}
      <SubmitButton loading={loading} disabled={false} label="Request Oxygen Support" icon="bi-wind" variant="info" />
    </form>
  );
}

// ── Medical Equipment Request ──────────────────────────────────────────────────
function EquipmentForm({ patient, doctorId, onSuccess }) {
  const [form, setForm] = useState({ equipment_type: "", urgency: "Urgent", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.equipment_type) { setError("Equipment type required."); return; }
    setLoading(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "equipment",
        doctor_id: doctorId,
        priority: form.urgency,
        details: form
      });
      setSuccess(`Equipment request (${form.equipment_type}) submitted for ${patient.name}.`);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to submit equipment request.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1">
        <i className="bi bi-cpu-fill text-secondary" />
        <span className="text-white fw-bold">Medical Equipment Request</span>
      </div>
      <div className="row g-2">
        <div className="col-md-6">
          <label className={labelCls}>Equipment Type *</label>
          <select className={selectCls} value={form.equipment_type} onChange={e => set("equipment_type", e.target.value)}>
            <option value="">Select equipment...</option>
            <option>ECG Monitor</option><option>Defibrillator</option><option>Infusion Pump</option>
            <option>Portable Monitor</option><option>Suction Unit</option><option>Glucometer</option>
            <option>Pulse Oximeter</option><option>Nebulizer</option><option>Other</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className={labelCls}>Urgency</label>
          <select className={selectCls} value={form.urgency} onChange={e => set("urgency", e.target.value)}>
            <option>Routine</option><option>Urgent</option><option>Emergency</option>
          </select>
        </div>
        <div className="col-md-12">
          <label className={labelCls}>Additional Notes</label>
          <textarea className={inputCls} rows={2} placeholder="e.g. specific model required, duration of use..." value={form.notes} onChange={e => set("notes", e.target.value)} />
        </div>
      </div>
      {error && <div className="text-danger small"><i className="bi bi-exclamation-circle me-1" />{error}</div>}
      <SubmitButton loading={loading} disabled={!form.equipment_type} label="Request Equipment" icon="bi-cpu-fill" />
    </form>
  );
}

// ── Critical Resources (existing, preserved + enhanced) ────────────────────────
function CriticalResourcesForm({ patient, doctorId, onSuccess }) {
  const [resourceType, setResourceType] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resourceType) { setError("Resource type required."); return; }
    setLoading(true); setError(null);
    try {
      await createOperation(patient.patient_id, {
        operation_type: "critical_resources",
        doctor_id: doctorId,
        priority,
        details: { resource_type: resourceType, quantity, priority }
      });
      setSuccess(`Critical resource request (${resourceType}) submitted.`);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed.");
    } finally { setLoading(false); }
  };

  if (success) return <FormSuccess message={success} onClose={() => setSuccess(null)} />;

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 mb-1">
        <i className="bi bi-box-seam-fill text-warning" />
        <span className="text-white fw-bold">Critical Resource Request</span>
      </div>
      <div>
        <label className={labelCls}>Resource Type *</label>
        <select className={selectCls} value={resourceType} onChange={e => setResourceType(e.target.value)}>
          <option value="">Select resource...</option>
          <option>Blood (O-Negative)</option><option>Blood (A-Positive)</option><option>Blood (B-Positive)</option><option>Blood (AB-Negative)</option>
          <option>Ventilator</option><option>Defibrillator</option><option>ICU Bed</option><option>Other</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Priority</label>
        <select className={selectCls} value={priority} onChange={e => setPriority(e.target.value)}>
          <option>Normal</option><option>High</option><option>Emergency (STAT)</option>
        </select>
      </div>
      {error && <div className="text-danger small"><i className="bi bi-exclamation-circle me-1" />{error}</div>}
      <SubmitButton loading={loading} disabled={!resourceType} label="Submit Request" icon="bi-box-seam-fill" />
    </form>
  );
}

// ── Main ResourceOps component ─────────────────────────────────────────────────
const RESOURCE_OPS = [
  { id: "critical_resources", label: "Critical Resources", icon: "bi-box-seam-fill", color: "#f59e0b" },
  { id: "blood_request", label: "Blood Bank", icon: "bi-droplet-fill", color: "#ef4444" },
  { id: "ventilator", label: "Ventilator", icon: "bi-lungs-fill", color: "#0ea5e9" },
  { id: "oxygen", label: "Oxygen Support", icon: "bi-wind", color: "#38bdf8" },
  { id: "equipment", label: "Medical Equipment", icon: "bi-cpu-fill", color: "#94a3b8" },
];

export default function ResourceOps({ patient, doctorId, onOperationCreated }) {
  const [selected, setSelected] = useState(null);

  const renderForm = () => {
    const props = { patient, doctorId, onSuccess: onOperationCreated };
    switch (selected) {
      case "critical_resources": return <CriticalResourcesForm {...props} />;
      case "blood_request": return <BloodBankForm {...props} />;
      case "ventilator": return <VentilatorForm {...props} />;
      case "oxygen": return <OxygenForm {...props} />;
      case "equipment": return <EquipmentForm {...props} />;
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 flex-wrap">
        {RESOURCE_OPS.map(op => (
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
          <i className="bi bi-box-seam text-warning mb-2" style={{ fontSize: "2rem" }} />
          <div className="mt-2">Select a resource request above.</div>
        </div>
      )}
    </motion.div>
  );
}
