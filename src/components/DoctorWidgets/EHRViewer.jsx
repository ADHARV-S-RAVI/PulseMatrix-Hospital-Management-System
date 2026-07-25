import { motion } from "motion/react";

import { PatientVitalsChart, OxygenChart } from "../Charts";

export default function EHRViewer({ patient }) {
  if (!patient) return <div className="p-3 text-muted text-center mt-5">Select a patient from the queue to view EHR.</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, rotateX: 10 }} 
      animate={{ opacity: 1, scale: 1, rotateX: 0 }} 
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      style={{ perspective: "1000px" }}
      className="h-100 d-flex flex-column gap-3"
    >
      {/* Patient Header */}
      <div className="glass-panel p-3" style={{ background: "rgba(15,23,42,0.6)", transformStyle: "preserve-3d" }}>
        <div className="row align-items-center">
          <div className="col-auto">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold fs-4" 
              style={{ width: 60, height: 60, background: "linear-gradient(135deg, #0ea5e9, #6366f1)" }}
            >
              {patient.name.split(" ").map(n => n[0]).join("")}
            </motion.div>
          </div>
          <div className="col">
            <h3 className="m-0 text-white fw-bold d-flex align-items-center gap-2">
              {patient.name}
              <span className="badge" style={{ fontSize: "0.6rem", background: patient.gender === "M" ? "rgba(14,165,233,0.2)" : "rgba(244,63,94,0.2)", color: patient.gender === "M" ? "#0ea5e9" : "#f43f5e" }}>
                {patient.gender} • {patient.age} yrs
              </span>
            </h3>
            <div className="d-flex flex-wrap gap-3 mt-2 text-muted" style={{ fontSize: "0.75rem" }}>
              <span><i className="bi bi-hash me-1" />{patient.patient_id || "PT-001"}</span>
              <span><i className="bi bi-diagram-2 me-1" />{patient.department}</span>
              <span><i className="bi bi-hospital me-1" />{patient.assigned_bed_type || "Awaiting Bed"}</span>
              <span><i className="bi bi-activity me-1" />Score: <span className={patient.severity_score >= 80 ? "text-danger fw-bold" : "text-white"}>{patient.severity_score}</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 flex-grow-1">
        {/* Vitals Telemetry */}
        <div className="col-md-4">
          <div className="glass-panel p-3 h-100 d-flex flex-column gap-3" style={{ background: "rgba(15,23,42,0.6)" }}>
            <h5 className="text-white mb-0" style={{ fontSize: "0.9rem" }}><i className="bi bi-heart-pulse text-danger me-2" />Live Vitals</h5>
            <div className="flex-grow-1 position-relative" style={{ minHeight: "150px" }}>
              <PatientVitalsChart />
            </div>
            <div className="flex-grow-1 position-relative" style={{ minHeight: "150px" }}>
              <OxygenChart />
            </div>
          </div>
        </div>

        {/* Medical History Timeline */}
        <div className="col-md-8 d-flex flex-column gap-3">
          <div className="glass-panel p-3 flex-grow-1" style={{ background: "rgba(15,23,42,0.6)" }}>
            <h5 className="text-white mb-3" style={{ fontSize: "0.9rem" }}><i className="bi bi-clock-history text-primary me-2" />Medical History Timeline</h5>
            <div className="d-flex flex-column gap-3 ps-3 border-start border-primary border-opacity-50 ms-2">
              <div className="position-relative">
                <span className="position-absolute top-0 start-0 translate-middle p-1 bg-primary border border-dark rounded-circle" style={{ marginLeft: "-16px" }} />
                <div className="text-white small fw-bold">Admission</div>
                <div className="text-muted" style={{ fontSize: "0.7rem" }}>2 hours ago via Ambulance (Cardiac Arrest protocol)</div>
              </div>
              <div className="position-relative">
                <span className="position-absolute top-0 start-0 translate-middle p-1 bg-info border border-dark rounded-circle" style={{ marginLeft: "-16px" }} />
                <div className="text-white small fw-bold">Triage Complete</div>
                <div className="text-muted" style={{ fontSize: "0.7rem" }}>Assigned to ICU Bed 4 by AI Triage Engine</div>
              </div>
              <div className="position-relative">
                <span className="position-absolute top-0 start-0 translate-middle p-1 bg-warning border border-dark rounded-circle" style={{ marginLeft: "-16px" }} />
                <div className="text-white small fw-bold">Lab Results Pending</div>
                <div className="text-muted" style={{ fontSize: "0.7rem" }}>CBC, Troponin levels requested.</div>
              </div>
            </div>
          </div>
          
          <div className="glass-panel p-3" style={{ background: "rgba(15,23,42,0.6)", minHeight: "150px" }}>
            <h5 className="text-white mb-3" style={{ fontSize: "0.9rem" }}><i className="bi bi-cpu text-info me-2" />Current Treatment Protocol</h5>
            <div className="d-flex flex-wrap gap-2 mb-2">
              <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-50 px-2 py-1">ACS Protocol Active</span>
              <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 px-2 py-1">Continuous Telemetry</span>
              <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50 px-2 py-1">NPO Status</span>
            </div>
            <p className="text-muted mb-0 mt-3" style={{ fontSize: "0.8rem", lineHeight: "1.6" }}>
              Patient is currently stabilized on Oxygen via nasal cannula. Awaiting troponin levels and CBC. Prescribed aspirin 300mg and sublingual nitroglycerin PRN. Consider cardiology consult if ST elevation persists on next ECG.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
