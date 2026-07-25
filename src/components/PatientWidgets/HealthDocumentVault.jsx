import { useState } from "react";
import { motion } from "motion/react";

const CATEGORIES = [
  { name: "Prescriptions", icon: "bi-file-earmark-medical", color: "#0ea5e9", docs: [
    { name: "Ceftriaxone 1g IV", date: "Jun 17, 2026", by: "Dr. Chen" },
    { name: "Metoprolol 25mg", date: "Jun 16, 2026", by: "Dr. Chen" },
  ]},
  { name: "Lab Reports", icon: "bi-clipboard2-pulse", color: "#10b981", docs: [
    { name: "Complete Blood Count", date: "Jun 17, 2026", by: "Lab" },
    { name: "Metabolic Panel", date: "Jun 16, 2026", by: "Lab" },
    { name: "Cardiac Enzymes", date: "Jun 15, 2026", by: "Lab" },
  ]},
  { name: "Imaging", icon: "bi-radioactive", color: "#f59e0b", docs: [
    { name: "Chest X-Ray", date: "Jun 16, 2026", by: "Radiology" },
    { name: "ECG Report", date: "Jun 15, 2026", by: "Cardiology" },
  ]},
  { name: "Discharge Summary", icon: "bi-box-arrow-right", color: "#8b5cf6", docs: [] },
  { name: "Insurance", icon: "bi-shield-check", color: "#06b6d4", docs: [
    { name: "Insurance Card Copy", date: "Jun 14, 2026", by: "Admissions" },
  ]},
  { name: "Consent Forms", icon: "bi-pen", color: "#64748b", docs: [
    { name: "Treatment Consent", date: "Jun 14, 2026", by: "Admissions" },
    { name: "Data Privacy Consent", date: "Jun 14, 2026", by: "Admissions" },
  ]},
];

export default function HealthDocumentVault() {
  const [expanded, setExpanded] = useState(null);

  return (
    <motion.div className="glass-panel p-4 hud-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h3 className="hud-card-title mb-3"><i className="bi bi-folder2-open me-2" />Health Document Vault</h3>
      <div className="d-flex flex-column gap-2">
        {CATEGORIES.map(cat => (
          <div key={cat.name}>
            <button onClick={() => setExpanded(expanded === cat.name ? null : cat.name)} className="w-100 d-flex align-items-center gap-2 p-2 rounded-2 border-0" style={{ background: expanded === cat.name ? `${cat.color}10` : "rgba(255,255,255,0.03)", border: `1px solid ${expanded === cat.name ? `${cat.color}30` : "rgba(255,255,255,0.06)"}`, cursor: "pointer", transition: "all 0.2s" }}>
              <i className={`bi ${cat.icon}`} style={{ color: cat.color, fontSize: "1rem" }} />
              <span className="fw-bold small text-white flex-grow-1 text-start">{cat.name}</span>
              <span className="badge" style={{ background: "rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: "0.6rem" }}>{cat.docs.length}</span>
              <i className={`bi ${expanded === cat.name ? "bi-chevron-up" : "bi-chevron-down"}`} style={{ color: "#64748b", fontSize: "0.7rem" }} />
            </button>
            {expanded === cat.name && cat.docs.length > 0 && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="ms-4 mt-1 d-flex flex-column gap-1">
                {cat.docs.map(doc => (
                  <div key={doc.name} className="d-flex align-items-center gap-2 p-2 rounded-2" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <i className="bi bi-file-earmark-text" style={{ color: "#64748b", fontSize: "0.8rem" }} />
                    <div className="flex-grow-1">
                      <div style={{ fontSize: "0.72rem", color: "#e2e8f0" }}>{doc.name}</div>
                      <div style={{ fontSize: "0.58rem", color: "#64748b" }}>{doc.date} · {doc.by}</div>
                    </div>
                    <button className="btn btn-sm p-0 border-0" style={{ color: "#0ea5e9", fontSize: "0.7rem" }} title="Download"><i className="bi bi-download" /></button>
                  </div>
                ))}
              </motion.div>
            )}
            {expanded === cat.name && cat.docs.length === 0 && (
              <div className="ms-4 mt-1 p-2 text-center" style={{ fontSize: "0.65rem", color: "#64748b" }}>No documents yet</div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
