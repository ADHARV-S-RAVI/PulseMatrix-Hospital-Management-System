/**
 * PatientDashboard.jsx  –  Pulse_Matrix Patient Self-Service Portal
 *
 * Shown after a patient logs in with their Case ID + Full Name.
 * Displays their personal case, treatment status, assigned doctor,
 * bed, severity, timeline, and vital stats — all from mock data.
 */
import { useApp } from "../context/AppContext";

const SEV_CLS = {
  Critical: "severity-critical",
  Major: "severity-major",
  Moderate: "severity-moderate",
  Minor: "severity-minor",
};

const STATUS_CLS = {
  "Newly Admitted": "bg-primary",
  "In Treatment": "bg-success",
  "Awaiting Scans": "bg-warning text-dark",
  Stable: "bg-info text-dark",
  Recovering: "bg-secondary",
  "Discharge Ready": "bg-dark",
};

const TIMELINE_ICONS = {
  "Newly Admitted": "bi-door-open",
  "In Treatment": "bi-activity",
  "Awaiting Scans": "bi-search",
  Stable: "bi-check-circle",
  Recovering: "bi-arrow-up-circle",
  "Discharge Ready": "bi-box-arrow-right",
};

const STATUS_ORDER = [
  "Newly Admitted",
  "Awaiting Scans",
  "In Treatment",
  "Stable",
  "Recovering",
  "Discharge Ready",
];

// Vital sign mock data per severity
function getMockVitals(severity) {
  const base = {
    Critical: { hr: 124, bp: "90/60", spo2: 88, temp: 39.8, rr: 28 },
    Major:    { hr: 108, bp: "105/70", spo2: 93, temp: 38.9, rr: 22 },
    Moderate: { hr: 92,  bp: "118/76", spo2: 96, temp: 37.8, rr: 18 },
    Minor:    { hr: 78,  bp: "122/80", spo2: 98, temp: 37.1, rr: 16 },
  };
  return base[severity] || base["Moderate"];
}

function VitalCard({ icon, label, value, unit, color, alert }) {
  return (
    <div className="pat-vital-card" style={{ borderTopColor: color }}>
      <div className="pat-vital-icon" style={{ color }}>
        <i className={`bi ${icon}`} />
      </div>
      <div className="pat-vital-value">
        {value}
        <span className="pat-vital-unit">{unit}</span>
      </div>
      <div className="pat-vital-label">{label}</div>
      {alert && (
        <div className="pat-vital-alert" style={{ color }}>
          <i className="bi bi-exclamation-triangle-fill me-1" />
          {alert}
        </div>
      )}
    </div>
  );
}

