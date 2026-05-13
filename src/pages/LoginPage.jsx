import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function LoginPage({ onLogin, prefilledRole = "admin", onBack }) {
  const { patients, registerPatient } = useApp();
  const role = prefilledRole; // role is fixed from the role selection screen

  const [isRegistering, setIsRegistering] = useState(false);

  // --- Admin Login state ---
  const [email,    setEmail]    = useState("admin@pulsematrix.hospital");
  const [password, setPassword] = useState("adminpassword");

  // --- Admin Registration state ---
  const [regAdminName,  setRegAdminName]  = useState("");
  const [regAdminEmail, setRegAdminEmail] = useState("");
  const [regAdminPass,  setRegAdminPass]  = useState("");

  // --- Patient Login state ---
  const [caseId,  setCaseId]  = useState("");
  const [patName, setPatName] = useState("");

  // --- Patient Registration state ---
  const [regPatName,    setRegPatName]    = useState("");
  const [regPatAge,     setRegPatAge]     = useState("");
  const [regPatGender,  setRegPatGender]  = useState("Female");
  const [regPatDept,    setRegPatDept]    = useState("Cardiology");
  const [regPatSev,     setRegPatSev]     = useState("Moderate");
  const [regPatContact, setRegPatContact] = useState("");

  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin   = role === "admin";
  const isPatient = role === "patient";

  // ── Handlers ───────────────────────────────────────────────
  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter credentials."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ role: "admin", userName: email.split("@")[0] });
    }, 800);
  };

  const handleAdminRegisterSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!regAdminName || !regAdminEmail || !regAdminPass) {
      setError("Please fill in all required administrator fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ role: "admin", userName: regAdminName.trim() });
    }, 800);
  };

  const handlePatientSubmit = (e) => {
    e.preventDefault();
    setError("");
    const id = caseId.trim().toUpperCase();
    const match = patients.find(
      p => p.id === id &&
           p.name.toLowerCase() === patName.trim().toLowerCase() &&
           p.status !== "Discharged"
    );
    if (!match) {
      setError("No active case found. Check your Case ID and full name.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ role: "patient", userName: match.name, patientId: match.id });
    }, 800);
  };

  const handlePatientRegisterSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!regPatName || !regPatAge) {
      setError("Please provide the patient's full name and age.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const nextId = `PT-2026-${String(patients.length + 1).padStart(3, "0")}`;
      const newPatData = {
        name: regPatName.trim(),
        age: Number(regPatAge),
        gender: regPatGender,
        department: regPatDept,
        severity: regPatSev,
        contact: regPatContact.trim() || "555-0199",
        assignedDoctor: regPatDept === "Cardiology" ? "Dr. Robert Chen" : regPatDept === "Trauma" ? "Dr. Sarah Jenkins" : "Dr. Amanda Ross",
        assignedBed: regPatSev === "Critical" ? "ICU-03" : "GEN-01",
      };
      registerPatient(newPatData);
      onLogin({ role: "patient", userName: newPatData.name, patientId: nextId });
    }, 800);
  };

  return (
    <div className="login-overlay d-flex align-items-center justify-content-center">
      <div className="login-blob blob-1" />
      <div className="login-blob blob-2" />
      <div className="login-blob blob-3" />

      <div className="login-card" style={{ maxWidth: isRegistering ? 520 : 460 }}>
        {/* Back button */}
        <button
          className="login-back-btn"
          onClick={() => {
            if (isRegistering) {
              setIsRegistering(false);
              setError("");
            } else {
              onBack();
            }
          }}
          type="button"
        >
          <i className="bi bi-arrow-left me-1" /> {isRegistering ? "Back to Login" : "Change Role"}
        </button>

        {/* Brand */}
        <div className="login-brand text-center mb-3">
          <div className="login-icon-wrap mx-auto mb-2" style={{ width: 60, height: 60 }}>
            <i className={`bi ${isAdmin ? "bi-shield-lock-fill" : "bi-person-fill-check"}`} style={{ fontSize: "1.5rem" }} />
          </div>
          <h2 className="text-white fw-bold mb-1 fs-4" style={{ fontFamily: "Outfit, sans-serif" }}>
            Pulse_Matrix
          </h2>
          <p className="text-secondary small mb-0">
            {isAdmin ? "Administrator Command Auth Portal" : "Patient Case Access Portal"}
          </p>
        </div>

        {/* Role indicator / Mode selector tabs */}
        <div className="d-flex justify-content-center gap-2 mb-4 bg-dark bg-opacity-25 p-1 rounded-3 border border-secondary border-opacity-25">
          <button
            type="button"
            className={`btn btn-sm w-50 rounded-2 fw-semibold ${!isRegistering ? (isAdmin ? "btn-primary" : "btn-success") : "btn-link text-secondary text-decoration-none"}`}
            onClick={() => { setIsRegistering(false); setError(""); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`btn btn-sm w-50 rounded-2 fw-semibold ${isRegistering ? (isAdmin ? "btn-primary" : "btn-success") : "btn-link text-secondary text-decoration-none"}`}
            onClick={() => { setIsRegistering(true); setError(""); }}
          >
            Register New
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════
           ADMINISTRATOR VIEWS
           ═══════════════════════════════════════════════════════════ */}
        {isAdmin && !isRegistering && (
          <form onSubmit={handleAdminSubmit}>
            <div className="mb-3 text-start">
              <label className="form-label small text-light fw-medium">Administrator Email</label>
              <div className="input-group">
                <span className="input-group-text login-input-prefix"><i className="bi bi-person-fill" /></span>
                <input
                  type="email"
                  className="form-control login-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@pulsematrix.hospital"
                  required
                />
              </div>
            </div>
            <div className="mb-4 text-start">
              <label className="form-label small text-light fw-medium">Authorization Key</label>
              <div className="input-group">
                <span className="input-group-text login-input-prefix"><i className="bi bi-shield-lock-fill" /></span>
                <input
                  type="password"
                  className="form-control login-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="form-text text-muted mt-1" style={{ fontSize: "0.75rem" }}>
                Demo credentials pre-filled.
              </div>
            </div>
            {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
            <button
              type="submit"
              className="btn btn-accent-gradient w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner-border spinner-border-sm" /> Verifying...</>
                : <><i className="bi bi-unlock-fill" /> Unlock Admin Dashboard</>
              }
            </button>
          </form>
        )}

        {isAdmin && isRegistering && (
          <form onSubmit={handleAdminRegisterSubmit}>
            <div className="mb-3 text-start">
              <label className="form-label small text-light fw-medium">Full Name</label>
              <div className="input-group">
                <span className="input-group-text login-input-prefix"><i className="bi bi-person-vcard" /></span>
                <input
                  type="text"
                  className="form-control login-input"
                  value={regAdminName}
                  onChange={e => setRegAdminName(e.target.value)}
                  placeholder="Commander Alex Mercer"
                  required
                />
              </div>
            </div>
            <div className="mb-3 text-start">
              <label className="form-label small text-light fw-medium">Official Work Email</label>
              <div className="input-group">
                <span className="input-group-text login-input-prefix"><i className="bi bi-envelope" /></span>
                <input
                  type="email"
                  className="form-control login-input"
                  value={regAdminEmail}
                  onChange={e => setRegAdminEmail(e.target.value)}
                  placeholder="alex@pulsematrix.hospital"
                  required
                />
              </div>
            </div>
            <div className="mb-4 text-start">
              <label className="form-label small text-light fw-medium">Create Secure Password</label>
              <div className="input-group">
                <span className="input-group-text login-input-prefix"><i className="bi bi-key" /></span>
                <input
                  type="password"
                  className="form-control login-input"
                  value={regAdminPass}
                  onChange={e => setRegAdminPass(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>
            {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
            <button
              type="submit"
              className="btn btn-primary-gradient w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner-border spinner-border-sm" /> Provisioning Account...</>
                : <><i className="bi bi-person-plus-fill" /> Provision & Enter Dashboard</>
              }
            </button>
          </form>
        )}

        {/* ═══════════════════════════════════════════════════════════
           PATIENT VIEWS
           ═══════════════════════════════════════════════════════════ */}
        {isPatient && !isRegistering && (
          <form onSubmit={handlePatientSubmit}>
            <div className="login-patient-hint mb-3 small">
              <i className="bi bi-info-circle me-1" />
              Use your <strong>Case ID</strong> (e.g. PT-2026-001) and the <strong>full name</strong> on your intake form.
            </div>
            <div className="mb-3 text-start">
              <label className="form-label small text-light fw-medium">Case ID</label>
              <div className="input-group">
                <span className="input-group-text login-input-prefix"><i className="bi bi-hash" /></span>
                <input
                  className="form-control login-input"
                  value={caseId}
                  onChange={e => setCaseId(e.target.value)}
                  placeholder="PT-2026-001"
                  required
                />
              </div>
            </div>
            <div className="mb-4 text-start">
              <label className="form-label small text-light fw-medium">Full Name (as registered)</label>
              <div className="input-group">
                <span className="input-group-text login-input-prefix"><i className="bi bi-person" /></span>
                <input
                  className="form-control login-input"
                  value={patName}
                  onChange={e => setPatName(e.target.value)}
                  placeholder="Eleanor Vance"
                  required
                />
              </div>
              <div className="form-text text-muted mt-1" style={{ fontSize: "0.75rem" }}>
                Try: <code className="text-info">PT-2026-001</code> / <code className="text-info">Eleanor Vance</code>
              </div>
            </div>
            {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
            <button
              type="submit"
              className="btn btn-primary-gradient w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner-border spinner-border-sm" /> Authenticating...</>
                : <><i className="bi bi-person-check-fill" /> View My Case</>
              }
            </button>
          </form>
        )}

        {isPatient && isRegistering && (
          <form onSubmit={handlePatientRegisterSubmit}>
            <div className="row g-2 mb-3 text-start">
              <div className="col-sm-8">
                <label className="form-label small text-light fw-medium">Full Name</label>
                <input
                  type="text"
                  className="form-control login-input form-control-sm py-2"
                  value={regPatName}
                  onChange={e => setRegPatName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div className="col-sm-4">
                <label className="form-label small text-light fw-medium">Age</label>
                <input
                  type="number"
                  className="form-control login-input form-control-sm py-2"
                  value={regPatAge}
                  onChange={e => setRegPatAge(e.target.value)}
                  placeholder="32"
                  min="1"
                  max="120"
                  required
                />
              </div>
            </div>

            <div className="row g-2 mb-3 text-start">
              <div className="col-sm-6">
                <label className="form-label small text-light fw-medium">Gender</label>
                <select
                  className="form-select login-input form-select-sm py-2"
                  value={regPatGender}
                  onChange={e => setRegPatGender(e.target.value)}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-sm-6">
                <label className="form-label small text-light fw-medium">Contact Number</label>
                <input
                  type="text"
                  className="form-control login-input form-control-sm py-2"
                  value={regPatContact}
                  onChange={e => setRegPatContact(e.target.value)}
                  placeholder="555-0199"
                />
              </div>
            </div>

            <div className="row g-2 mb-4 text-start">
              <div className="col-sm-6">
                <label className="form-label small text-light fw-medium">Department</label>
                <select
                  className="form-select login-input form-select-sm py-2"
                  value={regPatDept}
                  onChange={e => setRegPatDept(e.target.value)}
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Trauma">Trauma</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="General Surgery">General Surgery</option>
                </select>
              </div>
              <div className="col-sm-6">
                <label className="form-label small text-light fw-medium">Triage Severity</label>
                <select
                  className="form-select login-input form-select-sm py-2"
                  value={regPatSev}
                  onChange={e => setRegPatSev(e.target.value)}
                >
                  <option value="Critical" className="text-danger fw-bold">Critical</option>
                  <option value="Major" className="text-warning fw-bold">Major</option>
                  <option value="Moderate" className="text-info fw-bold">Moderate</option>
                  <option value="Minor" className="text-success fw-bold">Minor</option>
                </select>
              </div>
            </div>

            {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
            <button
              type="submit"
              className="btn btn-primary-gradient w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner-border spinner-border-sm" /> Generating Case File...</>
                : <><i className="bi bi-file-earmark-medical-fill" /> Generate Case & Enter Portal</>
              }
            </button>
          </form>
        )}

        <div className="pt-3 mt-3 border-top border-secondary border-opacity-25 text-muted small text-center">
          <i className="bi bi-shield-check me-1" /> Secure · HIPAA Compliant Infrastructure
        </div>
      </div>
    </div>
  );
}
