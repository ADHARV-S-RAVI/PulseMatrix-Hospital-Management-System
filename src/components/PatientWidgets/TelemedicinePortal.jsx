import { useState, useEffect } from "react";
import { motion } from "motion/react";

export default function TelemedicinePortal() {
  const [callState, setCallState] = useState("idle"); // idle | connecting | active | ended
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (callState !== "active") return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [callState]);

  const startCall = () => {
    setCallState("connecting");
    setTimeout(() => setCallState("active"), 3000);
  };
  const endCall = () => { setCallState("ended"); setElapsed(0); setTimeout(() => setCallState("idle"), 2000); };
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <motion.div className="glass-panel p-4 hud-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h3 className="hud-card-title mb-3"><i className="bi bi-camera-video me-2" />Telemedicine Portal</h3>

      <div className="rounded-3 d-flex flex-column align-items-center justify-content-center p-4" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", minHeight: 180 }}>
        {callState === "idle" && (
          <>
            <div className="mb-3 text-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" style={{ width: 60, height: 60, background: "rgba(14,165,233,0.1)", border: "2px solid rgba(14,165,233,0.3)" }}>
                <i className="bi bi-person-badge" style={{ fontSize: "1.5rem", color: "#0ea5e9" }} />
              </div>
              <div className="fw-bold small text-white">Dr. Sarah Chen</div>
              <div style={{ fontSize: "0.65rem", color: "#10b981" }}><i className="bi bi-circle-fill me-1" style={{ fontSize: "0.4rem" }} />Available for consultation</div>
            </div>
            <button onClick={startCall} className="btn btn-sm px-4 py-2 rounded-pill fw-bold" style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontSize: "0.8rem" }}>
              <i className="bi bi-telephone me-2" />Start Video Consultation
            </button>
          </>
        )}
        {callState === "connecting" && (
          <div className="text-center">
            <div className="spinner-border text-info mb-2" style={{ width: 40, height: 40 }} />
            <div className="small text-info fw-bold" style={{ letterSpacing: 2 }}>CONNECTING...</div>
            <div style={{ fontSize: "0.6rem", color: "#94a3b8" }}>Establishing secure video link</div>
          </div>
        )}
        {callState === "active" && (
          <div className="text-center">
            <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" style={{ width: 70, height: 70, background: "rgba(16,185,129,0.15)", border: "2px solid #10b981", animation: "pulse 2s infinite" }}>
              <i className="bi bi-camera-video-fill" style={{ fontSize: "1.8rem", color: "#10b981" }} />
            </div>
            <div className="fw-bold text-white mb-1">Call in Progress</div>
            <div className="badge mb-3" style={{ background: "rgba(16,185,129,0.2)", color: "#10b981", fontSize: "0.9rem", fontFamily: "monospace" }}>{fmt(elapsed)}</div>
            <div><button onClick={endCall} className="btn btn-sm px-4 py-1 rounded-pill" style={{ background: "#f43f5e", color: "#fff", fontSize: "0.75rem" }}><i className="bi bi-telephone-x me-1" />End Call</button></div>
          </div>
        )}
        {callState === "ended" && (
          <div className="text-center">
            <i className="bi bi-check-circle text-success" style={{ fontSize: "2rem" }} />
            <div className="small text-success fw-bold mt-1">Consultation Complete</div>
          </div>
        )}
      </div>

      <div className="mt-3 d-flex gap-2">
        <div className="flex-fill p-2 rounded-2 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "0.6rem", color: "#64748b" }}>Next Scheduled</div>
          <div className="small fw-bold text-white">Jun 20, 3:00 PM</div>
        </div>
        <div className="flex-fill p-2 rounded-2 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "0.6rem", color: "#64748b" }}>Past Sessions</div>
          <div className="small fw-bold text-white">3 completed</div>
        </div>
      </div>
    </motion.div>
  );
}
