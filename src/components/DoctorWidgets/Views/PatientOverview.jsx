import { useState, useEffect } from "react";
import { aiPatientSummary } from "../../../services/api";

export default function PatientOverview({ patient, doctorId }) {
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingAi, setLoadingAi] = useState(true);

  useEffect(() => {
    if (!patient) return;
    setLoadingAi(true);
    aiPatientSummary(patient.patient_id, doctorId)
      .then(data => setAiSummary(data))
      .catch(() => setAiSummary({ summary: "AI Summary unavailable.", ai_available: false }))
      .finally(() => setLoadingAi(false));
  }, [patient, doctorId]);

  const SectionTitle = ({ title, icon, color }) => (
    <h6 className="text-white mb-3 d-flex align-items-center gap-2" style={{ fontSize: "0.85rem" }}>
      <i className={`bi ${icon}`} style={{ color: color || "#0ea5e9" }}></i> {title}
    </h6>
  );

  return (
    <div className="h-100 overflow-auto custom-scrollbar text-white pe-2">
      <div className="row g-3">
        
        {/* Left Column */}
        <div className="col-12 col-xl-7 d-flex flex-column gap-3">
          
          {/* Live Vitals (Compact) */}
          <div className="glass-panel p-3 rounded-4" style={{ background: "rgba(10,15,28,0.6)" }}>
            <SectionTitle title="Live Vitals" icon="bi-activity" color="#10b981" />
            <div className="d-flex gap-2 flex-wrap">
              {[
                { label: "Heart Rate", val: "88 bpm", icon: "bi-heart-pulse", color: "#10b981" },
                { label: "Blood Pressure", val: "120/80", icon: "bi-droplet", color: "#0ea5e9" },
                { label: "SpO2", val: "98%", icon: "bi-lungs", color: "#3b82f6" },
                { label: "Temperature", val: "37.2 °C", icon: "bi-thermometer-half", color: "#f59e0b" },
                { label: "Resp. Rate", val: "16 /min", icon: "bi-wind", color: "#8b5cf6" },
              ].map((v, i) => (
                <div key={i} className="flex-grow-1 p-2 rounded text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="text-muted mb-1" style={{ fontSize: "0.6rem", textTransform: "uppercase" }}>{v.label}</div>
                  <div className="fw-bold d-flex align-items-center justify-content-center gap-1" style={{ fontSize: "0.9rem" }}>
                    <i className={`bi ${v.icon}`} style={{ color: v.color, fontSize: "0.8rem" }}></i> {v.val}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Clinical Summary */}
          <div className="glass-panel p-3 rounded-4 flex-grow-1" style={{ background: "rgba(14,165,233,0.05)", border: "1px solid rgba(14,165,233,0.2)" }}>
            <SectionTitle title="AI Clinical Summary" icon="bi-robot" color="#0ea5e9" />
            
            {loadingAi ? (
              <div className="text-center py-3 text-muted"><div className="spinner-border spinner-border-sm text-primary mb-2" /><br/>Analyzing patient record...</div>
            ) : (
              <>
                <div className="p-2 rounded mb-2 d-flex align-items-center gap-2" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b" }}>
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.5px" }}>AI GENERATED — REQUIRES CLINICAL REVIEW</span>
                </div>
                <p className="m-0 text-white" style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
                  {aiSummary?.summary}
                </p>
              </>
            )}
          </div>

        </div>

        {/* Right Column */}
        <div className="col-12 col-xl-5 d-flex flex-column gap-3">
          
          {/* Active Medications */}
          <div className="glass-panel p-3 rounded-4" style={{ background: "rgba(10,15,28,0.6)" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <SectionTitle title="Active Medications" icon="bi-capsule" color="#8b5cf6" />
              <button className="btn btn-link text-primary p-0 text-decoration-none" style={{ fontSize: "0.75rem" }}>View All</button>
            </div>
            <div className="d-flex flex-column gap-2">
              <div className="d-flex justify-content-between p-2 rounded" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div>
                  <div className="text-white fw-bold" style={{ fontSize: "0.8rem" }}>Ceftriaxone</div>
                  <div className="text-muted" style={{ fontSize: "0.7rem" }}>1g IV q12h</div>
                </div>
                <div className="text-end">
                  <div className="text-success" style={{ fontSize: "0.7rem" }}>Active</div>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Diagnostics */}
          <div className="glass-panel p-3 rounded-4" style={{ background: "rgba(10,15,28,0.6)" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <SectionTitle title="Latest Diagnostics" icon="bi-file-medical" color="#f59e0b" />
              <button className="btn btn-link text-primary p-0 text-decoration-none" style={{ fontSize: "0.75rem" }}>View All</button>
            </div>
            <div className="text-muted small text-center py-2">No recent diagnostics.</div>
          </div>

          {/* Active Operations */}
          <div className="glass-panel p-3 rounded-4 flex-grow-1" style={{ background: "rgba(10,15,28,0.6)" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <SectionTitle title="Active Operations" icon="bi-sliders" color="#10b981" />
            </div>
            <div className="text-muted small text-center py-2">No active operations.</div>
          </div>

        </div>
      </div>
    </div>
  );
}
