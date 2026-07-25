import { useState } from "react";
import { useApp } from "../context/AppContext";
import { updatePatient as updatePatientAPI, deletePatient as deletePatientAPI } from "../services/api";

const SEV_CLS  = { Critical:"severity-critical", High:"severity-major", Major:"severity-major", Medium:"severity-moderate", Moderate:"severity-moderate", Low:"severity-minor", Minor:"severity-minor" };
const STAT_CLS = { "Newly Admitted":"bg-primary","In Treatment":"bg-success","Awaiting Scans":"bg-warning text-dark",Stable:"bg-info text-dark",Recovering:"bg-secondary","Discharge Ready":"bg-dark" };

const DEPTS = ["All","Trauma","Cardiology","Neurology","Pediatrics","General Surgery"];
const SEVS  = ["All","Critical","High","Medium","Low"];

export default function EmergencyQueue({ addToast }) {
  const { patients, doctors, beds, updatePatient, dischargePatient, assignDoctorToPatient, assignBedToPatient } = useApp();
  const [dept, setDept] = useState("All");
  const [sev,  setSev]  = useState("All");
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({});

  const active = patients.filter(p => p.status !== "Discharged");
  const filtered = active
    .filter(p => dept === "All" || p.department === dept)
    .filter(p => {
      if (sev === "All") return true;
      let s = p.severity;
      if (s === "Major") s = "High";
      if (s === "Moderate") s = "Medium";
      if (s === "Minor") s = "Low";
      return s === sev;
    });

  const openEdit = (p) => {
    setEditId(p.id);
    setEditFields({ 
      severity: p.severity, 
      status: p.status,
      assignedDoctor: p.assignedDoctor || "",
      assignedBed: p.assignedBed || ""
    });
  };

  const handleSave = async () => {
    const pat = patients.find(p => p.id === editId);
    if (!pat) return;

    const score = editFields.severity === "Critical" ? 90 : editFields.severity === "Major" || editFields.severity === "High" ? 70 : editFields.severity === "Moderate" || editFields.severity === "Medium" ? 50 : 20;
    
    // Update local persistent state immediately
    updatePatient(editId, { severity: editFields.severity, status: editFields.fields || editFields.status, severity_score: score });

    try {
      // Best effort backend sync if numeric ID available
      const numericId = pat.numericId || (pat.id.includes("-") ? parseInt(pat.id.split("-").pop(), 10) : null);
      if (numericId && !isNaN(numericId)) {
        await updatePatientAPI(numericId, { severity_score: score });
        
        // Handle doctor assignment if changed
        if (editFields.assignedDoctor && editFields.assignedDoctor !== pat.assignedDoctor) {
            const doc = doctors.find(d => d.name === editFields.assignedDoctor);
            if (doc) await assignDoctorToPatient(numericId, doc.numericId);
        }

        // Handle bed assignment if changed
        if (editFields.assignedBed && editFields.assignedBed !== pat.assignedBed) {
            const bed = beds.find(b => b.id === editFields.assignedBed);
            if (bed) await assignBedToPatient(numericId, bed.numericId);
        }
      }
    } catch (err) {
      console.warn("Backend update skipped/offline", err);
    }

    addToast("Triage Updated", `Case ${editId} updated successfully.`, "success");
    setEditId(null);
  };

  const handleDischarge = async (id) => {
    if (!window.confirm(`Authorize discharge for case ${id}?`)) return;
    
    const pat = patients.find(p => p.id === id);
    // Persist immediately to unbind associated beds and doctors
    dischargePatient(id);

    try {
      const numericId = pat?.numericId || (id.includes("-") ? parseInt(id.split("-").pop(), 10) : null);
      if (numericId && !isNaN(numericId)) {
        await deletePatientAPI(numericId);
      }
    } catch (err) {
      console.warn("Backend delete skipped/offline", err);
    }

    addToast("Patient Discharged", `Case ${id} archived successfully.`, "success");
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 pb-2 border-bottom gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Emergency Triage Queue</h2>
          <p className="text-muted small mb-0">Live tracking matrix with status modification and discharge controls.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <select className="form-select form-select-sm" style={{ width: "auto" }} value={dept} onChange={e => setDept(e.target.value)}>
            {DEPTS.map(d => <option key={d}>{d === "All" ? "All Departments" : d}</option>)}
          </select>
          <select className="form-select form-select-sm" style={{ width: "auto" }} value={sev} onChange={e => setSev(e.target.value)}>
            {SEVS.map(s => <option key={s}>{s === "All" ? "All Severities" : s}</option>)}
          </select>
        </div>
      </div>

      {/* Inline Edit Modal */}
      {editId && (
        <div className="modal-backdrop-custom">
          <div className="triage-modal glass-panel p-4" style={{ maxWidth: 440 }}>
            <h5 className="fw-bold mb-3"><i className="bi bi-sliders me-2 text-primary" />Adjust Triage – {editId}</h5>
            <div className="mb-3">
              <label className="form-label fw-medium small">Severity Level</label>
              <select className="form-select" value={editFields.severity} onChange={e => setEditFields(f => ({ ...f, severity: e.target.value }))}>
                {["Critical","Major","Moderate","Minor"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="form-label fw-medium small">Progress Phase</label>
              <select className="form-select" value={editFields.status} onChange={e => setEditFields(f => ({ ...f, status: e.target.value }))}>
                {["Newly Admitted","In Treatment","Awaiting Scans","Stable","Recovering","Discharge Ready"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label fw-medium small">Assign Doctor</label>
              <select className="form-select" value={editFields.assignedDoctor} onChange={e => setEditFields(f => ({ ...f, assignedDoctor: e.target.value }))}>
                <option value="">-- Select Doctor --</option>
                {doctors.map(d => <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="form-label fw-medium small">Assign Bed</label>
              <select className="form-select" value={editFields.assignedBed} onChange={e => setEditFields(f => ({ ...f, assignedBed: e.target.value }))}>
                <option value="">-- Select Bed --</option>
                {beds.filter(b => b.status === "Available" || b.id === editFields.assignedBed).map(b => (
                  <option key={b.id} value={b.id}>{b.id} ({b.type})</option>
                ))}
              </select>
            </div>
            <div className="d-flex gap-2 justify-content-end">
              <button className="btn btn-outline-secondary" onClick={() => setEditId(null)}>Cancel</button>
              <button className="btn btn-primary-gradient" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-panel p-4">
        <div className="table-responsive" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <table className="premium-table w-100">
            <thead style={{ position: "sticky", top: 0, background: "rgba(15, 23, 42, 0.95)", zIndex: 1 }}>
              <tr>
                {["Case ID","Patient","Priority","Department","Bed","Doctor","Time","Phase","Actions"].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={9} className="text-center text-muted py-4">No patients match active filters.</td></tr>
                : filtered.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.id}</strong></td>
                      <td>
                        <div className="fw-semibold">{p.name}</div>
                        <small className="text-muted">{p.gender}, {p.age} yrs</small>
                      </td>
                      <td><span className={`badge-severity ${SEV_CLS[p.severity] || "severity-moderate"}`}>{p.severity}</span></td>
                      <td>{p.department}</td>
                      <td><span className="badge bg-light text-dark border">{p.assignedBed || "Waiting"}</span></td>
                      <td><small>{p.assignedDoctor || "Unassigned"}</small></td>
                      <td><small className="text-muted"><i className="bi bi-clock me-1" />{p.admittedTime || "N/A"}</small></td>
                      <td><span className={`badge ${STAT_CLS[p.status] || "bg-light text-dark border"}`}>{p.status}</span></td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-secondary" title="Adjust Triage" onClick={() => openEdit(p)}>
                            <i className="bi bi-sliders" />
                          </button>
                          <button className="btn btn-outline-success" title="Discharge" onClick={() => handleDischarge(p.id)}>
                            <i className="bi bi-check2-circle" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
