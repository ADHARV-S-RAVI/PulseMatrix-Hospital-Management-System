import { useState, useEffect, useRef } from "react";
import { getPatient } from "../services/api";
import { motion, AnimatePresence } from "motion/react";
import MedicalHeart3D from "../components/MedicalHeart3D";
import BioMatrixBackground from "../components/BioMatrixBackground";

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

function ECGWave({ color }) {
  return (
    <div className="ecg-container">
      <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="ecg-svg">
        <motion.path
          d="M0 10 L10 10 L15 2 L20 18 L25 10 L40 10 L45 0 L50 20 L55 10 L70 10 L75 5 L80 15 L85 10 L100 10"
          fill="none"
          stroke={color}
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: 1, 
            opacity: [0.2, 0.5, 0.2],
            x: [0, -100]
          }}
          transition={{ 
            pathLength: { duration: 2, ease: "easeInOut" },
            opacity: { duration: 2, repeat: Infinity },
            x: { duration: 3, repeat: Infinity, ease: "linear" }
          }}
        />
        <motion.path
          d="M100 10 L110 10 L115 2 L120 18 L125 10 L140 10 L145 0 L150 20 L155 10 L170 10 L175 5 L180 15 L185 10 L200 10"
          fill="none"
          stroke={color}
          strokeWidth="1"
          animate={{ x: [0, -100] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
}

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
          <i className={`bi ${icon}`} style={{ color }} />
          <span>{label}</span>
        </div>
        <div className="vital-body">
          <span className="vital-value">{value}</span>
          <span className="vital-unit">{unit}</span>
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

// Mock Medication & Diet Data
const MEDS = [
  { name: "Ceftriaxone", dose: "1g IV", time: "08:00 AM", status: "Taken" },
  { name: "Paracetamol", dose: "500mg PO", time: "12:30 PM", status: "Upcoming" },
  { name: "Metoprolol", dose: "25mg PO", time: "04:00 PM", status: "Pending" },
];

const DIET = [
  { meal: "Breakfast", menu: "Low Sodium Porridge + Fruit", status: "Delivered" },
  { meal: "Lunch", menu: "Steamed Fish + Veggie Puree", status: "Scheduled" },
];

export default function PatientDashboard({ patientId, onLogout }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [helpRequesting, setHelpRequesting] = useState(false);

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
          id: `PT-${data.patient_id}`,
          severity: localData?.severity || severity,
          status: localData?.status || "In Treatment",
          assignedDoctor: localData?.assignedDoctor || null,
          assignedBed: localData?.assignedBed || null,
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

  if (loading) return (
    <div className="hud-loader">
      <BioMatrixBackground />
      <div className="loader-orbit">
        <div className="orbit-ring" />
        <div className="orbit-text">SYNCING BIOMETRIC CORE...</div>
      </div>
    </div>
  );

  const vitals = getMockVitals(patient.severity);
  const currentStepIdx = STATUS_ORDER.indexOf(patient.status);
  const themeColor = patient.severity === "Critical" ? "#f43f5e" : patient.severity === "Major" ? "#f59e0b" : "#0ea5e9";

  const handleHelp = () => {
    setHelpRequesting(true);
    setTimeout(() => setHelpRequesting(false), 3000);
  };

  return (
    <div className="patient-hud-root">
      <BioMatrixBackground />
      
      {/* ── Help Button ── */}
      <motion.button 
        className={`hud-help-btn ${helpRequesting ? 'requesting' : ''}`}
        onClick={handleHelp}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <i className={`bi ${helpRequesting ? 'bi-check-lg' : 'bi-megaphone-fill'}`} />
        <span>{helpRequesting ? 'REQUESTED' : 'HELP'}</span>
      </motion.button>

      {/* ── Page HUD Overlay ── */}
      <div className="hud-scanline" />
      <div className="hud-corners" />

      <div className="container py-4 position-relative" style={{ zIndex: 10 }}>
        
        {/* ── Header HUD ── */}
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
              <div className="hud-subtitle">
                <span className="me-3">ID: {patient.id}</span>
                <span className="me-3">DEPT: {patient.department}</span>
                <span>STATUS: <span style={{ color: themeColor }}>{patient.status}</span></span>
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

        <div className="row g-4">
          {/* ── Left Column: Metrics & Care ── */}
          <div className="col-lg-8">
            
            {/* Vitals HUD */}
            <motion.div className="glass-panel p-4 mb-4 hud-card" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="hud-card-title"><i className="bi bi-activity me-2" />Biometric Stream</h3>
                <div className="hud-telemetry-tag">LIVE TELEMETRY</div>
              </div>
              <div className="row g-3">
                <div className="col-md-4"><VitalCard icon="bi-heart-fill" label="Heart Rate" value={vitals.hr} unit="BPM" color="#f43f5e" alert={vitals.hr > 110 ? "Elevated" : null} /></div>
                <div className="col-md-4"><VitalCard icon="bi-speedometer2" label="Blood Pressure" value={vitals.bp} unit="mmHg" color="#0ea5e9" /></div>
                <div className="col-md-4"><VitalCard icon="bi-lungs" label="SpO2" value={vitals.spo2} unit="%" color="#10b981" /></div>
              </div>
            </motion.div>

            <div className="row g-4">
              {/* Medicine Box */}
              <div className="col-md-6">
                <motion.div className="glass-panel p-4 h-100 hud-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                  <h3 className="hud-card-title mb-4"><i className="bi bi-capsule me-2" />Digital Pillbox</h3>
                  <div className="hud-med-list">
                    {MEDS.map(m => (
                      <div key={m.name} className="hud-med-item">
                        <div>
                          <div className="fw-bold small">{m.name}</div>
                          <div className="x-small text-muted">{m.dose} · {m.time}</div>
                        </div>
                        <span className={`badge ${m.status === 'Taken' ? 'bg-success' : 'bg-primary'} x-small`}>{m.status}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
              {/* Dietary HUD */}
              <div className="col-md-6">
                <motion.div className="glass-panel p-4 h-100 hud-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                  <h3 className="hud-card-title mb-4"><i className="bi bi-cup-hot-fill me-2" />Meal Plan</h3>
                  <div className="hud-med-list">
                    {DIET.map(d => (
                      <div key={d.meal} className="hud-med-item">
                        <div>
                          <div className="fw-bold small">{d.meal}</div>
                          <div className="x-small text-muted">{d.menu}</div>
                        </div>
                        <i className={`bi ${d.status === 'Delivered' ? 'bi-check-circle-fill text-success' : 'bi-clock text-primary'}`} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Resources ── */}
          <div className="col-lg-4">
            {/* Physician HUD */}
            <motion.div className="glass-panel p-4 mb-4 hud-card" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
              <h3 className="hud-card-title mb-3"><i className="bi bi-person-badge me-2" />Command Officer</h3>
              <div className="hud-doc-info">
                <div className="doc-avatar-hex"><div className="hex-inner">DR</div></div>
                <div className="doc-details">
                  <div className="doc-name">{patient.assignedDoctor || "Triage Pool"}</div>
                  <div className="doc-rank">LEAD CLINICIAN</div>
                  <div className="doc-status"><span className="status-blip" /> ONLINE</div>
                </div>
              </div>
            </motion.div>

            {/* Path Tracking */}
            <motion.div className="glass-panel p-4 hud-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="hud-card-title mb-4"><i className="bi bi-signpost-split me-2" />Care Path Tracking</h3>
              <div className="hud-timeline">
                {STATUS_ORDER.map((step, i) => (
                  <div key={step} className={`hud-timeline-node ${i === currentStepIdx ? "active" : i < currentStepIdx ? "done" : ""}`}>
                    <div className="node-marker"><i className={`bi ${TIMELINE_ICONS[step]}`} /></div>
                    <div className="node-label x-small">{step}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        .patient-hud-root { min-height: 100vh; color: #fff; font-family: 'Outfit'; overflow-x: hidden; }
        .hud-scanline { position: fixed; inset: 0; background: linear-gradient(to bottom, transparent 50%, rgba(0, 180, 255, 0.05) 50%); background-size: 100% 4px; z-index: 5; pointer-events: none; }
        .hud-corners::before, .hud-corners::after { content: ''; position: fixed; width: 40px; height: 40px; border: 2px solid rgba(14, 165, 233, 0.4); z-index: 6; pointer-events: none; }
        .hud-corners::before { top: 20px; left: 20px; border-right: 0; border-bottom: 0; }
        .hud-corners::after { bottom: 20px; right: 20px; border-left: 0; border-top: 0; }
        
        .hud-header { border-left: 4px solid #0ea5e9; background: rgba(15, 23, 42, 0.6) !important; }
        .hud-avatar { width: 60px; height: 60px; border: 2px solid; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; background: rgba(255,255,255,0.05); }
        .hud-title { font-weight: 800; letter-spacing: -1px; }
        .hud-subtitle { font-size: 0.8rem; color: #94a3b8; font-weight: 600; letter-spacing: 1px; }
        .hud-exit-btn { width: 50px; height: 50px; border-radius: 50%; border: 1px solid rgba(244, 63, 94, 0.4); background: rgba(244, 63, 94, 0.1); color: #f43f5e; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: all 0.3s; }
        .hud-exit-btn:hover { background: #f43f5e; color: #fff; transform: rotate(90deg); }

        .hud-card { border-radius: 20px; background: rgba(15, 23, 42, 0.45) !important; }
        .hud-card-title { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; color: #0ea5e9; }
        .hud-telemetry-tag { font-size: 0.6rem; padding: 2px 8px; border: 1px solid #10b981; color: #10b981; border-radius: 4px; animation: blink 1s infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .hud-med-list { display: flex; flex-direction: column; gap: 12px; }
        .hud-med-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 12px; }
        .x-small { font-size: 0.7rem; }

        .hud-help-btn {
          position: fixed; bottom: 30px; right: 30px;
          width: 80px; height: 80px; border-radius: 50%;
          background: #f43f5e; border: 4px solid rgba(255,255,255,0.2);
          color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center;
          font-weight: 800; font-size: 0.8rem; z-index: 1000;
          box-shadow: 0 0 30px rgba(244, 63, 94, 0.5);
          cursor: pointer;
        }
        .hud-help-btn.requesting { background: #10b981; box-shadow: 0 0 30px rgba(16, 185, 129, 0.5); }
        .hud-help-btn i { font-size: 1.5rem; margin-bottom: -5px; }

        .hud-timeline { display: flex; flex-direction: column; gap: 0.8rem; }
        .hud-timeline-node { display: flex; align-items: center; gap: 1rem; opacity: 0.3; transition: 0.4s; }
        .hud-timeline-node.done { opacity: 0.7; color: #10b981; }
        .hud-timeline-node.active { opacity: 1; color: #0ea5e9; transform: translateX(5px); }
        .node-marker { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 1rem; }
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
        .orbit-text { font-size: 0.6rem; font-weight: 800; letter-spacing: 2px; color: #0ea5e9; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

