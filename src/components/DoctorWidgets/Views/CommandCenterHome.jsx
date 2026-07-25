import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { getDoctorPatients } from "../../../services/api";

export default function CommandCenterHome({ doctorId, onSelectPatient, dashboardStats }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctorPatients(doctorId)
      .then(data => {
        setPatients(data || []);
      })
      .finally(() => setLoading(false));
  }, [doctorId]);

  // Sort patients by priority/severity
  const priorityPatients = [...patients].sort((a, b) => b.severity_score - a.severity_score).slice(0, 8);

  const StatCard = ({ title, value, color, icon }) => (
    <div className="p-3 rounded-4" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.08)`, minWidth: 140, flex: 1 }}>
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div className="text-muted" style={{ fontSize: "0.7rem", letterSpacing: "1px", textTransform: "uppercase" }}>{title}</div>
        <i className={`bi ${icon}`} style={{ color: color, fontSize: "1rem" }}></i>
      </div>
      <div className="fw-bold" style={{ fontSize: "1.8rem", color: "#fff", lineHeight: 1 }}>{value !== undefined ? value : "—"}</div>
    </div>
  );

  return (
    <div className="h-100 d-flex flex-column p-4 overflow-auto custom-scrollbar text-white">
      
      {/* Greeting */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Command Center Overview</h4>
        <div className="text-muted small">Real-time status of your assigned patients and clinical workload.</div>
      </div>

      {/* KPI Cards */}
      <div className="d-flex gap-3 flex-wrap mb-4">
        <StatCard title="My Patients" value={dashboardStats?.assignedPatients} color="#0ea5e9" icon="bi-people-fill" />
        <StatCard title="Critical" value={dashboardStats?.criticalPatients} color="#f43f5e" icon="bi-exclamation-triangle-fill" />
        <StatCard title="Pending Tests" value={dashboardStats?.pendingDiagnostics} color="#f59e0b" icon="bi-file-medical-fill" />
        <StatCard title="Surgeries" value={dashboardStats?.upcomingSurgeries} color="#8b5cf6" icon="bi-scissors" />
        <StatCard title="Active Requests" value={dashboardStats?.activeOperations} color="#10b981" icon="bi-sliders" />
        <StatCard title="AI Alerts" value={dashboardStats?.aiAlerts} color="#0ea5e9" icon="bi-robot" />
      </div>

      {/* Main Grid */}
      <div className="row g-4 flex-grow-1">
        
        {/* Left/Middle: Priority Patients */}
        <div className="col-12 col-xl-8 d-flex flex-column">
          <h6 className="text-white mb-3 d-flex align-items-center gap-2">
            <i className="bi bi-person-lines-fill text-primary"></i> Priority Patients
          </h6>
          
          <div className="d-flex flex-column gap-3">
            {loading ? (
              <div className="text-center py-5 text-muted"><div className="spinner-border text-primary spinner-border-sm mb-2" /><br/>Loading patient data...</div>
            ) : priorityPatients.length === 0 ? (
              <div className="glass-panel p-4 text-center text-muted">No assigned patients found.</div>
            ) : (
              priorityPatients.map(p => {
                const isCritical = p.severity_score >= 70;
                const isHigh = p.severity_score >= 50 && p.severity_score < 70;
                const badgeColor = isCritical ? "#f43f5e" : isHigh ? "#f59e0b" : "#10b981";
                const badgeText = isCritical ? "CRITICAL" : isHigh ? "HIGH" : "STABLE";

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={p.patient_id}
                    className="p-3 rounded-4 d-flex flex-column gap-2"
                    style={{ 
                      background: isCritical ? "rgba(244,63,94,0.05)" : "rgba(255,255,255,0.03)", 
                      border: `1px solid ${isCritical ? "rgba(244,63,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                      cursor: "pointer", transition: "all 0.2s"
                    }}
                    onClick={() => onSelectPatient(p)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 className="m-0 fw-bold">{p.name}</h6>
                          <span style={{ fontSize: "0.65rem", background: `${badgeColor}20`, color: badgeColor, border: `1px solid ${badgeColor}40`, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                            {badgeText}
                          </span>
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                          ID #{p.patient_id} • {p.age}y {p.gender} • {p.department}
                        </div>
                      </div>
                      
                      <div className="d-flex gap-4">
                        <div className="text-center">
                          <div className="text-muted" style={{ fontSize: "0.6rem" }}>SCORE</div>
                          <div className={`fw-bold ${isCritical ? 'text-danger' : 'text-white'}`}>{p.severity_score}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted" style={{ fontSize: "0.6rem" }}>HR</div>
                          <div className="text-white fw-bold">88</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted" style={{ fontSize: "0.6rem" }}>BP</div>
                          <div className="text-white fw-bold">120/80</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted" style={{ fontSize: "0.6rem" }}>SPO2</div>
                          <div className="text-white fw-bold">98%</div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top border-secondary border-opacity-25">
                      <div className="d-flex gap-3">
                        {isCritical && <span className="text-danger small"><i className="bi bi-robot me-1"></i>High deterioration risk</span>}
                        {!isCritical && <span className="text-info small"><i className="bi bi-robot me-1"></i>Stable trajectory</span>}
                        <span className="text-warning small"><i className="bi bi-clock-history me-1"></i>2 Pending Tests</span>
                      </div>
                      <button className="btn btn-sm btn-outline-primary py-0" style={{ fontSize: "0.75rem" }} onClick={(e) => { e.stopPropagation(); onSelectPatient(p); }}>
                        Open Patient <i className="bi bi-arrow-right ms-1"></i>
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Intelligence Panel */}
        <div className="col-12 col-xl-4 d-flex flex-column gap-3">
          
          <div className="glass-panel p-3 rounded-4" style={{ background: "rgba(10,15,28,0.7)" }}>
            <h6 className="text-white mb-3 d-flex align-items-center gap-2" style={{ fontSize: "0.85rem" }}>
              <i className="bi bi-stars text-primary"></i> AI Priority Alerts
            </h6>
            <div className="d-flex flex-column gap-2">
              <div className="p-2 rounded" style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)" }}>
                <div className="text-danger fw-bold" style={{ fontSize: "0.75rem" }}>Emma Rodriguez</div>
                <div className="text-white" style={{ fontSize: "0.75rem" }}>Shows worsening oxygen saturation trend over last 2 hours.</div>
              </div>
              <div className="p-2 rounded" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
                <div className="text-warning fw-bold" style={{ fontSize: "0.75rem" }}>James Smith</div>
                <div className="text-white" style={{ fontSize: "0.75rem" }}>Abnormal CBC result flagged. Review required.</div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-3 rounded-4" style={{ background: "rgba(10,15,28,0.7)" }}>
            <h6 className="text-white mb-3 d-flex align-items-center gap-2" style={{ fontSize: "0.85rem" }}>
              <i className="bi bi-list-check text-success"></i> Pending Actions
            </h6>
            <div className="d-flex flex-column gap-2">
              <div className="d-flex align-items-center justify-content-between p-2 rounded" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div>
                  <div className="text-white" style={{ fontSize: "0.75rem" }}>Sign Discharge Summary</div>
                  <div className="text-muted" style={{ fontSize: "0.65rem" }}>Robert Johnson</div>
                </div>
                <button className="btn btn-sm btn-outline-secondary py-0" style={{ fontSize: "0.6rem" }}>Review</button>
              </div>
              <div className="d-flex align-items-center justify-content-between p-2 rounded" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div>
                  <div className="text-white" style={{ fontSize: "0.75rem" }}>Approve ICU Transfer</div>
                  <div className="text-muted" style={{ fontSize: "0.65rem" }}>Patricia Moore</div>
                </div>
                <button className="btn btn-sm btn-outline-secondary py-0" style={{ fontSize: "0.6rem" }}>Review</button>
              </div>
            </div>
          </div>

          <div className="glass-panel p-3 rounded-4 flex-grow-1" style={{ background: "rgba(10,15,28,0.7)" }}>
            <h6 className="text-white mb-3 d-flex align-items-center gap-2" style={{ fontSize: "0.85rem" }}>
              <i className="bi bi-calendar-event text-info"></i> Upcoming
            </h6>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-start gap-3">
                <div className="text-info fw-bold font-monospace" style={{ fontSize: "0.8rem", marginTop: 2 }}>20:30</div>
                <div style={{ flex: 1, borderLeft: "2px solid #0ea5e9", paddingLeft: 12 }}>
                  <div className="text-white" style={{ fontSize: "0.75rem" }}>Emergency Surgery — Appendectomy</div>
                  <div className="text-muted" style={{ fontSize: "0.65rem" }}>OT-2 • Patient: David Chen</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
