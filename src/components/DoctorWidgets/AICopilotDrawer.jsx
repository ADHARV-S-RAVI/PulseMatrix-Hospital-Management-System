export default function AICopilotDrawer({ open, onClose, patient }) {
  if (!open) return null;
  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 1050 }} onClick={onClose} />
      <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 350, zIndex: 1051, background: "rgba(10,15,28,0.95)", borderLeft: "1px solid rgba(14,165,233,0.3)", padding: 20 }}>
        <h5 className="text-white"><i className="bi bi-stars text-primary me-2"></i>AI Copilot</h5>
        <div className="text-muted small mb-4">Patient: {patient?.name || "None"}</div>
        <div className="text-white">AI Copilot Chat Stub</div>
        <button className="btn btn-sm btn-outline-secondary mt-3" onClick={onClose}>Close</button>
      </div>
    </>
  );
}
