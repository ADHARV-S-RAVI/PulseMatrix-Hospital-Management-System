import { useState } from "react";
import TelemedicinePanel from "../TelemedicinePanel";

export default function GlobalTelemedicine({ doctorId }) {
  return (
    <div className="h-100 d-flex flex-column p-4 overflow-auto custom-scrollbar text-white">
      
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Telemedicine Center</h4>
        <div className="text-muted small">Manage virtual consultations and secure messages.</div>
      </div>

      <div className="glass-panel p-4 rounded-4 flex-grow-1" style={{ background: "rgba(10,15,28,0.7)" }}>
        <TelemedicinePanel patient={null} doctorId={doctorId} />
      </div>

    </div>
  );
}
