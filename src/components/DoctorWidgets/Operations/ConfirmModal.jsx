// ConfirmModal.jsx — High-risk action confirmation dialog
import { motion, AnimatePresence } from "motion/react";

export default function ConfirmModal({ open, title, patient, action, description, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "danger", loading = false }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: 460,
            width: "100%",
            background: "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(10,15,28,0.98))",
            border: "1px solid rgba(244,63,94,0.4)",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 0 40px rgba(244,63,94,0.15)",
          }}
        >
          {/* Header */}
          <div className="d-flex align-items-center gap-2 mb-4">
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(244,63,94,0.15)", border: "1px solid rgba(244,63,94,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: "1rem" }} />
            </div>
            <h5 className="m-0 text-white fw-bold" style={{ letterSpacing: "0.5px" }}>{title}</h5>
          </div>

          {/* Patient Context */}
          {patient && (
            <div className="mb-4 p-3 rounded-3" style={{ background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)" }}>
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className="bi bi-person-bounding-box text-info" />
                <span className="text-white fw-bold" style={{ fontSize: "0.9rem" }}>{patient.name}</span>
              </div>
              <div className="d-flex gap-3 text-muted" style={{ fontSize: "0.75rem" }}>
                <span><i className="bi bi-hash me-1" />{patient.patient_id}</span>
                <span><i className="bi bi-hospital me-1" />{patient.department}</span>
                {patient.severity_score >= 70 && (
                  <span className="text-danger"><i className="bi bi-exclamation-triangle me-1" />Score: {patient.severity_score}</span>
                )}
              </div>
            </div>
          )}

          {/* Action Description */}
          <div className="mb-4">
            <div className="text-muted mb-1" style={{ fontSize: "0.75rem", letterSpacing: "1px", textTransform: "uppercase" }}>Action</div>
            <div className="text-white fw-bold" style={{ fontSize: "1rem" }}>{action}</div>
            {description && <p className="text-muted mt-2 mb-0" style={{ fontSize: "0.8rem", lineHeight: 1.5 }}>{description}</p>}
          </div>

          {/* Buttons */}
          <div className="d-flex gap-3">
            <button
              className="btn btn-outline-secondary flex-grow-1"
              onClick={onCancel}
              disabled={loading}
              style={{ borderRadius: 8 }}
            >
              Cancel
            </button>
            <button
              className={`btn btn-${confirmVariant} flex-grow-1 fw-bold`}
              onClick={onConfirm}
              disabled={loading}
              style={{ borderRadius: 8 }}
            >
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
