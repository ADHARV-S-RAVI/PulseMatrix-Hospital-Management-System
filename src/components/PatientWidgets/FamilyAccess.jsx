import { useState } from "react";
import { motion } from "motion/react";

const FAMILY_MEMBERS = [
  { name: "Robert Vance", relation: "Spouse", access: true, lastViewed: "10 min ago" },
  { name: "Maria Vance", relation: "Daughter", access: true, lastViewed: "1 hr ago" },
  { name: "James Vance", relation: "Son", access: false, lastViewed: "—" },
];

export default function FamilyAccess() {
  const [members, setMembers] = useState(FAMILY_MEMBERS);
  const [shareLink, setShareLink] = useState(null);

  const toggleAccess = (name) => setMembers(prev => prev.map(m => m.name === name ? { ...m, access: !m.access } : m));
  const generateLink = () => setShareLink(`https://pulsematrix.hospital/share/${Math.random().toString(36).slice(2, 10)}`);

  return (
    <motion.div className="glass-panel p-4 hud-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h3 className="hud-card-title mb-3"><i className="bi bi-people me-2" />Family Access Dashboard</h3>
      <div className="d-flex flex-column gap-2 mb-3">
        {members.map(m => (
          <div key={m.name} className="d-flex align-items-center gap-2 p-2 rounded-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, background: m.access ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)", color: m.access ? "#10b981" : "#64748b", fontSize: "0.8rem", flexShrink: 0 }}>
              <i className="bi bi-person" />
            </div>
            <div className="flex-grow-1">
              <div className="fw-bold" style={{ fontSize: "0.75rem", color: "#e2e8f0" }}>{m.name}</div>
              <div style={{ fontSize: "0.6rem", color: "#64748b" }}>{m.relation} · Last viewed: {m.lastViewed}</div>
            </div>
            <button onClick={() => toggleAccess(m.name)} className="btn btn-sm px-2 py-0" style={{ background: m.access ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)", color: m.access ? "#10b981" : "#64748b", fontSize: "0.6rem", border: `1px solid ${m.access ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.1)"}` }}>
              {m.access ? "Active" : "Disabled"}
            </button>
          </div>
        ))}
      </div>
      <button onClick={generateLink} className="btn btn-sm w-100 py-1" style={{ background: "rgba(14,165,233,0.1)", color: "#0ea5e9", border: "1px solid rgba(14,165,233,0.2)", fontSize: "0.7rem" }}>
        <i className="bi bi-link-45deg me-1" />Generate Share Link
      </button>
      {shareLink && (
        <div className="mt-2 p-2 rounded-2" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)" }}>
          <div style={{ fontSize: "0.6rem", color: "#64748b" }}>Share this link with authorized family:</div>
          <code style={{ fontSize: "0.6rem", color: "#0ea5e9", wordBreak: "break-all" }}>{shareLink}</code>
        </div>
      )}
    </motion.div>
  );
}
