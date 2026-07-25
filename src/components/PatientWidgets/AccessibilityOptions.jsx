import { useState } from "react";
import { motion } from "motion/react";

export default function AccessibilityOptions() {
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [language, setLanguage] = useState("en");

  const toggle = (setter, val) => setter(!val);

  return (
    <motion.div className="glass-panel p-4 hud-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h3 className="hud-card-title mb-3"><i className="bi bi-universal-access me-2" />Accessibility</h3>
      <div className="d-flex flex-column gap-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-bold small text-white">Large Text Mode</div>
            <div style={{ fontSize: "0.6rem", color: "#64748b" }}>Increases font size across all panels</div>
          </div>
          <button onClick={() => toggle(setLargeText, largeText)} className="btn btn-sm px-3 py-1" style={{ background: largeText ? "#0ea5e9" : "rgba(255,255,255,0.05)", color: largeText ? "#fff" : "#94a3b8", border: `1px solid ${largeText ? "#0ea5e9" : "rgba(255,255,255,0.1)"}`, fontSize: "0.65rem" }}>
            {largeText ? "ON" : "OFF"}
          </button>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-bold small text-white">High Contrast</div>
            <div style={{ fontSize: "0.6rem", color: "#64748b" }}>Enhanced color visibility for readability</div>
          </div>
          <button onClick={() => toggle(setHighContrast, highContrast)} className="btn btn-sm px-3 py-1" style={{ background: highContrast ? "#0ea5e9" : "rgba(255,255,255,0.05)", color: highContrast ? "#fff" : "#94a3b8", border: `1px solid ${highContrast ? "#0ea5e9" : "rgba(255,255,255,0.1)"}`, fontSize: "0.65rem" }}>
            {highContrast ? "ON" : "OFF"}
          </button>
        </div>
        <div>
          <div className="fw-bold small text-white mb-1">Language</div>
          <div className="d-flex gap-1">
            {[{ code: "en", label: "English" }, { code: "es", label: "Español" }, { code: "hi", label: "हिन्दी" }, { code: "fr", label: "Français" }].map(l => (
              <button key={l.code} onClick={() => setLanguage(l.code)} className="badge border-0" style={{ background: language === l.code ? "#0ea5e9" : "rgba(255,255,255,0.05)", color: language === l.code ? "#fff" : "#94a3b8", cursor: "pointer", fontSize: "0.6rem", padding: "4px 8px" }}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-bold small text-white">Voice Navigation</div>
            <div style={{ fontSize: "0.6rem", color: "#64748b" }}>Voice-assisted commands for hands-free use</div>
          </div>
          <span className="badge" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", fontSize: "0.55rem" }}>Coming Soon</span>
        </div>
      </div>
    </motion.div>
  );
}
