import { useState, useEffect } from "react";
import { getPriorityQueue, updatePatient, deletePatient } from "../services/api";

const SEV_CLS  = { Critical:"severity-critical", High:"severity-major", Medium:"severity-moderate", Low:"severity-minor" };
const STAT_CLS = { "Newly Admitted":"bg-primary","In Treatment":"bg-success","Awaiting Scans":"bg-warning text-dark",Stable:"bg-info text-dark",Recovering:"bg-secondary","Discharge Ready":"bg-dark" };

const DEPTS = ["All","Trauma","Cardiology","Neurology","Pediatrics","General Surgery"];
const SEVS  = ["All","Critical","High","Medium","Low"];

export default function EmergencyQueue({ addToast }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dept, setDept] = useState("All");
  const [sev,  setSev]  = useState("All");
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({});

  const fetchPatientData = async () => {
    try {
      const data = await getPriorityQueue();
      const mapped = data.map(p => {
        let severityLabel = "Low";
        if (p.score >= 85) severityLabel = "Critical";
        else if (p.score >= 60) severityLabel = "High";
        else if (p.score >= 35) severityLabel = "Medium";
        
        return {
           id: `PT-${p.id}`,
           numericId: p.id,
           name: p.name,
           age: p.age || 0,
           gender: p.gender || "N/A",
           department: p.department || "ER",
           severity: severityLabel,
           severity_score: p.score,
           status: p.status || "Waiting", 
           assignedDoctor: null,
           assignedBed: null,
           admittedTime: p.arrival_time || "N/A"
        };
      });
      setPatients(mapped);
    } catch (err) {
      addToast("Error", "Failed to fetch priority queue", "danger");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchPatientData();
  }, []);

  const active   = patients.filter(p => p.status !== "Discharged");
  const filtered = active
    .filter(p => dept === "All" || p.department === dept)
    .filter(p => sev  === "All" || p.severity  === sev);

  const openEdit = (p) => {
    setEditId(p.id);
    setEditFields({ severity: p.severity, status: p.status });
  };

  const handleSave = async () => {
    try {
       const numericId = patients.find(p => p.id === editId)?.numericId;
       if (!numericId) return;

       const score = editFields.severity === "Critical" ? 90 : editFields.severity === "Major" ? 70 : editFields.severity === "Moderate" ? 50 : 20;
       
       await updatePatient(numericId, { severity_score: score });
       addToast("Triage Updated", `Case ${editId} updated successfully.`, "success");
       setEditId(null);
       fetchPatientData(); // refresh list
    } catch (err) {
       addToast("Error", "Failed to update triage", "danger");
    }
  };

  const handleDischarge = async (id) => {
    if (!window.confirm(`Authorize discharge for case ${id}?`)) return;
    try {
      const numericId = patients.find(p => p.id === id)?.numericId;
      if (!numericId) return;
      
      await deletePatient(numericId);
      addToast("Patient Discharged", `Case ${id} archived successfully.`, "success");
      fetchPatientData(); // refresh list
    } catch (err) {
      addToast("Error", "Failed to discharge patient", "danger");
    }
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
            <div className="d-flex gap-2 justify-content-end">
              <button className="btn btn-outline-secondary" onClick={() => setEditId(null)}>Cancel</button>
              <button className="btn btn-primary-gradient" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-panel p-4">
        <div className="table-responsive">
          <table className="premium-table w-100">
            <thead>
              <tr>
                {["Case ID","Patient","Priority","Department","Bed","Doctor","Time","Phase","Actions"].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? 
                <tr><td colSpan={9} className="text-center py-4"><span className="spinner-border spinner-border-sm me-2" /> Loading patients...</td></tr>
                : filtered.length === 0
                ? <tr><td colSpan={9} className="text-center text-muted py-4">No patients match active filters.</td></tr>
                : filtered.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.id}</strong></td>
                      <td>
                        <div className="fw-semibold">{p.name}</div>
                        <small className="text-muted">{p.gender}, {p.age} yrs</small>
                      </td>
                      <td><span className={`badge-severity ${SEV_CLS[p.severity]}`}>{p.severity}</span></td>
                      <td>{p.department}</td>
                      <td><span className="badge bg-light text-dark border">{p.assignedBed || "Waiting"}</span></td>
                      <td><small>{p.assignedDoctor || "Unassigned"}</small></td>
                      <td><small className="text-muted"><i className="bi bi-clock me-1" />{p.admittedTime}</small></td>
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
