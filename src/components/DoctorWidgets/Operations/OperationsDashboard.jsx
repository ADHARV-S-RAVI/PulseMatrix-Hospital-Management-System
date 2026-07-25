// OperationsDashboard.jsx — Main operations hub with categorized navigation
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import PatientFlowOps from "./categories/PatientFlowOps";
import EmergencyOps from "./categories/EmergencyOps";
import ResourceOps from "./categories/ResourceOps";
import ClinicalCoordOps from "./categories/ClinicalCoordOps";
import SafetyAdminOps from "./categories/SafetyAdminOps";
import OperationTimeline from "./OperationTimeline";

const CATEGORIES = [
  {
    id: "patient_flow",
    label: "Patient Flow",
    icon: "bi-signpost-split-fill",
    color: "#0ea5e9",
    count: 6,
    description: "Discharge · Bed Transfer · Referral · Transport · Movement · Handover"
  },
  {
    id: "emergency",
    label: "Emergency",
    icon: "bi-lightning-fill",
    color: "#f43f5e",
    count: 4,
    description: "Emergency Code · Deterioration · ICU Team · Emergency OT"
  },
  {
    id: "resources",
    label: "Resources",
    icon: "bi-box-seam-fill",
    color: "#f59e0b",
    count: 5,
    description: "Critical Resources · Blood Bank · Ventilator · Oxygen · Equipment"
  },
  {
    id: "clinical_coord",
    label: "Clinical Coord.",
    icon: "bi-stethoscope",
    color: "#6366f1",
    count: 6,
    description: "Surgery · Specialist · Nurse · IV/Infusion · Lab Escalation · Imaging"
  },
  {
    id: "safety_admin",
    label: "Safety & Admin",
    icon: "bi-shield-fill-check",
    color: "#10b981",
    count: 3,
    description: "Isolation · Incident Report · Medical Documents"
  },
];

export default function OperationsDashboard({ patient, doctorId }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [timelineRefresh, setTimelineRefresh] = useState(0);
  const [showTimeline, setShowTimeline] = useState(false);

  const handleOperationCreated = () => {
    setTimelineRefresh(n => n + 1);
  };

  const renderCategoryContent = () => {
    const props = { patient, doctorId, onOperationCreated: handleOperationCreated };
    switch (activeCategory) {
      case "patient_flow": return <PatientFlowOps {...props} />;
      case "emergency": return <EmergencyOps {...props} />;
      case "resources": return <ResourceOps {...props} />;
      case "clinical_coord": return <ClinicalCoordOps {...props} />;
      case "safety_admin": return <SafetyAdminOps {...props} />;
      default: return null;
    }
  };

  if (!patient) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center flex-column gap-3 text-muted">
        <i className="bi bi-person-bounding-box" style={{ fontSize: "3rem", opacity: 0.3 }} />
        <div>Select a patient to access operations.</div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3 h-100">

      {/* Category Navigation Grid */}
      <div className="d-flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(isActive ? null : cat.id);
                setShowTimeline(false);
              }}
              style={{
                flex: "1 1 auto",
                minWidth: 120,
                maxWidth: 200,
                background: isActive ? `${cat.color}18` : "rgba(255,255,255,0.04)",
                border: `1px solid ${isActive ? cat.color + "60" : "rgba(255,255,255,0.09)"}`,
                borderRadius: 10,
                padding: "10px 12px",
                cursor: "pointer",
                transition: "all 0.15s",
                textAlign: "left"
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className={`bi ${cat.icon}`} style={{ color: cat.color, fontSize: "1rem" }} />
                <span style={{ color: isActive ? cat.color : "#cbd5e1", fontWeight: isActive ? 700 : 500, fontSize: "0.78rem" }}>
                  {cat.label}
                </span>
                <span style={{
                  marginLeft: "auto",
                  background: `${cat.color}25`,
                  color: cat.color,
                  borderRadius: 4,
                  padding: "1px 6px",
                  fontSize: "0.6rem",
                  fontWeight: 700
                }}>{cat.count}</span>
              </div>
              <div style={{ color: "#64748b", fontSize: "0.6rem", lineHeight: 1.3 }}>{cat.description}</div>
            </button>
          );
        })}

        {/* Timeline toggle */}
        <button
          onClick={() => { setShowTimeline(!showTimeline); setActiveCategory(null); }}
          style={{
            flex: "1 1 auto",
            minWidth: 120,
            maxWidth: 200,
            background: showTimeline ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${showTimeline ? "rgba(14,165,233,0.5)" : "rgba(255,255,255,0.09)"}`,
            borderRadius: 10,
            padding: "10px 12px",
            cursor: "pointer",
            transition: "all 0.15s",
            textAlign: "left"
          }}
        >
          <div className="d-flex align-items-center gap-2 mb-1">
            <i className="bi bi-clock-history" style={{ color: "#0ea5e9", fontSize: "1rem" }} />
            <span style={{ color: showTimeline ? "#0ea5e9" : "#cbd5e1", fontWeight: showTimeline ? 700 : 500, fontSize: "0.78rem" }}>
              Activity Log
            </span>
          </div>
          <div style={{ color: "#64748b", fontSize: "0.6rem" }}>Patient's operation history</div>
        </button>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeCategory && (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="flex-grow-1 overflow-auto custom-scrollbar pe-1"
            style={{ minHeight: 0 }}
          >
            {/* Section header */}
            <div className="d-flex align-items-center justify-content-between mb-3">
              {(() => {
                const cat = CATEGORIES.find(c => c.id === activeCategory);
                return (
                  <>
                    <h6 className="m-0 text-white d-flex align-items-center gap-2" style={{ fontSize: "0.85rem" }}>
                      <i className={`bi ${cat?.icon}`} style={{ color: cat?.color }} />
                      {cat?.label}
                      <span className="text-muted" style={{ fontWeight: 400, fontSize: "0.75rem" }}>— {cat?.count} operations</span>
                    </h6>
                    <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => setActiveCategory(null)}>
                      <i className="bi bi-x" />
                    </button>
                  </>
                );
              })()}
            </div>
            {renderCategoryContent()}
          </motion.div>
        )}

        {showTimeline && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="flex-grow-1 overflow-auto custom-scrollbar pe-1"
            style={{ minHeight: 0 }}
          >
            <OperationTimeline patient={patient} refreshSignal={timelineRefresh} />
          </motion.div>
        )}

        {!activeCategory && !showTimeline && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="d-flex flex-column gap-3 flex-grow-1"
          >
            {/* Quick stats row */}
            <div className="row g-2">
              {CATEGORIES.map(cat => (
                <div key={cat.id} className="col-auto">
                  <div
                    className="p-2 rounded-3 d-flex align-items-center gap-2"
                    style={{ background: `${cat.color}10`, border: `1px solid ${cat.color}30`, cursor: "pointer" }}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <i className={`bi ${cat.icon}`} style={{ color: cat.color }} />
                    <div>
                      <div style={{ color: cat.color, fontWeight: 700, fontSize: "0.7rem" }}>{cat.count}</div>
                      <div style={{ color: "#64748b", fontSize: "0.6rem" }}>{cat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Compact timeline preview */}
            <OperationTimeline patient={patient} refreshSignal={timelineRefresh} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
