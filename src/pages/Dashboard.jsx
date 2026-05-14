import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { SeverityChart, DepartmentChart, AdmissionsChart, BedOccupancyChart } from "../components/Charts";
import PulseOrb from "../components/PulseOrb";
import { motion } from "motion/react";

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
  const { patients, doctors, beds, admissions } = useApp();

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
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 pb-3 border-bottom gap-4 position-relative" style={{ zIndex: 1 }}>
        <div className="d-flex align-items-center gap-4">
          <div style={{ width: 100, height: 100, flexShrink: 0 }} className="d-none d-md-block">
            <PulseOrb />
          </div>
          <div>
            <h2 className="fw-bold text-dark mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Emergency Operations Dashboard</h2>
            <p className="text-muted small mb-0">Real-time hospital overview, severity metrics & resource analytics.</p>
          </div>
        </div>
        <button className="btn btn-primary-gradient px-4 py-2" onClick={() => onNavigate("registration")}>
          <i className="bi bi-plus-lg me-1" /> New Patient Ingest
        </button>
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
    </div>
  );
}
