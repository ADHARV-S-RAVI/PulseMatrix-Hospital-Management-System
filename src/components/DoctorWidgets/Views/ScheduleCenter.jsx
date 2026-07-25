export default function ScheduleCenter({ doctorId }) {
  return (
    <div className="h-100 d-flex flex-column p-4 overflow-auto custom-scrollbar text-white">
      
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="fw-bold mb-1">Schedule Center</h4>
          <div className="text-muted small">Manage your daily appointments, surgeries, and shifts.</div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-primary">Day View</button>
          <button className="btn btn-sm btn-outline-secondary text-white">Week View</button>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-4 flex-grow-1" style={{ background: "rgba(10,15,28,0.7)" }}>
        <h6 className="text-white mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-calendar-check text-info"></i> Today's Schedule
        </h6>
        
        <div className="d-flex flex-column gap-3">
          <div className="d-flex align-items-start gap-4 p-3 rounded" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="text-info fw-bold font-monospace" style={{ fontSize: "1rem" }}>20:30</div>
            <div style={{ flex: 1, borderLeft: "2px solid #0ea5e9", paddingLeft: 16 }}>
              <div className="d-flex justify-content-between align-items-start mb-1">
                <div className="fw-bold text-white">Emergency Surgery — Appendectomy</div>
                <span className="badge bg-danger">Critical</span>
              </div>
              <div className="text-muted small mb-2">OT-2 • Patient: David Chen</div>
              <button className="btn btn-sm btn-outline-info py-0 px-2" style={{ fontSize: "0.75rem" }}>View Details</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
