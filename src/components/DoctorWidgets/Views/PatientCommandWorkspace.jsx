import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import PatientOverview from "./PatientOverview";

// Existing widgets used for context navigation
import EHRViewer from "../EHRViewer";
import PrescriptionManager from "../PrescriptionManager";
import LabImagingOrders from "../LabImagingOrders";
import ClinicalNotes from "../ClinicalNotes";
import AIClinicalAssistant from "../AIClinicalAssistant";
import OperationsPanel from "../OperationsPanel";
import OperationTimeline from "../Operations/OperationTimeline"; // Reusing the timeline

export default function PatientCommandWorkspace({ patient, doctorId, onBack }) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!patient) return null;

  const isCritical = patient.severity_score >= 70;
  const badgeColor = isCritical ? "#f43f5e" : patient.severity_score >= 50 ? "#f59e0b" : "#10b981";

  const TABS = [
    { id: "overview", label: "Overview", icon: "bi-grid-1x2" },
    { id: "clinical", label: "Clinical", icon: "bi-clipboard2-pulse" },
    { id: "diagnostics", label: "Diagnostics", icon: "bi-file-medical" },
    { id: "medications", label: "Medications", icon: "bi-capsule" },
    { id: "notes", label: "Notes", icon: "bi-journal-medical" },
    { id: "operations", label: "Operations", icon: "bi-sliders" },
    { id: "ai", label: "AI Insights", icon: "bi-robot" },
    { id: "timeline", label: "Timeline", icon: "bi-clock-history" },
  ];

  const renderContent = () => {
    const props = { patient, doctorId };
    switch (activeTab) {
      case "overview": return <PatientOverview {...props} />;
      case "clinical": return <EHRViewer {...props} />;
      case "diagnostics": return <LabImagingOrders {...props} />;
      case "medications": return <PrescriptionManager {...props} />;
      case "notes": return <ClinicalNotes {...props} />;
      case "operations": return <OperationsPanel {...props} />;
      case "ai": return <AIClinicalAssistant {...props} />;
      case "timeline": return (
        <div className="glass-panel p-4 h-100 overflow-auto custom-scrollbar">
          <h5 className="text-white mb-4"><i className="bi bi-clock-history text-primary me-2"></i>Patient Timeline</h5>
          <OperationTimeline patient={patient} />
        </div>
      );
      default: return <PatientOverview {...props} />;
    }
  };

  return (
    <div className="d-flex flex-column h-100 p-3 overflow-hidden">
      
      {/* Persistent Patient Context Header */}
      <div className="glass-panel p-3 rounded-4 mb-3 d-flex flex-wrap align-items-center justify-content-between gap-3" style={{ background: "rgba(10,15,28,0.85)", border: `1px solid ${isCritical ? "rgba(244,63,94,0.4)" : "rgba(14,165,233,0.3)"}` }}>
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-sm btn-outline-secondary rounded-circle" style={{ width: 32, height: 32, padding: 0 }} onClick={onBack}>
            <i className="bi bi-arrow-left"></i>
          </button>
          
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h5 className="m-0 text-white fw-bold">{patient.name}</h5>
              <span className="font-monospace text-muted small px-2 border border-secondary border-opacity-50 rounded bg-dark">#{patient.patient_id}</span>
              {isCritical && (
                <span className="text-danger fw-bold ms-2" style={{ animation: "blink 1.2s infinite", fontSize: "0.75rem" }}>
                  <i className="bi bi-exclamation-triangle-fill me-1" />CRITICAL
                </span>
              )}
            </div>
            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
              {patient.age}y {patient.gender} • {patient.blood_group || "O+"} • {patient.department} • {patient.assigned_bed_type || "No Bed"}
            </div>
          </div>
        </div>

        <div className="d-flex gap-4">
          <div className="text-center">
            <div className="text-muted" style={{ fontSize: "0.6rem", letterSpacing: "1px" }}>TRIAGE</div>
            <div className={`fw-bold ${isCritical ? 'text-danger' : 'text-white'}`}>{patient.severity_score}</div>
          </div>
          <div className="text-center">
            <div className="text-muted" style={{ fontSize: "0.6rem", letterSpacing: "1px" }}>HR</div>
            <div className="text-white fw-bold">88</div>
          </div>
          <div className="text-center border-end border-secondary border-opacity-50 pe-4">
            <div className="text-muted" style={{ fontSize: "0.6rem", letterSpacing: "1px" }}>BP</div>
            <div className="text-white fw-bold">120/80</div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-sm btn-outline-info rounded-pill px-3"><i className="bi bi-camera-video me-1"></i>Consult</button>
            <button className="btn btn-sm btn-primary rounded-pill px-3"><i className="bi bi-plus-lg me-1"></i>Action</button>
            <button className="btn btn-sm btn-danger rounded-pill px-3 ms-2 fw-bold"><i className="bi bi-lightning-fill me-1"></i>EMERGENCY</button>
          </div>
        </div>
      </div>

      {/* Contextual Navigation */}
      <div className="d-flex gap-2 overflow-auto pb-2 mb-3 custom-scrollbar" style={{ flexShrink: 0 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`btn btn-sm text-nowrap px-3 ${activeTab === t.id ? 'btn-primary text-white fw-bold' : 'glass-panel text-muted hover-white'}`}
            style={{ border: activeTab === t.id ? "none" : "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
            onClick={() => setActiveTab(t.id)}
          >
            <i className={`bi ${t.icon} me-2`} />{t.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-grow-1 position-relative overflow-hidden" style={{ minHeight: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="h-100 w-100 overflow-hidden"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
