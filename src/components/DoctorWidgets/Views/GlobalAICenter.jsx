export default function GlobalAICenter({ doctorId, dashboardStats }) {
  return (
    <div className="h-100 d-flex flex-column p-4 overflow-auto custom-scrollbar text-white">
      
      <div className="mb-4">
        <h4 className="fw-bold mb-1">AI Clinical Center</h4>
        <div className="text-muted small">Global AI surveillance and recommendations across your assigned patients.</div>
      </div>

      <div className="row g-4">
        
        {/* Left: Priority Queue & Risk Monitor */}
        <div className="col-12 col-xl-7 d-flex flex-column gap-4">
          
          <div className="glass-panel p-4 rounded-4" style={{ background: "rgba(10,15,28,0.7)" }}>
            <h6 className="text-white mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-robot text-primary"></i> AI Priority Queue
            </h6>
            <div className="text-muted small text-center py-4">
              <i className="bi bi-shield-check fs-2 opacity-25 mb-2"></i>
              <div>No patients currently flagged for priority review by AI.</div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-4 flex-grow-1" style={{ background: "rgba(10,15,28,0.7)" }}>
            <h6 className="text-white mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-activity text-danger"></i> Risk Monitor
            </h6>
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle">
                <thead>
                  <tr>
                    <th className="text-muted small fw-normal border-secondary border-opacity-25">PATIENT</th>
                    <th className="text-muted small fw-normal border-secondary border-opacity-25">TRIAGE</th>
                    <th className="text-muted small fw-normal border-secondary border-opacity-25">AI RISK</th>
                    <th className="text-muted small fw-normal border-secondary border-opacity-25">REASON</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-4 small">No critical risk flags detected.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right: AI Recommendations */}
        <div className="col-12 col-xl-5 d-flex flex-column gap-4">
          
          <div className="glass-panel p-4 rounded-4 h-100" style={{ background: "rgba(14,165,233,0.05)", border: "1px solid rgba(14,165,233,0.2)" }}>
            <h6 className="text-white mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-stars text-primary"></i> AI Recommendations
            </h6>
            <div className="p-2 rounded mb-3" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b", fontSize: "0.7rem" }}>
              <i className="bi bi-exclamation-triangle-fill me-1"></i> AI must NEVER automatically perform clinical operations. Doctor review is required.
            </div>

            <div className="text-muted text-center py-5 small">
              No new recommendations. AI continuously monitors patient vitals and lab results.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
