import { useState, useEffect } from "react";
import { getDoctorPatients } from "../../../services/api";

export default function MyPatientsView({ doctorId, onSelectPatient }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All"); // All, Critical, High, Medium, Low
  
  useEffect(() => {
    getDoctorPatients(doctorId)
      .then(data => setPatients(data || []))
      .finally(() => setLoading(false));
  }, [doctorId]);

  const filteredPatients = patients.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.patient_id.toString().includes(search)) return false;
    if (filter !== "All") {
      if (filter === "Critical" && p.severity_score < 70) return false;
      if (filter === "High" && (p.severity_score < 50 || p.severity_score >= 70)) return false;
      if (filter === "Stable" && p.severity_score >= 50) return false;
    }
    return true;
  });

  return (
    <div className="h-100 d-flex flex-column p-4 overflow-auto custom-scrollbar text-white">
      
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">My Patients</h4>
          <div className="text-muted small">Manage all your assigned patients.</div>
        </div>
        <div className="d-flex gap-2">
          <div className="position-relative">
            <i className="bi bi-search position-absolute text-muted" style={{ left: 10, top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem" }}></i>
            <input 
              type="text" 
              className="form-control form-control-sm bg-dark text-white border-secondary" 
              placeholder="Search patients..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 28, width: 200 }} 
            />
          </div>
          <select 
            className="form-select form-select-sm bg-dark text-white border-secondary" 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ width: 120 }}
          >
            <option value="All">All Status</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Stable">Stable</option>
          </select>
        </div>
      </div>

      <div className="flex-grow-1">
        {loading ? (
          <div className="text-center py-5 text-muted"><div className="spinner-border text-primary spinner-border-sm mb-2" /><br/>Loading...</div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-5 text-muted">No patients found matching the criteria.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle">
              <thead>
                <tr>
                  <th className="text-muted small fw-normal border-secondary border-opacity-25" style={{ letterSpacing: "1px" }}>PATIENT</th>
                  <th className="text-muted small fw-normal border-secondary border-opacity-25" style={{ letterSpacing: "1px" }}>ID</th>
                  <th className="text-muted small fw-normal border-secondary border-opacity-25" style={{ letterSpacing: "1px" }}>DEPT / LOCATION</th>
                  <th className="text-muted small fw-normal border-secondary border-opacity-25" style={{ letterSpacing: "1px" }}>STATUS</th>
                  <th className="text-muted small fw-normal border-secondary border-opacity-25" style={{ letterSpacing: "1px" }}>SCORE</th>
                  <th className="text-muted small fw-normal border-secondary border-opacity-25 text-end" style={{ letterSpacing: "1px" }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(p => {
                  const isCritical = p.severity_score >= 70;
                  const isHigh = p.severity_score >= 50 && p.severity_score < 70;
                  const badgeColor = isCritical ? "#f43f5e" : isHigh ? "#f59e0b" : "#10b981";
                  const badgeText = isCritical ? "CRITICAL" : isHigh ? "HIGH" : "STABLE";

                  return (
                    <tr key={p.patient_id} style={{ cursor: "pointer" }} onClick={() => onSelectPatient(p)}>
                      <td>
                        <div className="fw-bold">{p.name}</div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>{p.age}y {p.gender}</div>
                      </td>
                      <td className="text-muted font-monospace small">#{p.patient_id}</td>
                      <td>
                        <div>{p.department}</div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>{p.assigned_bed_type || "No Bed"}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.65rem", background: `${badgeColor}20`, color: badgeColor, border: `1px solid ${badgeColor}40`, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                          {badgeText}
                        </span>
                      </td>
                      <td className={`fw-bold ${isCritical ? 'text-danger' : 'text-white'}`}>{p.severity_score}</td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-primary py-0 px-2" style={{ fontSize: "0.75rem" }}>
                          Open <i className="bi bi-arrow-right"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
