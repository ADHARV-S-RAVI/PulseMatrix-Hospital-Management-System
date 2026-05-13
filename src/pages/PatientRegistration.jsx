import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function PatientRegistration({ onNavigate, addToast }) {
  const { doctors, beds, registerPatient } = useApp();
  const availableBeds = beds.filter(b => b.status === "Available");

  const [form, setForm] = useState({
    name: "", age: "", gender: "Female", contact: "",
    department: "Trauma", severity: "Moderate",
    assignedDoctor: "", assignedBed: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.age || !form.department || !form.severity) {
      addToast("Validation Error", "Please fill all required fields.", "danger");
      return;
    }
    const p = registerPatient({ ...form, age: parseInt(form.age) });
    addToast("Ingest Accepted", `${p.name} (${p.id}) registered successfully.`, "success");
    setForm({ name: "", age: "", gender: "Female", contact: "", department: "Trauma", severity: "Moderate", assignedDoctor: "", assignedBed: "" });
    onNavigate("queue");
  };

  const Field = ({ label, children, hint }) => (
    <div className="col-12">
      <label className="form-label fw-medium">{label}</label>
      {children}
      {hint && <div className="form-text text-muted small">{hint}</div>}
    </div>
  );

  return (
    <div>
      <div className="mb-4 pb-2 border-bottom">
        <h2 className="fw-bold text-dark mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Patient Ingest &amp; Registration Portal</h2>
        <p className="text-muted small mb-0">Record emergency entries, assign severity, and pre-allocate hospital resources.</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-xl-9">
          <div className="glass-panel p-4 p-md-5">
            <form onSubmit={handleSubmit}>
              {/* Demographics */}
              <h3 className="fs-5 fw-bold text-primary mb-4 pb-2 border-bottom border-primary border-opacity-10">
                <i className="bi bi-file-earmark-person me-2" />Personal Demographics
              </h3>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-medium">Full Patient Name *</label>
                  <input className="form-control" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Amanda Sterling" required />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-medium">Age *</label>
                  <input type="number" className="form-control" value={form.age} onChange={e => set("age", e.target.value)} placeholder="Years" min={0} max={120} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-medium">Biological Sex</label>
                  <select className="form-select" value={form.gender} onChange={e => set("gender", e.target.value)}>
                    <option>Female</option><option>Male</option><option>Other</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">Emergency Contact Line</label>
                  <input className="form-control" value={form.contact} onChange={e => set("contact", e.target.value)} placeholder="Phone number or relative reference" />
                </div>
              </div>

              {/* Clinical Routing */}
              <h3 className="fs-5 fw-bold text-primary mb-4 pb-2 border-bottom border-primary border-opacity-10 mt-4">
                <i className="bi bi-clipboard2-pulse me-2" />Clinical Triage Routing
              </h3>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-medium">Destination Department *</label>
                  <select className="form-select" value={form.department} onChange={e => set("department", e.target.value)} required>
                    {["Trauma","Cardiology","Neurology","Pediatrics","General Surgery"].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Triage Priority / Severity *</label>
                  <select className="form-select" value={form.severity} onChange={e => set("severity", e.target.value)} required>
                    <option value="Critical">Critical – Immediate Response</option>
                    <option value="Major">Major – High Priority</option>
                    <option value="Moderate">Moderate – Standard Observation</option>
                    <option value="Minor">Minor – Non-Urgent Care</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Initial Responding Doctor</label>
                  <select className="form-select" value={form.assignedDoctor} onChange={e => set("assignedDoctor", e.target.value)}>
                    <option value="">-- None (Triage Pool) --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.name}>{d.name} – {d.specialty} {d.status !== "Available" ? `(${d.status})` : ""}</option>
                    ))}
                  </select>
                  <div className="form-text small text-muted">Assigned doctors reflect elevated workload count.</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Bay / Ward Bed Allocation</label>
                  <select className="form-select" value={form.assignedBed} onChange={e => set("assignedBed", e.target.value)}>
                    <option value="">-- None (Queue / Lobby) --</option>
                    {availableBeds.map(b => (
                      <option key={b.id} value={b.id}>{b.id} ({b.department} – {b.type})</option>
                    ))}
                  </select>
                  <div className="form-text small text-muted">Allocated beds shift automatically to Occupied.</div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-3 pt-3 border-top">
                <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setForm({ name:"",age:"",gender:"Female",contact:"",department:"Trauma",severity:"Moderate",assignedDoctor:"",assignedBed:"" })}>
                  Clear
                </button>
                <button type="submit" className="btn btn-primary-gradient px-5">
                  <i className="bi bi-check-lg me-1" /> Submit Ingest Record
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
