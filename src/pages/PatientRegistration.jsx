import { useState, useEffect } from "react";
import { addPatient, getDoctors, getBeds, calculateSeverity } from "../services/api";

export default function PatientRegistration({ onNavigate, addToast }) {
  const [doctors, setDoctors] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calcLoading, setCalcLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const docs = await getDoctors();
        const bds = await getBeds();
        setDoctors(docs);
        setBeds(bds);
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    }
    fetchData();
  }, []);

  const availableBeds = beds.filter(b => b.status === "Available");

  const [form, setForm] = useState({
    name: "", age: "", gender: "Female", contact: "",
    department: "Trauma", severity: "Medium", symptoms: "",
    severity_score: 50,
    assignedDoctor: "", assignedBed: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCalculateSeverity = async () => {
    if (!form.symptoms) {
      addToast("Info", "Enter symptoms first (e.g. Chest Pain, Fever)", "info");
      return;
    }
    setCalcLoading(true);
    try {
      const res = await calculateSeverity(form.symptoms);
      set("severity_score", res.score);
      set("severity", res.category);
      addToast("Severity Calculated", `Score: ${res.score} | Category: ${res.category}`, "info");
    } catch (err) {
      addToast("Error", "Failed to calculate severity", "danger");
    } finally {
      setCalcLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.age || !form.department) {
      addToast("Validation Error", "Please fill all required fields.", "danger");
      return;
    }
    setLoading(true);
    try {
      const newPatData = {
        ...form,
        age: Number(form.age),
        severity_score: form.severity_score,
        symptoms: form.symptoms || "Unknown"
      };
      
      const response = await addPatient(newPatData);
      addToast("Ingest Accepted", `${form.name} (ID: ${response.patient_id}) registered successfully.`, "success");
      setForm({ name: "", age: "", gender: "Female", contact: "", department: "Trauma", severity: "Medium", symptoms: "", severity_score: 50, assignedDoctor: "", assignedBed: "" });
      onNavigate("queue");
    } catch (err) {
      addToast("Registration Error", err.message || "Failed to register patient.", "danger");
    } finally {
      setLoading(false);
    }
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
                <div className="col-12 mb-3">
                  <label className="form-label fw-medium">Reported Symptoms *</label>
                  <div className="input-group">
                    <input className="form-control" value={form.symptoms} onChange={e => set("symptoms", e.target.value)} placeholder="e.g. Chest Pain, Difficulty Breathing, High Fever" required />
                    <button className="btn btn-outline-primary" type="button" onClick={handleCalculateSeverity} disabled={calcLoading}>
                      {calcLoading ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-cpu me-1" />}
                      Calculate Severity
                    </button>
                  </div>
                  <div className="form-text small text-muted">Separate multiple symptoms with commas. Uses weighted AI engine.</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Destination Department *</label>
                  <select className="form-select" value={form.department} onChange={e => set("department", e.target.value)} required>
                    {["Trauma","Cardiology","Neurology","Pediatrics","General Surgery"].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Triage Priority / Severity *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">{form.severity_score}</span>
                    <select className="form-select" value={form.severity} onChange={e => set("severity", e.target.value)} required>
                      <option value="Critical">Critical – Immediate Response</option>
                      <option value="High">High – High Priority</option>
                      <option value="Medium">Medium – Standard Observation</option>
                      <option value="Low">Low – Non-Urgent Care</option>
                    </select>
                  </div>
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
                <button type="submit" className="btn btn-primary-gradient px-5" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-check-lg me-1" />}
                  {loading ? "Submitting..." : "Submit Ingest Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
