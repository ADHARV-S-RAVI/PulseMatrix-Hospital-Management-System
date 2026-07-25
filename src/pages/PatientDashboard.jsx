import { useState, useEffect, useRef } from "react";
import { getPatient, createOperation } from "../services/api";
import { motion, AnimatePresence } from "motion/react";
import MedicalHeart3D from "../components/MedicalHeart3D";
import BioMatrixBackground from "../components/BioMatrixBackground";
import { PatientVitalsChart, OxygenChart, PainLevelChart } from "../components/Charts";

// New widget imports
import AppointmentCenter from "../components/PatientWidgets/AppointmentCenter";
import SecureMessaging from "../components/PatientWidgets/SecureMessaging";
import TelemedicinePortal from "../components/PatientWidgets/TelemedicinePortal";
import HealthDocumentVault from "../components/PatientWidgets/HealthDocumentVault";
import BillingInsurance from "../components/PatientWidgets/BillingInsurance";
import NotificationCenter from "../components/PatientWidgets/NotificationCenter";
import RecoveryGoals from "../components/PatientWidgets/RecoveryGoals";
import AIHealthAssistant from "../components/PatientWidgets/AIHealthAssistant";
import SmartBedMonitoring from "../components/PatientWidgets/SmartBedMonitoring";
import WearableIntegration from "../components/PatientWidgets/WearableIntegration";
import FamilyAccess from "../components/PatientWidgets/FamilyAccess";
import HospitalNavigation from "../components/PatientWidgets/HospitalNavigation";
import AccessibilityOptions from "../components/PatientWidgets/AccessibilityOptions";

// ─── Preserved helpers ─────────────────────────────────────
function AnimatedCounter({ value, color }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const num = parseFloat(value);
    if(isNaN(num)) { setCount(value); return; }
    const duration = 1500;
    const increment = num / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= num) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <motion.span style={{ color, textShadow: `0 0 10px ${color}` }}>{count}</motion.span>;
}

const SEV_CLS = {
  Critical: "severity-critical",
  Major: "severity-major",
  Moderate: "severity-moderate",
  Minor: "severity-minor",
};

