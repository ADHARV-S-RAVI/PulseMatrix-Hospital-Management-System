import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

export default function AIHologramAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMessage, setActiveMessage] = useState("System standby. Monitoring emergency protocols...");

  const recommendations = [
    "Alert: Elevated ICU occupancy in Sector 4. Suggest redirecting non-critical cases.",
    "Optimization: Physician 'Dr. Sarah' has 20% capacity. Assigned to triage #204.",
    "Critical: AI Engine predicts 82% risk of cardiac arrest for Patient #8812.",
  ];

  const handleInteraction = () => {
    const randomMsg = recommendations[Math.floor(Math.random() * recommendations.length)];
    setActiveMessage(randomMsg);
    setIsOpen(true);
  };

  return (
    <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 1000 }}>
      {/* The Holographic Trigger / Avatar */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleInteraction}
        style={{ cursor: "pointer", position: "relative" }}
      >
        <div style={{
          width: "70px", height: "70px", 
          background: "radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, transparent 70%)",
          borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid rgba(14, 165, 233, 0.3)",
          boxShadow: "0 0 20px rgba(14, 165, 233, 0.5)"
        }}>
          <i className="bi bi-person-bounding-box" style={{ fontSize: "1.8rem", color: "#0ea5e9" }} />
        </div>
        
        {/* Floating Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", inset: -5, border: "1px dashed rgba(14, 165, 233, 0.4)", borderRadius: "50%" }}
        />
      </motion.div>

      {/* Hologram Display Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            style={{
              position: "absolute", bottom: "90px", right: "0", width: "300px",
              background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(14, 165, 233, 0.3)", borderRadius: "16px",
              padding: "20px", color: "white", boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", background: "#0ea5e9", borderRadius: "50%", animation: "pulse 1s infinite" }} />
                <span style={{ fontSize: "0.7rem", fontWeight: "bold", letterSpacing: "1px", color: "#0ea5e9" }}>AI ASSISTANT</span>
              </div>
              <i className="bi bi-x-lg" style={{ cursor: "pointer", fontSize: "0.8rem" }} onClick={() => setIsOpen(false)} />
            </div>

            <motion.p 
              key={activeMessage}
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              style={{ fontSize: "0.85rem", lineHeight: "1.5", color: "#e2e8f0", margin: 0 }}
            >
              "{activeMessage}"
            </motion.p>

            <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
              <button style={{ flex: 1, background: "rgba(14, 165, 233, 0.2)", border: "1px solid #0ea5e9", color: "#0ea5e9", padding: "6px", borderRadius: "6px", fontSize: "0.7rem" }}>
                Execute Sync
              </button>
              <button style={{ flex: 1, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", padding: "6px", borderRadius: "6px", fontSize: "0.7rem" }}>
                Dismiss
              </button>
            </div>

            {/* Scanline effect */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "repeating-linear-gradient(transparent, transparent 2px, rgba(14, 165, 233, 0.05) 3px, rgba(14, 165, 233, 0.05) 3px)", borderRadius: "16px" }} />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
