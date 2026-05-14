import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { SeverityChart, DepartmentChart, AdmissionsChart, BedOccupancyChart } from "../components/Charts";
import PulseOrb from "../components/PulseOrb";
import AmbulanceTracker from "../components/AmbulanceTracker";
import AIHologramAssistant from "../components/AIHologramAssistant";
import { motion, AnimatePresence } from "motion/react";

const SEVERITY_CLS = {
  Critical: "severity-critical",
  High:     "severity-major",
  Medium:   "severity-moderate",
  Low:      "severity-minor",
};

const STATUS_CLS = {
  "Newly Admitted":  "bg-primary",
  "In Treatment":    "bg-success",
  "Awaiting Scans":  "bg-warning text-dark",
  Stable:            "bg-info text-dark",
  Recovering:        "bg-secondary",
  "Discharge Ready": "bg-dark",
};

export default function Dashboard({ onNavigate }) {
  const { patients, doctors, beds, admissions, disasterMode, aiPredictions, toggleDisasterMode } = useApp();

  // Highest risk for the Orb
  const highestRisk = Math.max(...aiPredictions.map(p => p.risk));

  // Active non-discharged patients
  const active = patients.filter(p => p.status !== "Discharged");

  // Calculate metrics dynamically
  const totalPatients = active.length;
  const criticalCases = active.filter(p => p.severity === "Critical" || p.severity_score >= 85).length;
  const occupiedBeds  = beds.filter(b => b.status === "Occupied").length;
  const totalBeds     = beds.length || 12;
  const bedRate       = Math.round((occupiedBeds / totalBeds) * 100);
  const availableDoctors = doctors.filter(d => d.status === "Available").length;

  // Compute severity chart data
  const sevCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  active.forEach(p => {
    let s = p.severity;
    if (s === "Major") s = "High";
    if (s === "Moderate") s = "Medium";
    if (s === "Minor") s = "Low";
    if (sevCounts[s] !== undefined) sevCounts[s]++;
    else sevCounts.Low++;
  });
  const severityLabels = Object.keys(sevCounts);
  const severityValues = Object.values(sevCounts);

  // Compute department chart data
  const deptCounts = {};
  active.forEach(p => {
    const d = p.department || "General";
    deptCounts[d] = (deptCounts[d] || 0) + 1;
  });
  const departmentLabels = Object.keys(deptCounts);
  const departmentValues = Object.values(deptCounts);

  // Compute admissions trend data
  const trendsLabels = Object.keys(admissions || {});
  const trendsValues = Object.values(admissions || {});

  const metrics = [
    { title: "Total Active Patients",  value: totalPatients, icon: "bi-people",       cls: "metric-primary",  footer: "Admitted across departments" },
    { title: "Critical Cases",         value: criticalCases, icon: "bi-heart-pulse",  cls: "metric-accent",   footer: "Requires urgent response" },
    { title: "Bed Occupancy Rate",     value: `${bedRate}%`, icon: "bi-hospital",     cls: "metric-warning",  footer: `${occupiedBeds} of ${totalBeds} beds occupied` },
    { title: "Available Doctors",      value: availableDoctors, icon: "bi-person-check", cls: "metric-success",  footer: `${availableDoctors} responders ready` },
  ];

  return (
    <div className="position-relative overflow-hidden" style={{ minHeight: "100%" }}>
      {/* 3D HUD & Scanning Effects */}
      <div className="dashboard-hud-overlay" />
      <div className="scanning-line" />

      {/* Page header */}
      <div className={`d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 pb-3 border-bottom gap-4 position-relative ${disasterMode ? 'disaster-header' : ''}`} style={{ zIndex: 1 }}>
        <div className="d-flex align-items-center gap-4">
          <div style={{ width: 100, height: 100, flexShrink: 0 }} className="d-none d-md-block">
            <PulseOrb risk={highestRisk} />
          </div>
          <div>
            <h2 className={`fw-bold mb-1 ${disasterMode ? 'text-danger' : 'text-dark'}`} style={{ fontFamily: "Outfit, sans-serif" }}>
              {disasterMode ? "MASS CASUALTY COMMAND MODE" : "Emergency Operations Dashboard"}
            </h2>
            <p className="text-muted small mb-0">
              {disasterMode ? "Disaster response active. Resource prioritization engaged." : "Real-time hospital overview, severity metrics & resource analytics."}
            </p>
          </div>
        </div>
        <div className="d-flex gap-3">
          <button 
            className={`btn ${disasterMode ? 'btn-danger' : 'btn-outline-danger'} px-3`}
            onClick={toggleDisasterMode}
          >
            <i className={`bi ${disasterMode ? 'bi-shield-fill-exclamation' : 'bi-shield-exclamation'} me-2`} />
            {disasterMode ? "Exit Disaster Mode" : "Disaster Mode"}
          </button>
          <button className="btn btn-primary-gradient px-4 py-2" onClick={() => onNavigate("registration")}>
            <i className="bi bi-plus-lg me-1" /> New Patient Ingest
          </button>
        </div>
      </div>

      {/* AI Emergency Prediction Engine */}
      <div className="row g-4 mb-4 position-relative" style={{ zIndex: 1 }}>
        <div className="col-12">
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="ai-status-pulse" />
            <h3 className="fs-6 fw-bold mb-0 text-uppercase letter-spacing-1">AI Emergency Prediction Engine</h3>
          </div>
        </div>
        {aiPredictions.map((pred, i) => (
          <motion.div 
            key={pred.id}
            className="col-md-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="glass-panel p-3 border-start border-4" style={{ borderColor: pred.color }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small text-uppercase fw-bold">{pred.type}</div>
                  <div className="fs-4 fw-bold" style={{ color: pred.color }}>{pred.risk}% <span className="fs-6 fw-normal">Risk</span></div>
                </div>
                <div className={`risk-trend ${pred.trend}`}>
                  <i className={`bi bi-graph-${pred.trend === 'up' ? 'up-arrow' : pred.trend === 'down' ? 'down-arrow' : 'line'} fs-3`} />
                </div>
              </div>
              <div className="progress mt-2" style={{ height: "4px", background: "rgba(255,255,255,0.1)" }}>
                <div className="progress-bar" style={{ width: `${pred.risk}%`, background: pred.color }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>


      {/* Metric Cards */}
      <div className="row g-4 mb-4 position-relative" style={{ zIndex: 1 }}>
        {metrics.map((m, i) => (
          <motion.div 
            key={i} 
            className="col-sm-6 col-xl-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.6 }}
          >
            <div className={`metric-card ${m.cls}`}>
              <div>
                <div className="metric-header">
                  <span className="metric-title">{m.title}</span>
                  <div className="metric-icon"><i className={`bi ${m.icon}`} /></div>
                </div>
                <div className="metric-value">{m.value}</div>
              </div>
              <div className="metric-footer">
                <i className="bi bi-bar-chart-fill" />
                <span>{m.footer}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="row g-4 mb-4 position-relative" style={{ zIndex: 1 }}>
        <motion.div 
          className="col-lg-5 col-xl-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ rotateY: -5, rotateX: 2, scale: 1.02 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{ perspective: 1000 }}
        >
          <div className="glass-panel p-4 h-100 glow-pulse">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="fs-6 fw-bold mb-0">Severity Analysis</h3>
              <span className="badge bg-light text-dark border">Pie Chart</span>
            </div>
            <p className="text-muted small mb-3">Distribution of triage priority scores.</p>
            <div style={{ height: 280 }}>
              <SeverityChart labels={severityLabels} data={severityValues} />
            </div>
          </div>
        </motion.div>
        <motion.div 
          className="col-lg-7 col-xl-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ rotateY: 5, rotateX: 2, scale: 1.01 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ perspective: 1000 }}
        >
          <div className="glass-panel p-4 h-100 glow-pulse">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="fs-6 fw-bold mb-0">Department Admissions Load</h3>
              <span className="badge bg-light text-dark border">Bar Graph</span>
            </div>
            <p className="text-muted small mb-3">Active headcount per clinical division.</p>
            <div style={{ height: 280 }}>
              <DepartmentChart labels={departmentLabels} data={departmentValues} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="row g-4 mb-4 position-relative" style={{ zIndex: 1 }}>
        <motion.div 
          className="col-lg-7 col-xl-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ rotateX: -5, scale: 1.01 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          style={{ perspective: 1000 }}
        >
          <div className="glass-panel p-4 h-100 glow-pulse">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="fs-6 fw-bold mb-0">Daily Admissions Trend</h3>
              <span className="badge bg-light text-dark border">Line Chart</span>
            </div>
            <p className="text-muted small mb-3">7-day emergency floor inflow volume.</p>
            <div style={{ height: 310 }}>
              <AdmissionsChart labels={trendsLabels} data={trendsValues} />
            </div>
          </div>
        </motion.div>
        <motion.div 
          className="col-lg-5 col-xl-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ rotateX: -5, rotateY: 5, scale: 1.02 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          style={{ perspective: 1000 }}
        >
          <div className="glass-panel p-4 h-100 glow-pulse">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="fs-6 fw-bold mb-0">Bed Occupancy Inventory</h3>
              <span className="badge bg-light text-dark border">Doughnut Chart</span>
            </div>
            <p className="text-muted small mb-3">Real-time bed status proportions.</p>
            <div style={{ height: 310 }}><BedOccupancyChart /></div>
          </div>
        </motion.div>
      </div>

      {/* Ambulance Tracker Section */}
      <div className="row g-4 mb-4 position-relative" style={{ zIndex: 1 }}>
        <div className="col-12">
          <motion.div 
            className="glass-panel p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className="fs-6 fw-bold mb-0">Smart Ambulance Tracking & Route Optimization</h3>
                <p className="text-muted small mb-0">Live satellite telemetry and traffic-aware dispatching.</p>
              </div>
              <div className="d-flex gap-2">
                <span className="badge bg-success-subtle text-success border border-success-subtle">5 Units Active</span>
                <span className="badge bg-info-subtle text-info border border-info-subtle">Optimizing ETA</span>
              </div>
            </div>
            <AmbulanceTracker />
          </motion.div>
        </div>
      </div>


      {/* Recent Ingest Table */}
      <motion.div 
        className="glass-panel p-4 position-relative" 
        style={{ zIndex: 1 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 1 }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3 className="fs-6 fw-bold mb-0">Recent Ingest Flow</h3>
            <p className="text-muted small mb-0">Preview of latest emergency patient intakes.</p>
          </div>
          <button className="btn btn-sm btn-link fw-semibold text-decoration-none p-0" onClick={() => onNavigate("queue")}>
            View Full Queue <i className="bi bi-arrow-right ms-1" />
          </button>
        </div>
        <div className="table-responsive">
          <table className="premium-table w-100">
            <thead>
              <tr>
                {["Case ID","Patient","Severity","Department","Bed","Status"].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {active.length === 0
                ? <tr><td colSpan={6} className="text-center text-muted py-4">No active emergency cases.</td></tr>
                : active.slice(0, 5).map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.id}</strong></td>
                      <td>{p.name}</td>
                      <td><span className={`badge-severity ${SEVERITY_CLS[p.severity] || "severity-moderate"}`}>{p.severity}</span></td>
                      <td>{p.department}</td>
                      <td><span className="badge bg-light text-dark border">{p.assignedBed || "—"}</span></td>
                      <td><span className={`badge ${STATUS_CLS[p.status] || "bg-light text-dark border"}`}>{p.status}</span></td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </motion.div>


      {/* Floating AI Assistant */}
      <AIHologramAssistant />

      <style>{`
        .ai-status-pulse {
          width: 10px;
          height: 10px;
          background: #0ea5e9;
          border-radius: 50%;
          box-shadow: 0 0 10px #0ea5e9;
          animation: ai-pulse 2s infinite;
        }
        @keyframes ai-pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        .letter-spacing-1 { letter-spacing: 1px; }
        .risk-trend.up { color: #f43f5e; }
        .risk-trend.down { color: #10b981; }
        .risk-trend.stable { color: #f59e0b; }
        
        .disaster-header {
          background: rgba(244, 63, 94, 0.05);
          border-radius: 12px;
          padding: 15px;
          border-bottom-color: #f43f5e !important;
        }
      `}</style>
    </div>
  );
}