const STATUS_CLS = {
  "Newly Admitted": "bg-primary",
  "In Treatment": "bg-success",
  "Awaiting Scans": "bg-warning",
  Stable: "bg-info",
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

const TIMELINE_TIMESTAMPS = {
  "Newly Admitted": "Jun 14, 09:15 AM",
  "Awaiting Scans": "Jun 14, 11:30 AM",
  "In Treatment": "Jun 15, 02:00 PM",
  "Stable": "Jun 16, 10:00 AM",
  "Recovering": "Jun 17, 08:00 AM",
  "Discharge Ready": "Pending",
};

const TIMELINE_PROGRESS = {
  "Newly Admitted": 100,
  "Awaiting Scans": 100,
  "In Treatment": 100,
  "Stable": 85,
  "Recovering": 40,
  "Discharge Ready": 0,
};

// Vital sign mock data per severity (preserved)
function getMockVitals(severity) {
  const base = {
    Critical: { hr: 124, bp: "90/60", spo2: 88, temp: 39.8, rr: 28, glucose: 210 },
    Major:    { hr: 108, bp: "105/70", spo2: 93, temp: 38.9, rr: 22, glucose: 165 },
    Moderate: { hr: 92,  bp: "118/76", spo2: 96, temp: 37.8, rr: 18, glucose: 115 },
    Minor:    { hr: 78,  bp: "122/80", spo2: 98, temp: 37.1, rr: 16, glucose: 95 },
  };
  return base[severity] || base["Moderate"];
}

// ECG Wave (preserved)
function ECGWave({ color }) {
  return (
    <div className="ecg-container">
      <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="ecg-svg">
        <motion.path
          d="M0 10 L10 10 L15 2 L20 18 L25 10 L40 10 L45 0 L50 20 L55 10 L70 10 L75 5 L80 15 L85 10 L100 10"
          fill="none" stroke={color} strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0.2, 0.5, 0.2], x: [0, -100] }}
          transition={{ pathLength: { duration: 2, ease: "easeInOut" }, opacity: { duration: 2, repeat: Infinity }, x: { duration: 3, repeat: Infinity, ease: "linear" } }}
        />
        <motion.path
          d="M100 10 L110 10 L115 2 L120 18 L125 10 L140 10 L145 0 L150 20 L155 10 L170 10 L175 5 L180 15 L185 10 L200 10"
          fill="none" stroke={color} strokeWidth="1"
          animate={{ x: [0, -100] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
}

// Vital Card (preserved)
function VitalCard({ icon, label, value, unit, color, alert }) {
  return (
    <motion.div
      className="pat-vital-card-v2"
      whileHover={{ scale: 1.05, y: -10 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="vital-card-glow" style={{ background: color }} />
      <ECGWave color={color} />
      <div className="vital-card-content">
        <div className="vital-header">
          <i className={`bi ${icon}`} style={{ color, textShadow: `0 0 10px ${color}` }} />
          <span>{label}</span>
        </div>
        <div className="vital-body">
          <span className="vital-value"><AnimatedCounter value={value} color={color} /></span>
          <span className="vital-unit" style={{ color: "rgba(255,255,255,0.5)" }}>{unit}</span>
        </div>
        {alert && (
          <div className="vital-alert-tag" style={{ color }}>
            <i className="bi bi-exclamation-triangle-fill" /> {alert}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Mock Medication & Diet Data (preserved + enhanced)
const MEDS = [
  { name: "Ceftriaxone", dose: "1g IV", time: "08:00 AM", status: "Taken", nurse: "RN Williams", takenAt: "08:05 AM" },
  { name: "Paracetamol", dose: "500mg PO", time: "12:30 PM", status: "Upcoming", nurse: null, takenAt: null },
  { name: "Metoprolol", dose: "25mg PO", time: "04:00 PM", status: "Pending", nurse: null, takenAt: null },
  { name: "Heparin", dose: "5000U SC", time: "08:00 PM", status: "Pending", nurse: null, takenAt: null },
];

const DIET = [
  { meal: "Breakfast", menu: "Low Sodium Porridge + Fruit", status: "Delivered", calories: 420, time: "07:30 AM" },
  { meal: "Lunch", menu: "Steamed Fish + Veggie Puree", status: "Scheduled", calories: 550, time: "12:30 PM" },
  { meal: "Dinner", menu: "Grilled Chicken + Brown Rice", status: "Scheduled", calories: 620, time: "06:30 PM" },
];

// ─── Tab definitions ────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview", icon: "bi-grid" },
  { id: "records", label: "Medical Records", icon: "bi-file-medical" },
  { id: "treatment", label: "Treatment", icon: "bi-capsule" },
  { id: "monitoring", label: "Monitoring", icon: "bi-activity" },
  { id: "services", label: "Services", icon: "bi-headset" },
  { id: "support", label: "Support", icon: "bi-shield-check" },
];

// ═════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════
export default function PatientDashboard({ patientId, onLogout }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [helpRequesting, setHelpRequesting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [vitalsExpanded, setVitalsExpanded] = useState(false);
  const [diagExpanded, setDiagExpanded] = useState(null);

  // Preserved data fetch logic
  useEffect(() => {
    async function fetchPatientData() {
      try {
        const data = await getPatient(patientId);
        const localPatients = JSON.parse(localStorage.getItem("pm_patients") || "[]");
        const localData = localPatients.find(p => p.id === `PT-${patientId}` || p.patient_id === patientId || p.name === data.name);

        let severity = "Minor";
        if (data.severity_score >= 90) severity = "Critical";
        else if (data.severity_score >= 70) severity = "Major";
        else if (data.severity_score >= 50) severity = "Moderate";

        setPatient({
          ...data,
          id: localData?.id || `PT-2026-${String(data.patient_id || 1).padStart(3, '0')}`,
          severity: localData?.severity || severity,
          status: localData?.status || "In Treatment",
          assignedDoctor: data.assignedDoctor || localData?.assignedDoctor || "Triage Pool",
          assignedBed: data.assignedBed || localData?.assignedBed || "Pending",
          admittedTime: localData?.admittedTime || new Date(data.admission_date).toLocaleString(),
          contact: localData?.contact || "555-0199"
        });
      } catch (err) {
        setError("Case record could not be synced.");
      } finally {
        setLoading(false);
      }
    }
    if (patientId) fetchPatientData();
  }, [patientId]);

  // Loading state (preserved)
  if (loading) return (
    <div className="hud-loader">
      <BioMatrixBackground />
      <div className="loader-orbit">
        <div className="orbit-ring" />
        <div className="orbit-text">SYNCING PATIENT RECORDS...</div>
      </div>
    </div>
  );

  if (error || !patient) return (
    <div className="hud-loader">
      <BioMatrixBackground />
      <div className="text-center text-white">
        <i className="bi bi-exclamation-triangle" style={{ fontSize: "3rem", color: "#f43f5e" }} />
        <div className="mt-3 fw-bold">{error || "Unable to load patient data"}</div>
        <button onClick={onLogout} className="btn btn-outline-danger mt-3">Return to Login</button>
      </div>
    </div>
  );

  const vitals = getMockVitals(patient.severity);
  const currentStepIdx = STATUS_ORDER.indexOf(patient.status);
  const themeColor = patient.severity === "Critical" ? "#f43f5e" : patient.severity === "Major" ? "#f59e0b" : "#0ea5e9";

  // Handle SOS emergency code
  const handleHelp = async () => {
    if (helpRequesting) return;
    setHelpRequesting(true);
    try {
      await createOperation(patientId, {
        operation_type: "emergency_code",
        doctor_id: 1, // Default doctor if no assigned doctor exists
        priority: "Critical",
        details: { triggered_by: "Patient Dashboard (SOS)" }
      });
    } catch (e) {
      console.error("SOS Error:", e);
    }
    setTimeout(() => setHelpRequesting(false), 3000);
  };

  // ─── Estimated discharge calculation ──────────────────────
  const dischargeHours = patient.prognosis?.estimated_discharge_hours || (patient.severity === "Critical" ? 96 : patient.severity === "Major" ? 72 : 48);
  const admDate = patient.admission_date ? new Date(patient.admission_date) : new Date();
  const estDischarge = new Date(admDate.getTime() + dischargeHours * 60 * 60 * 1000);

  // Next medication countdown
  const nextMed = MEDS.find(m => m.status === "Upcoming" || m.status === "Pending");
  const calTarget = 1800;
  const calConsumed = DIET.filter(d => d.status === "Delivered").reduce((s, d) => s + d.calories, 0);
  const hydrationGoal = 2500; // mL
  const hydrationCurrent = 1200;

  // ═══════════════════════════════════════════════════════════
  // TAB CONTENT RENDERERS
  // ═══════════════════════════════════════════════════════════

  const renderOverview = () => (
    <>
      {/* Vitals HUD (preserved + enhanced) */}
      <motion.div
        className="glass-panel p-4 mb-4 hud-card"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0, boxShadow: `0 0 30px ${themeColor}22` }}
        transition={{ boxShadow: { repeat: Infinity, duration: 3, ease: "easeInOut" } }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="hud-card-title"><i className="bi bi-activity me-2" />Biometric Monitoring</h3>
          <div className="hud-telemetry-tag" style={{ borderColor: themeColor, color: themeColor }}>LIVE TELEMETRY</div>
        </div>
        <div className="row g-3 mb-4">
          <div className="col-md-4 col-6"><VitalCard icon="bi-heart-fill" label="Heart Rate" value={vitals.hr} unit="BPM" color="#f43f5e" alert={vitals.hr > 110 ? "Elevated" : null} /></div>
          <div className="col-md-4 col-6"><VitalCard icon="bi-speedometer2" label="Blood Pressure" value={vitals.bp} unit="mmHg" color="#0ea5e9" /></div>
          <div className="col-md-4 col-6"><VitalCard icon="bi-lungs" label="SpO2" value={vitals.spo2} unit="%" color="#10b981" /></div>
          <div className="col-md-4 col-6"><VitalCard icon="bi-wind" label="Resp. Rate" value={vitals.rr} unit="/min" color="#06b6d4" alert={vitals.rr > 24 ? "High" : null} /></div>
          <div className="col-md-4 col-6"><VitalCard icon="bi-thermometer-half" label="Temperature" value={vitals.temp} unit="°C" color="#f59e0b" alert={vitals.temp > 38.5 ? "Fever" : null} /></div>
          <div className="col-md-4 col-6"><VitalCard icon="bi-droplet-fill" label="Glucose" value={vitals.glucose} unit="mg/dL" color="#8b5cf6" alert={vitals.glucose > 180 ? "High" : null} /></div>
        </div>

        <div className="vital-chart-container" style={{ height: 260, position: "relative" }}>
          <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10, fontSize: "0.65rem", fontWeight: "bold", color: themeColor, letterSpacing: 1 }}>VITALS TREND (8H)</div>
          <PatientVitalsChart color={themeColor} />
        </div>

        {/* Expandable Vital History */}
        <button onClick={() => setVitalsExpanded(!vitalsExpanded)} className="btn btn-sm w-100 mt-3 d-flex align-items-center justify-content-center gap-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: "0.7rem" }}>
          <i className={`bi ${vitalsExpanded ? "bi-chevron-up" : "bi-chevron-down"}`} />
          {vitalsExpanded ? "Hide" : "Show"} Vital History
        </button>
        <AnimatePresence>
          {vitalsExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-3 p-3 rounded-2" style={{ background: "rgba(0,0,0,0.2)" }}>
                <table className="w-100" style={{ fontSize: "0.65rem", color: "#94a3b8" }}>
                  <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <th className="py-1 text-muted">Time</th><th className="text-muted">HR</th><th className="text-muted">BP</th><th className="text-muted">SpO2</th><th className="text-muted">Temp</th>
                  </tr></thead>
                  <tbody>
                    {[["06:00", "82", "120/80", "97%", "37.2°C"], ["08:00", "88", "118/78", "96%", "37.4°C"], ["10:00", vitals.hr, vitals.bp, `${vitals.spo2}%`, `${vitals.temp}°C`]].map(([t, ...vals], i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td className="py-1 text-white">{t}</td>{vals.map((v, j) => <td key={j} className="text-white">{v}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Care Path + Physician (side by side) */}
      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          {/* Care Path Tracking (preserved + enhanced) */}
          <motion.div className="glass-panel p-4 hud-card h-100" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="hud-card-title mb-4"><i className="bi bi-signpost-split me-2" />Treatment Journey</h3>
            <div className="hud-timeline">
              {STATUS_ORDER.map((step, i) => (
                <div key={step} className={`hud-timeline-node ${i === currentStepIdx ? "active" : i < currentStepIdx ? "done" : ""}`}>
                  <div className="node-marker"><i className={`bi ${TIMELINE_ICONS[step]}`} /></div>
                  <div className="flex-grow-1">
                    <div className="node-label x-small">{step}</div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span style={{ fontSize: "0.55rem", color: "#64748b" }}>{TIMELINE_TIMESTAMPS[step]}</span>
                      <span style={{ fontSize: "0.55rem", color: i <= currentStepIdx ? "#10b981" : "#475569" }}>{TIMELINE_PROGRESS[step] || 0}%</span>
                    </div>
                    {i <= currentStepIdx && (
                      <div className="progress mt-1" style={{ height: 2, background: "rgba(255,255,255,0.05)" }}>
                        <div className="progress-bar" style={{ width: `${TIMELINE_PROGRESS[step] || 0}%`, background: i === currentStepIdx ? "#0ea5e9" : "#10b981" }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="col-lg-5">
          {/* Attending Physician (preserved, label updated) */}
          <motion.div className="glass-panel p-4 mb-4 hud-card" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="hud-card-title mb-3"><i className="bi bi-person-badge me-2" />Attending Physician</h3>
            <div className="hud-doc-info">
              <div className="doc-avatar-hex"><div className="hex-inner">DR</div></div>
              <div className="doc-details">
                <div className="doc-name">{patient.assignedDoctor || "Triage Pool"}</div>
                <div className="doc-rank">LEAD CLINICIAN</div>
                <div className="doc-status"><span className="status-blip" /> ONLINE</div>
              </div>
            </div>
          </motion.div>

          {/* AI Health Prognosis (preserved + enhanced) */}
          <motion.div className="glass-panel p-4 hud-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="hud-card-title mb-3"><i className="bi bi-cpu me-2" />AI Clinical Insights</h3>
            <div className="d-flex flex-column gap-3">
              <div>
                <div className="d-flex justify-content-between x-small fw-bold mb-1">
                  <span className="text-muted">Recovery Probability</span>
                  <span className="text-success" style={{ textShadow: "0 0 5px rgba(16,185,129,0.5)" }}><AnimatedCounter value={patient.prognosis?.recovery_probability || 78} color="#10b981" />%</span>
                </div>
                <div className="progress" style={{ height: 4, background: "rgba(255,255,255,0.05)", overflow: 'visible' }}>
                  <div className="progress-bar bg-success" style={{ width: `${patient.prognosis?.recovery_probability || 78}%`, boxShadow: "0 0 10px #10b981", position: 'relative' }}>
                    <div style={{ position: "absolute", right: 0, top: -2, width: 8, height: 8, borderRadius: "50%", background: "#fff", boxShadow: "0 0 10px #10b981" }} />
                  </div>
                </div>
              </div>
              <div>
                <div className="d-flex justify-content-between x-small fw-bold mb-1">
                  <span className="text-muted">Complication Risk</span>
                  <span className="text-danger" style={{ textShadow: "0 0 5px rgba(244,63,94,0.5)" }}><AnimatedCounter value={patient.prognosis?.deterioration_risk || 15} color="#f43f5e" />%</span>
                </div>
                <div className="progress" style={{ height: 4, background: "rgba(255,255,255,0.05)", overflow: 'visible' }}>
                  <div className="progress-bar bg-danger" style={{ width: `${patient.prognosis?.deterioration_risk || 15}%`, boxShadow: "0 0 10px #f43f5e", position: 'relative' }}>
                    <div style={{ position: "absolute", right: 0, top: -2, width: 8, height: 8, borderRadius: "50%", background: "#fff", boxShadow: "0 0 10px #f43f5e" }} />
                  </div>
                </div>
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <div className="p-2 rounded-2 text-center" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.12)" }}>
                    <div style={{ fontSize: "0.55rem", color: "#64748b" }}>Discharge Readiness</div>
                    <div className="fw-bold text-info">62%</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2 rounded-2 text-center" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}>
                    <div style={{ fontSize: "0.55rem", color: "#64748b" }}>Treatment Response</div>
                    <div className="fw-bold text-success">Good</div>
                  </div>
                </div>
              </div>
              <div className="p-2 rounded-2 text-center" style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.3)", boxShadow: "inset 0 0 15px rgba(14,165,233,0.1)" }}>
                <div className="x-small text-info fw-bold mb-1">ESTIMATED DISCHARGE</div>
                <div className="fw-bold fs-6 text-white" style={{ textShadow: "0 0 10px rgba(255,255,255,0.5)" }}>{estDischarge.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {dischargeHours}h</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recovery Goals */}
      <RecoveryGoals />
    </>
  );

  const renderRecords = () => (
    <>
      {/* Diagnostics & Lab Results (preserved + enhanced) */}
      <motion.div className="glass-panel p-4 mb-4 hud-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="hud-card-title mb-4"><i className="bi bi-file-medical me-2" />Diagnostics & Lab Results</h3>
        <div className="row g-3">
          {(patient.diagnostics || []).map((diag, idx) => (
            <div className="col-md-6" key={diag.name}>
              <div className="p-3 rounded h-100" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${diagExpanded === idx ? `${diag.color}40` : "rgba(255,255,255,0.05)"}`, transition: "all 0.3s", cursor: "pointer" }} onClick={() => setDiagExpanded(diagExpanded === idx ? null : idx)}>
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-bold" style={{ color: diag.color, textShadow: `0 0 5px ${diag.color}` }}><i className={`bi ${idx === 0 ? "bi-droplet-fill" : "bi-upc-scan"} me-2`} />{diag.name}</span>
                  <span className="badge x-small" style={{ background: diag.color, boxShadow: `0 0 10px ${diag.color}66` }}>{diag.status}</span>
                </div>
                <div className="x-small text-muted lh-lg mt-2">
                  {diag.status === "ANALYZING" ? (
                    <div>
                      <div className="d-flex justify-content-between mb-1"><span>AI Processing</span><span>68%</span></div>
                      <div className="progress mb-2" style={{ height: 3, background: "rgba(255,255,255,0.1)" }}>
                        <div className="progress-bar bg-warning progress-bar-striped progress-bar-animated" style={{ width: "68%" }} />
                      </div>
                      <div style={{ fontSize: '0.6rem' }}>{diag.details}</div>
                    </div>
                  ) : (
                    <div style={{ whiteSpace: "pre-line" }}>{diag.details}</div>
                  )}
                </div>
                {diagExpanded === idx && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <button className="btn btn-sm px-3" style={{ background: "rgba(14,165,233,0.1)", color: "#0ea5e9", border: "1px solid rgba(14,165,233,0.2)", fontSize: "0.6rem" }}>
                      <i className="bi bi-download me-1" />Download Report (PDF)
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          ))}
          {(!patient.diagnostics || patient.diagnostics.length === 0) && (
            <div className="col-12 text-center p-4" style={{ color: "#64748b", fontSize: "0.8rem" }}>
              <i className="bi bi-clipboard2-pulse" style={{ fontSize: "2rem", display: "block", marginBottom: 8 }} />
              No diagnostic results available yet. Tests may be processing.
            </div>
          )}
        </div>
      </motion.div>

      {/* Health Document Vault */}
      <HealthDocumentVault />
    </>
  );

  const renderTreatment = () => (
    <>
      <div className="row g-4 mb-4">
        {/* Enhanced Digital Pillbox */}
        <div className="col-md-6">
          <motion.div className="glass-panel p-4 h-100 hud-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="hud-card-title mb-0"><i className="bi bi-capsule me-2" />Digital Pillbox</h3>
              {nextMed && (
                <span className="badge" style={{ background: "rgba(14,165,233,0.15)", color: "#0ea5e9", fontSize: "0.55rem" }}>
                  Next: {nextMed.time}
                </span>
              )}
            </div>
            <div className="hud-med-list">
              {(patient.meds || MEDS).map(m => (
                <div key={m.name} className="hud-med-item">
                  <div>
                    <div className="fw-bold small">{m.name}</div>
                    <div className="x-small text-muted">{m.dose} · {m.time}</div>
                    {m.nurse && <div style={{ fontSize: "0.55rem", color: "#10b981" }}>Administered by {m.nurse} at {m.takenAt}</div>}
                    {m.status === "Upcoming" && <div style={{ fontSize: "0.55rem", color: "#f59e0b" }}><i className="bi bi-clock me-1" />Reminder set</div>}
                  </div>
                  <span className={`badge ${m.status === 'Taken' ? 'bg-success' : m.status === 'Upcoming' ? 'bg-warning' : 'bg-primary'} x-small`}>{m.status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Enhanced Meal Plan */}
        <div className="col-md-6">
          <motion.div className="glass-panel p-4 h-100 hud-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="hud-card-title mb-3"><i className="bi bi-cup-hot-fill me-2" />Nutrition Management</h3>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <div className="p-2 rounded-2 text-center" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)" }}>
                  <div style={{ fontSize: "0.55rem", color: "#64748b" }}>Calories</div>
                  <div className="fw-bold small" style={{ color: "#f59e0b" }}>{calConsumed} / {calTarget}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-2 rounded-2 text-center" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.12)" }}>
                  <div style={{ fontSize: "0.55rem", color: "#64748b" }}>Hydration</div>
                  <div className="fw-bold small" style={{ color: "#0ea5e9" }}>{hydrationCurrent} / {hydrationGoal} mL</div>
                </div>
              </div>
            </div>
            <div className="mb-2"><span className="badge" style={{ background: "rgba(244,63,94,0.1)", color: "#f43f5e", fontSize: "0.55rem" }}>Low Sodium</span> <span className="badge ms-1" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", fontSize: "0.55rem" }}>Heart-Healthy</span></div>
            <div className="hud-med-list">
              {DIET.map(d => (
                <div key={d.meal} className="hud-med-item">
                  <div>
                    <div className="fw-bold small">{d.meal} <span style={{ fontSize: "0.55rem", color: "#64748b" }}>({d.time})</span></div>
                    <div className="x-small text-muted">{d.menu}</div>
                    <div style={{ fontSize: "0.55rem", color: "#f59e0b" }}>{d.calories} kcal</div>
                  </div>
                  <i className={`bi ${d.status === 'Delivered' ? 'bi-check-circle-fill text-success' : 'bi-clock text-primary'}`} />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* IV Therapy Monitoring (renamed from IV Nanobot Infusion) */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <motion.div className="glass-panel p-3 hud-card h-100" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="hud-card-title mb-3"><i className="bi bi-funnel-fill me-2" />IV Therapy Monitoring</h3>
            <div className="d-flex justify-content-between x-small mb-1"><span className="text-muted">Flow Rate</span><span className="text-primary fw-bold">125 mL/hr</span></div>
            <div className="progress mb-3" style={{ height: 4, background: "rgba(255,255,255,0.05)" }}>
              <div className="progress-bar bg-primary progress-bar-striped progress-bar-animated" style={{ width: "100%" }} />
            </div>
            <div className="d-flex justify-content-between x-small mb-1"><span className="text-muted">Current IV Drug</span><span className="text-white fw-bold">Normal Saline 0.9%</span></div>
            <div className="d-flex justify-content-between x-small mb-1"><span className="text-muted">Volume Remaining</span><span className="text-warning fw-bold" style={{ animation: "blink 1.5s infinite" }}>450 mL</span></div>
            <div className="x-small text-muted" style={{ fontSize: "0.6rem" }}>Estimated completion: 3.6 hours</div>
          </motion.div>
        </div>
        <div className="col-md-6">
          <motion.div className="glass-panel p-3 hud-card h-100" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="hud-card-title mb-3"><i className="bi bi-activity me-2" />Neurological Monitoring</h3>
            <div className="d-flex justify-content-between x-small mb-2"><span className="text-muted">EEG Activity Level</span><span className="text-info fw-bold" style={{ textShadow: "0 0 5px #0ea5e9" }}>9.5 Hz</span></div>
            <div className="ecg-container" style={{ height: 30, background: "rgba(14,165,233,0.1)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
              <svg viewBox="0 0 100 20" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                <motion.path d="M0 10 Q 5 0, 10 10 T 20 10 T 30 10 T 40 10 T 50 10 T 60 10 T 70 10 T 80 10 T 90 10 T 100 10" fill="none" stroke="#0ea5e9" strokeWidth="1" animate={{ x: [0, -50] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} />
              </svg>
            </div>
            <div className="x-small text-muted mt-2">Cognitive state: <span className="text-success">Resting</span></div>
          </motion.div>
        </div>
      </div>

      {/* Pain Management Protocol (preserved) */}
      <motion.div className="glass-panel p-4 mb-4 hud-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="hud-card-title mb-4"><i className="bi bi-bandaid me-2" />Pain Management Protocol</h3>
        <div className="vital-chart-container" style={{ height: 200, position: "relative" }}>
          <PainLevelChart color="#f59e0b" />
        </div>
      </motion.div>

      {/* Respiratory & Oxygen Telemetry (preserved) */}
      <motion.div className="glass-panel p-4 hud-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="hud-card-title mb-4"><i className="bi bi-lungs-fill me-2" />Respiratory & Oxygen Telemetry</h3>
        <div className="vital-chart-container" style={{ height: 200, position: "relative" }}>
          <OxygenChart color="#10b981" />
        </div>
      </motion.div>
    </>
  );

  const renderMonitoring = () => (
    <>
      <div className="row g-4 mb-4">
        {/* Fluid Balance (preserved) */}
        <div className="col-md-6">
          <motion.div className="glass-panel p-3 hud-card h-100" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="hud-card-title mb-3"><i className="bi bi-droplet-half me-2" />Fluid Balance</h3>
            <div className="d-flex justify-content-between x-small mb-2"><span className="text-muted">Intake (24h)</span><span className="text-info fw-bold">2450 mL</span></div>
            <div className="d-flex justify-content-between x-small mb-2"><span className="text-muted">Output (24h)</span><span className="text-warning fw-bold">2100 mL</span></div>
            <div className="progress" style={{ height: 4, background: "rgba(255,255,255,0.05)" }}>
              <div className="progress-bar bg-info" style={{ width: "55%" }} />
              <div className="progress-bar bg-warning" style={{ width: "45%" }} />
            </div>
          </motion.div>
        </div>
        {/* Blood Gas Analyzer (preserved) */}
        <div className="col-md-6">
          <motion.div className="glass-panel p-3 hud-card h-100" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="hud-card-title mb-3"><i className="bi bi-lungs me-2" />Blood Gas Analysis</h3>
            <div className="d-flex justify-content-between x-small mb-1"><span className="text-muted">pH Level</span><span className="text-success fw-bold">7.38</span></div>
            <div className="d-flex justify-content-between x-small mb-1"><span className="text-muted">pCO2</span><span className="text-white">42 mmHg</span></div>
            <div className="d-flex justify-content-between x-small"><span className="text-muted">pO2</span><span className="text-info">95 mmHg</span></div>
          </motion.div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Dialysis Filter Load (preserved) */}
        <div className="col-md-6">
          <motion.div className="glass-panel p-3 hud-card h-100" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="hud-card-title mb-3"><i className="bi bi-funnel me-2" />Dialysis Monitoring</h3>
            <div className="d-flex justify-content-between x-small mb-1"><span className="text-muted">Filter Saturation</span><span className="text-warning fw-bold">74%</span></div>
            <div className="progress mb-2" style={{ height: 4, background: "rgba(255,255,255,0.05)" }}>
              <div className="progress-bar bg-warning progress-bar-striped" style={{ width: "74%" }} />
            </div>
          </motion.div>
        </div>
        {/* Central Line Status (preserved) */}
        <div className="col-md-6">
          <motion.div className="glass-panel p-3 hud-card h-100" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="hud-card-title mb-3"><i className="bi bi-usb-symbol me-2" />Central Line Monitoring</h3>
            <div className="d-flex justify-content-between x-small mb-1"><span className="text-muted">Insertion Site</span><span className="text-success">Clean</span></div>
            <div className="d-flex justify-content-between x-small mb-1"><span className="text-muted">Patency</span><span className="text-success fw-bold">Optimal</span></div>
          </motion.div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6"><SmartBedMonitoring /></div>
        <div className="col-md-6"><WearableIntegration /></div>
      </div>

      {/* Room Environment Monitoring (renamed from Atmospheric Canopy) */}
      <motion.div className="glass-panel p-4 mb-4 hud-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="hud-card-title mb-3"><i className="bi bi-cloud-haze2 me-2" />Room Environment Monitoring</h3>
        <div className="row g-3">
          <div className="col-md-4"><div className="d-flex justify-content-between x-small"><span className="text-muted">O2 Concentration</span><span className="text-info fw-bold">28%</span></div></div>
          <div className="col-md-4"><div className="d-flex justify-content-between x-small"><span className="text-muted">Room Temperature</span><span className="text-white">22.5°C</span></div></div>
          <div className="col-md-4"><div className="d-flex justify-content-between x-small"><span className="text-muted">Air Humidity</span><span className="text-white">45%</span></div></div>
        </div>
      </motion.div>

      {/* Organ Health Assessment (renamed from Organ Viability Index) */}
      <div className="row g-4">
        <div className="col-md-6">
          <motion.div className="glass-panel p-4 hud-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="hud-card-title mb-3"><i className="bi bi-heart-pulse me-2" />Organ Health Assessment</h3>
            <div className="d-flex justify-content-between x-small mb-2"><span className="text-muted">Hepatic Function</span><span className="text-success">96%</span></div>
            <div className="d-flex justify-content-between x-small mb-2"><span className="text-muted">Renal Function</span><span className="text-success">92%</span></div>
            <div className="d-flex justify-content-between x-small"><span className="text-muted">Cardiac Function</span><span className="text-info fw-bold">89%</span></div>
          </motion.div>
        </div>
        <div className="col-md-6">
          <motion.div className="glass-panel p-4 hud-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="hud-card-title mb-3"><i className="bi bi-clipboard2-pulse me-2" />Lab Processing Status</h3>
            <div className="d-flex justify-content-between x-small mb-1"><span className="text-muted">Processing</span><span className="text-info fw-bold">88%</span></div>
            <div className="progress" style={{ height: 3, background: "rgba(255,255,255,0.05)" }}>
              <div className="progress-bar bg-info progress-bar-striped progress-bar-animated" style={{ width: "88%" }} />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );

  const renderServices = () => (
    <>
      <div className="row g-4 mb-4">
        <div className="col-lg-7"><AppointmentCenter /></div>
        <div className="col-lg-5"><TelemedicinePortal /></div>
      </div>
      <div className="row g-4 mb-4">
        <div className="col-lg-7"><SecureMessaging /></div>
        <div className="col-lg-5"><BillingInsurance /></div>
      </div>
    </>
  );

  const renderSupport = () => (
    <>
      <div className="row g-4 mb-4">
        <div className="col-lg-6"><NotificationCenter /></div>
        <div className="col-lg-6"><FamilyAccess /></div>
      </div>
      <div className="row g-4 mb-4">
        <div className="col-lg-6"><HospitalNavigation patient={patient} /></div>
        <div className="col-lg-6"><AccessibilityOptions /></div>
      </div>

      {/* Emergency Equipment Status (renamed from Automated Defibrillator) */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <motion.div className="glass-panel p-4 hud-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="hud-card-title mb-3"><i className="bi bi-lightning-charge me-2" />Emergency Equipment Status</h3>
            <div className="d-flex justify-content-between x-small mb-2"><span className="text-muted">Defibrillator</span><span className="text-success fw-bold" style={{ animation: "blink 2s infinite" }}>READY</span></div>
            <div className="d-flex justify-content-between x-small"><span className="text-muted">Energy Setting</span><span className="text-white">200 Joules</span></div>
          </motion.div>
        </div>
        <div className="col-md-6">
          <motion.div className="glass-panel p-4 hud-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="hud-card-title mb-3"><i className="bi bi-fingerprint me-2" />Patient Identity Verification</h3>
            <div className="d-flex align-items-center gap-2 mb-2 p-2 rounded" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <i className="bi bi-shield-check text-success" />
              <div className="x-small">
                <div className="text-success fw-bold">Level 1 Clearance</div>
                <div className="text-muted" style={{ fontSize: "0.6rem" }}>Next of Kin Verified</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Telemedicine Readiness (renamed from Remote Surgery Link) */}
      <motion.div className="glass-panel p-4 hud-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="hud-card-title mb-3"><i className="bi bi-hdd-network me-2" />Telemedicine Readiness</h3>
        <div className="d-flex justify-content-between x-small mb-2"><span className="text-muted">Network Latency</span><span className="text-success">12ms</span></div>
        <div className="d-flex justify-content-between x-small"><span className="text-muted">Video System</span><span className="text-success fw-bold">READY</span></div>
      </motion.div>
    </>
  );

  const tabContent = {
    overview: renderOverview,
    records: renderRecords,
    treatment: renderTreatment,
    monitoring: renderMonitoring,
    services: renderServices,
    support: renderSupport,
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="patient-hud-root">
      <BioMatrixBackground />

      {/* Emergency SOS Button (preserved + enhanced) */}
      <motion.button
        className={`hud-help-btn ${helpRequesting ? 'requesting' : ''}`}
        onClick={handleHelp}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <i className={`bi ${helpRequesting ? 'bi-check-lg' : 'bi-megaphone-fill'}`} />
        <span>{helpRequesting ? 'SENT' : 'SOS'}</span>
      </motion.button>

      {/* AI Health Assistant (floating) */}
      <AIHealthAssistant />

      {/* HUD Overlay (preserved) */}
      <div className="hud-scanline" />
      <div className="hud-corners" />

      <div className="container py-4 position-relative" style={{ zIndex: 10 }}>

        {/* ── Enhanced Header ── */}
        <motion.div
          className="hud-header glass-panel p-4 mb-4"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="row align-items-center">
            <div className="col-auto">
              <motion.div
                className="hud-avatar"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 1 }}
                style={{ borderColor: themeColor }}
              >
                {patient.name[0]}
              </motion.div>
            </div>
            <div className="col">
              <h1 className="hud-title mb-0">{patient.name}</h1>
              <div className="hud-subtitle d-flex flex-wrap gap-2 align-items-center mt-1">
                <span className="badge" style={{ background: `${themeColor}20`, color: themeColor, fontSize: "0.6rem" }}>{patient.severity}</span>
                <span>ID: {patient.id}</span>
                <span>Dept: {patient.department}</span>
                <span>Status: <span style={{ color: themeColor }}>{patient.status}</span></span>
              </div>
              <div className="d-flex flex-wrap gap-3 mt-1" style={{ fontSize: "0.65rem", color: "#64748b" }}>
                <span><i className="bi bi-calendar-event me-1" />Admitted: {patient.admittedTime}</span>
                {patient.assignedDoctor && <span><i className="bi bi-person-badge me-1" />Dr. {patient.assignedDoctor}</span>}
                {patient.assignedBed && <span><i className="bi bi-house-door me-1" />{patient.assignedBed}</span>}
                <span><i className="bi bi-telephone me-1" />Emergency: {patient.contact}</span>
                <span><i className="bi bi-clock me-1" />Est. Discharge: {estDischarge.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>
            </div>
            <div className="col-auto d-none d-lg-block">
              <div style={{ width: 150, height: 100 }}>
                <MedicalHeart3D color={themeColor} />
              </div>
            </div>
            <div className="col-auto">
              <button className="hud-exit-btn" onClick={onLogout}>
                <i className="bi bi-power" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Tab Navigation ── */}
        <div className="d-flex gap-1 mb-4 flex-wrap p-1 rounded-3" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn btn-sm d-flex align-items-center gap-1 rounded-2 px-3 py-2 border-0"
              style={{
                background: activeTab === tab.id ? "rgba(14,165,233,0.15)" : "transparent",
                color: activeTab === tab.id ? "#0ea5e9" : "#94a3b8",
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: "0.75rem",
                transition: "all 0.2s",
                borderBottom: activeTab === tab.id ? "2px solid #0ea5e9" : "2px solid transparent",
              }}
            >
              <i className={`bi ${tab.icon}`} />
              <span className="d-none d-sm-inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {tabContent[activeTab]?.()}
          </motion.div>
        </AnimatePresence>

      </div>

      <style>{`
        .patient-hud-root { min-height: 100vh; color: #fff; font-family: 'Outfit'; overflow-x: hidden; }
        .hud-scanline { position: fixed; inset: 0; background: linear-gradient(to bottom, transparent 50%, rgba(0, 180, 255, 0.05) 50%); background-size: 100% 4px; z-index: 5; pointer-events: none; }
        .hud-corners::before, .hud-corners::after { content: ''; position: fixed; width: 40px; height: 40px; border: 2px solid rgba(14, 165, 233, 0.4); z-index: 6; pointer-events: none; }
        .hud-corners::before { top: 20px; left: 20px; border-right: 0; border-bottom: 0; }
        .hud-corners::after { bottom: 20px; right: 20px; border-left: 0; border-top: 0; }

        .hud-header { border-left: 4px solid #0ea5e9; background: rgba(15, 23, 42, 0.6) !important; backdrop-filter: blur(12px); }
        .hud-avatar { width: 60px; height: 60px; border: 2px solid; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; background: rgba(255,255,255,0.05); }
        .hud-title { font-weight: 800; letter-spacing: -1px; }
        .hud-subtitle { font-size: 0.8rem; color: #94a3b8; font-weight: 600; letter-spacing: 1px; }
        .hud-exit-btn { width: 50px; height: 50px; border-radius: 50%; border: 1px solid rgba(244, 63, 94, 0.4); background: rgba(244, 63, 94, 0.1); color: #f43f5e; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: all 0.3s; }
        .hud-exit-btn:hover { background: #f43f5e; color: #fff; transform: rotate(90deg); }

        .hud-card { border-radius: 20px; background: rgba(15, 23, 42, 0.45) !important; backdrop-filter: blur(12px); }
        .hud-card-title { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; color: #0ea5e9; }
        .hud-telemetry-tag { font-size: 0.6rem; padding: 2px 8px; border: 1px solid #10b981; color: #10b981; border-radius: 4px; animation: blink 1s infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .hud-med-list { display: flex; flex-direction: column; gap: 12px; }
        .hud-med-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 12px; }
        .x-small { font-size: 0.7rem; }

        .hud-help-btn {
          position: fixed; bottom: 30px; right: 30px;
          width: 70px; height: 70px; border-radius: 50%;
          background: #f43f5e; border: 3px solid rgba(255,255,255,0.2);
          color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center;
          font-weight: 800; font-size: 0.7rem; z-index: 1000;
          box-shadow: 0 0 30px rgba(244, 63, 94, 0.5);
          cursor: pointer;
        }
        .hud-help-btn.requesting { background: #10b981; box-shadow: 0 0 30px rgba(16, 185, 129, 0.5); }
        .hud-help-btn i { font-size: 1.3rem; margin-bottom: -4px; }

        .hud-timeline { display: flex; flex-direction: column; gap: 0.8rem; }
        .hud-timeline-node { display: flex; align-items: flex-start; gap: 1rem; opacity: 0.3; transition: 0.4s; }
        .hud-timeline-node.done { opacity: 0.7; color: #10b981; }
        .hud-timeline-node.active { opacity: 1; color: #0ea5e9; transform: translateX(5px); }
        .node-marker { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
        .active .node-marker { background: #0ea5e9; color: #fff; box-shadow: 0 0 15px rgba(14, 165, 233, 0.4); }

        .hud-doc-info { display: flex; align-items: center; gap: 1rem; }
        .doc-avatar-hex { width: 60px; height: 60px; background: #0ea5e9; clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); display: flex; align-items: center; justify-content: center; }
        .hex-inner { width: 56px; height: 56px; background: #090d16; clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); display: flex; align-items: center; justify-content: center; font-weight: 800; color: #0ea5e9; font-size: 0.7rem; }
        .doc-name { font-weight: 800; font-size: 1rem; }
        .doc-rank { font-size: 0.6rem; color: #94a3b8; font-weight: 700; }
        .doc-status { font-size: 0.6rem; font-weight: 800; color: #10b981; }
        .status-blip { display: inline-block; width: 5px; height: 5px; background: #10b981; border-radius: 50%; margin-right: 4px; animation: blink 1s infinite; }

        .hud-loader { position: fixed; inset: 0; background: #050a15; z-index: 2000; display: flex; align-items: center; justify-content: center; }
        .loader-orbit { position: relative; width: 150px; height: 150px; display: flex; align-items: center; justify-content: center; }
        .orbit-ring { position: absolute; inset: 0; border: 2px solid #0ea5e9; border-top-color: transparent; border-radius: 50%; animation: rotate 1s linear infinite; }
        .orbit-text { font-size: 0.6rem; font-weight: 800; letter-spacing: 2px; color: #0ea5e9; text-align: center; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); } 50% { box-shadow: 0 0 0 10px rgba(16,185,129,0); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 768px) {
          .hud-avatar { width: 45px; height: 45px; font-size: 1.1rem; }
          .hud-title { font-size: 1.2rem; }
          .hud-help-btn { width: 55px; height: 55px; font-size: 0.6rem; bottom: 20px; right: 20px; }
          .hud-help-btn i { font-size: 1rem; }
        }
      `}</style>
    </div>
  );
}