export default function PatientDashboard({ patientId, onLogout }) {
  const { patients, beds, doctors } = useApp();

  // Find the logged-in patient
  const patient = patients.find((p) => p.id === patientId);

  if (!patient) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
        <div className="text-center">
          <i className="bi bi-exclamation-circle display-4 text-danger mb-3" />
          <h3 className="fw-bold">Case Not Found</h3>
          <p className="text-muted">Your case record could not be loaded.</p>
          <button className="btn btn-primary-gradient" onClick={onLogout}>
            <i className="bi bi-box-arrow-left me-2" />
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const vitals = getMockVitals(patient.severity);
  const assignedDoctor = doctors.find((d) => d.name === patient.assignedDoctor);
  const assignedBed    = beds.find((b) => b.id === patient.assignedBed);
  const currentStepIdx = STATUS_ORDER.indexOf(patient.status);
  const progressPct    = Math.round(((currentStepIdx + 1) / STATUS_ORDER.length) * 100);

  const isCritical  = patient.severity === "Critical";
  const isMajor     = patient.severity === "Major";
  const showVitalAlert = isCritical || isMajor;

  return (
    <div className="pat-dashboard-root">
      {/* ── Top banner ───────────────────────────────────────── */}
      <div className={`pat-banner ${isCritical ? "pat-banner-critical" : isMajor ? "pat-banner-major" : "pat-banner-default"}`}>
        <div className="pat-banner-inner">
          <div className="pat-banner-left">
            <div className="pat-avatar-lg">
              {patient.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="pat-banner-info">
              <h1 className="pat-banner-name">{patient.name}</h1>
              <div className="pat-banner-meta">
                <span><i className="bi bi-hash me-1" />{patient.id}</span>
                <span><i className="bi bi-gender-ambiguous me-1" />{patient.gender}</span>
                <span><i className="bi bi-calendar3 me-1" />{patient.age} yrs</span>
                <span><i className="bi bi-building-fill-cross me-1" />{patient.department}</span>
              </div>
              <div className="d-flex align-items-center gap-2 mt-2">
                <span className={`badge-severity ${SEV_CLS[patient.severity]}`}>
                  {patient.severity}
                </span>
                <span className={`badge ${STATUS_CLS[patient.status] || "bg-secondary"}`}>
                  {patient.status}
                </span>
              </div>
            </div>
          </div>

          <div className="pat-banner-right">
            <button className="pat-logout-btn" onClick={onLogout}>
              <i className="bi bi-box-arrow-right me-1" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="pat-content">
        {/* ── Critical alert bar ───────────────────────────── */}
        {showVitalAlert && (
          <div className={`pat-alert-bar ${isCritical ? "pat-alert-critical" : "pat-alert-major"} mb-4`}>
            <i className={`bi ${isCritical ? "bi-exclamation-octagon-fill" : "bi-exclamation-triangle-fill"} me-2`} />
            {isCritical
              ? "CRITICAL ALERT: You are under continuous monitoring. Medical team has been notified."
              : "HIGH PRIORITY: Your case requires close observation. A nurse will check on you shortly."}
          </div>
        )}

        {/* ── Progress tracker ─────────────────────────────── */}
        <div className="glass-panel p-4 mb-4">
          <h2 className="fs-6 fw-bold mb-3">
            <i className="bi bi-clipboard2-pulse text-primary me-2" />
            Treatment Progress
          </h2>
          <div className="pat-progress-bar mb-3">
            <div className="pat-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="pat-timeline">
            {STATUS_ORDER.map((step, idx) => {
              const done    = idx < currentStepIdx;
              const current = idx === currentStepIdx;
              return (
                <div
                  key={step}
                  className={`pat-timeline-step ${done ? "tl-done" : current ? "tl-active" : "tl-pending"}`}
                >
                  <div className="pat-tl-icon">
                    <i className={`bi ${TIMELINE_ICONS[step] || "bi-circle"}`} />
                  </div>
                  <div className="pat-tl-label">{step}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Vitals ──────────────────────────────────────── */}
        <div className="glass-panel p-4 mb-4">
          <h2 className="fs-6 fw-bold mb-3">
            <i className="bi bi-heart-pulse text-danger me-2" />
            Live Vitals Monitor
            <span className="ms-2 badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 fw-normal" style={{ fontSize: "0.7rem" }}>
              <span className="status-dot" style={{ width: 6, height: 6 }} />
              Monitoring Active
            </span>
          </h2>
          <div className="pat-vitals-grid">
            <VitalCard
              icon="bi-heart-fill"
              label="Heart Rate"
              value={vitals.hr}
              unit=" bpm"
              color={vitals.hr > 110 ? "#f43f5e" : "#10b981"}
              alert={vitals.hr > 110 ? "Elevated" : null}
            />
            <VitalCard
              icon="bi-speedometer2"
              label="Blood Pressure"
              value={vitals.bp}
              unit=" mmHg"
              color={vitals.spo2 < 90 ? "#f43f5e" : "#0ea5e9"}
              alert={vitals.bp === "90/60" ? "Hypotensive" : null}
            />
            <VitalCard
              icon="bi-lungs-fill"
              label="SpO₂"
              value={vitals.spo2}
              unit="%"
              color={vitals.spo2 < 94 ? "#f59e0b" : "#10b981"}
              alert={vitals.spo2 < 94 ? "Monitor O₂" : null}
            />
            <VitalCard
              icon="bi-thermometer-half"
              label="Temperature"
              value={vitals.temp}
              unit="°C"
              color={vitals.temp > 38.5 ? "#f43f5e" : "#10b981"}
              alert={vitals.temp > 38.5 ? "Fever" : null}
            />
            <VitalCard
              icon="bi-wind"
              label="Resp. Rate"
              value={vitals.rr}
              unit="/min"
              color={vitals.rr > 20 ? "#f59e0b" : "#10b981"}
              alert={vitals.rr > 20 ? "Tachypnea" : null}
            />
          </div>
        </div>

        {/* ── Info cards row ───────────────────────────────── */}
        <div className="row g-4 mb-4">
          {/* Assigned Doctor */}
          <div className="col-md-6">
            <div className="glass-panel p-4 h-100">
              <h2 className="fs-6 fw-bold mb-3">
                <i className="bi bi-person-badge text-primary me-2" />
                Your Physician
              </h2>
              {assignedDoctor ? (
                <div className="pat-doc-card">
                  <div className="doctor-avatar" style={{ width: 52, height: 52, fontSize: "1.1rem" }}>
                    {assignedDoctor.name.replace("Dr. ", "").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="fw-bold text-dark">{assignedDoctor.name}</div>
                    <div className="text-muted small">{assignedDoctor.specialty}</div>
                    <span className={`badge mt-1 ${assignedDoctor.status === "Available" ? "bg-success bg-opacity-10 text-success border border-success border-opacity-25" : "bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25"}`}>
                      <i className="bi bi-circle-fill me-1" style={{ fontSize: "0.5rem" }} />
                      {assignedDoctor.status}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-muted fst-italic">
                  <i className="bi bi-person-x me-1" />
                  No doctor assigned yet — triage pool.
                </div>
              )}
            </div>
          </div>

          {/* Assigned Bed */}
          <div className="col-md-6">
            <div className="glass-panel p-4 h-100">
              <h2 className="fs-6 fw-bold mb-3">
                <i className="bi bi-hospital text-primary me-2" />
                Bed Assignment
              </h2>
              {assignedBed ? (
                <div className="pat-bed-info">
                  <div className="pat-bed-icon">
                    <i className="bi bi-hospital" />
                  </div>
                  <div>
                    <div className="fw-bold text-dark fs-5">{assignedBed.id}</div>
                    <div className="text-muted small">{assignedBed.type} · {assignedBed.department}</div>
                    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 mt-1">
                      <i className="bi bi-circle-fill me-1" style={{ fontSize: "0.5rem" }} />
                      Occupied – Your Bed
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-muted fst-italic">
                  <i className="bi bi-hourglass me-1" />
                  Awaiting bed assignment — please wait in the lobby.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Emergency contacts & info ────────────────────── */}
        <div className="glass-panel p-4 mb-4">
          <h2 className="fs-6 fw-bold mb-3">
            <i className="bi bi-info-circle text-primary me-2" />
            Case Information
          </h2>
          <div className="row g-3">
            <div className="col-sm-6 col-lg-3">
              <div className="pat-info-item">
                <div className="pat-info-label">Case ID</div>
                <div className="pat-info-value fw-bold text-primary">{patient.id}</div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="pat-info-item">
                <div className="pat-info-label">Department</div>
                <div className="pat-info-value">{patient.department}</div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="pat-info-item">
                <div className="pat-info-label">Admitted At</div>
                <div className="pat-info-value">{patient.admittedTime || "—"}</div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="pat-info-item">
                <div className="pat-info-label">Emergency Contact</div>
                <div className="pat-info-value">{patient.contact || "—"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Important notices ────────────────────────────── */}
        <div className="glass-panel p-4">
          <h2 className="fs-6 fw-bold mb-3">
            <i className="bi bi-bell text-primary me-2" />
            Patient Notices
          </h2>
          <ul className="pat-notices-list">
            <li>
              <i className="bi bi-check-circle-fill text-success me-2" />
              Your vitals are being monitored automatically every 15 minutes.
            </li>
            <li>
              <i className="bi bi-check-circle-fill text-success me-2" />
              Do not leave your designated area without notifying the nurse station.
            </li>
            <li>
              <i className="bi bi-exclamation-triangle-fill text-warning me-2" />
              Report any changes in symptoms immediately to the floor nurse.
            </li>
            {patient.severity === "Critical" && (
              <li>
                <i className="bi bi-exclamation-octagon-fill text-danger me-2" />
                ICU protocols are in effect. Visitors are restricted to 1 person per hour.
              </li>
            )}
            <li>
              <i className="bi bi-info-circle-fill text-primary me-2" />
              Your discharge will be processed once signed off by your physician.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
