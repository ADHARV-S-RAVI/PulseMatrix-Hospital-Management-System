import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getDoctorPatients } from "../../services/api";

const MOCK_PATIENTS = [
  { patient_id: 1, name: "John Doe", age: 45, gender: "M", severity_score: 92, department: "Cardiology", assigned_bed_type: "ICU Bed", status: "Critical" },
  { patient_id: 2, name: "Sarah Smith", age: 34, gender: "F", severity_score: 75, department: "Neurology", assigned_bed_type: "Standard Bed", status: "Major" },
  { patient_id: 3, name: "Michael Johnson", age: 58, gender: "M", severity_score: 45, department: "Internal Med", assigned_bed_type: "Standard Bed", status: "Moderate" },
  { patient_id: 4, name: "Emily Davis", age: 29, gender: "F", severity_score: 20, department: "Orthopedics", assigned_bed_type: "Wheelchair", status: "Minor" }
];

export default function AssignedPatientsList({ doctorId, onSelectPatient, selectedPatientId }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, critical, stable

  useEffect(() => {
    async function loadPatients() {
      try {
        const data = await getDoctorPatients(doctorId);
        setPatients(data && data.length > 0 ? data : MOCK_PATIENTS);
      } catch (err) {
        console.error("Failed to load doctor patients, using mock", err);
        setPatients(MOCK_PATIENTS);
      } finally {
        setLoading(false);
      }
    }
    loadPatients();
  }, [doctorId]);

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" ? true : filter === "critical" ? p.severity_score >= 70 : p.severity_score < 70;
    return matchSearch && matchFilter;
  });

  const getSeverityColor = (score) => {
    if (score >= 90) return "#f43f5e";
    if (score >= 70) return "#f59e0b";
    if (score >= 50) return "#0ea5e9";
    return "#10b981";
  };

  return (
    <div className="glass-panel d-flex flex-column h-100 p-3" style={{ background: "rgba(15,23,42,0.6)" }}>
      <h4 className="fw-bold text-white mb-3" style={{ fontSize: "1rem" }}><i className="bi bi-people-fill me-2 text-primary" />Patient Queue</h4>
      
      <div className="mb-3 d-flex gap-2">
        <div className="position-relative flex-grow-1">
          <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
          <input 
            type="text" 
            className="form-control form-control-sm bg-dark text-white border-secondary ps-4" 
            placeholder="Search patients..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select form-select-sm bg-dark text-white border-secondary" style={{ width: "auto" }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="critical">Critical</option>
          <option value="stable">Stable</option>
        </select>
      </div>

      <div className="flex-grow-1 overflow-auto pe-1 custom-scrollbar">
        {loading ? (
          <div className="text-center p-3"><div className="spinner-border text-primary spinner-border-sm" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-3 text-muted small">No patients found.</div>
        ) : (
          <AnimatePresence>
            {filtered.map(p => {
              const color = getSeverityColor(p.severity_score);
              const isSelected = selectedPatientId === p.patient_id;
              return (
                <motion.div 
                  key={p.patient_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="mb-2 p-2 rounded-3"
                  style={{ 
                    background: isSelected ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.03)", 
                    border: `1px solid ${isSelected ? "#0ea5e9" : "rgba(255,255,255,0.05)"}`,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onClick={() => onSelectPatient(p)}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-white" style={{ fontSize: "0.85rem" }}>{p.name}</span>
                    <span className="badge" style={{ background: `${color}20`, color, fontSize: "0.6rem" }}>Score: {p.severity_score}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted" style={{ fontSize: "0.7rem" }}>{p.department} · {p.assigned_bed_type || "No Bed"}</span>
                    {p.severity_score >= 90 && <i className="bi bi-exclamation-triangle-fill text-danger" style={{ animation: "blink 1s infinite" }} />}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
      `}</style>
    </div>
  );
}
