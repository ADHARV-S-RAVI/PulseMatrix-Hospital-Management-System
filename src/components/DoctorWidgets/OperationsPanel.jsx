// OperationsPanel.jsx — Now delegates to OperationsDashboard with categorized navigation
// All 4 original features (Discharge, Surgery, Bed Transfer, Critical Resources) are preserved
// inside PatientFlowOps and ResourceOps categories respectively.
import { motion } from "motion/react";
import OperationsDashboard from "./Operations/OperationsDashboard";

export default function OperationsPanel({ patient, doctorId }) {
  if (!patient) return (
    <div className="h-100 d-flex align-items-center justify-content-center text-muted flex-column gap-3">
      <i className="bi bi-sliders" style={{ fontSize: "3rem", opacity: 0.3 }} />
      <div>Select a patient to access the operations center.</div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-100 d-flex flex-column"
    >
      <OperationsDashboard patient={patient} doctorId={doctorId} />
    </motion.div>
  );
}
