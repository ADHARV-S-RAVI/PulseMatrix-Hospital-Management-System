import { useState } from "react";
import EHRViewer from "../EHRViewer";

export default function GlobalClinicalWorkspace({ doctorId, onSelectPatient }) {
  return (
    <div className="h-100 d-flex flex-column p-4 overflow-auto custom-scrollbar text-white">
      
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Global Clinical Workspace</h4>
        <div className="text-muted small">Access clinical modules across all patients. For patient-specific workflows, select a patient from <b>My Patients</b>.</div>
      </div>

      <div className="glass-panel p-4 rounded-4 flex-grow-1" style={{ background: "rgba(10,15,28,0.7)" }}>
        <EHRViewer patient={null} doctorId={doctorId} />
      </div>

    </div>
  );
}
