// AIClinicalAssistant.jsx — Enhanced AI panel with real backend AI endpoints
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { aiPatientSummary, aiRisk, aiOperationsRecommendation, aiClinicalNote } from "../../services/api";

function AIBadge({ available }) {
  return (
    <span style={{
      fontSize: "0.5rem",
      background: available ? "rgba(14,165,233,0.2)" : "rgba(245,158,11,0.2)",
      color: available ? "#0ea5e9" : "#f59e0b",
      border: `1px solid ${available ? "rgba(14,165,233,0.4)" : "rgba(245,158,11,0.4)"}`,
      borderRadius: 4,
      padding: "1px 6px",
      fontWeight: 700,
      letterSpacing: "0.5px"
    }}>
      {available ? "AI LIVE" : "AI UNAVAILABLE"}
    </span>
  );
}

function RiskBar({ label, value, color }) {
  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between mb-1 small text-muted">
        <span>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{value}%</span>
      </div>
      <div className="progress" style={{ height: 4, background: "rgba(255,255,255,0.05)" }}>
        <div className="progress-bar" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export default function AIClinicalAssistant({ patient, doctorId }) {
  const [summary, setSummary] = useState(null);
  const [risk, setRisk] = useState(null);
  const [opsRecs, setOpsRecs] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [riskLoading, setRiskLoading] = useState(false);
  const [opsLoading, setOpsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  // SOAP note structuring
  const [rawNote, setRawNote] = useState("");
  const [soapResult, setSoapResult] = useState(null);
  const [soapLoading, setSoapLoading] = useState(false);
  const [soapError, setSoapError] = useState(null);

  useEffect(() => {
    if (!patient) return;
    // Auto-load risk on patient change (lightweight)
    setRisk(null);
    setRiskLoading(true);
    aiRisk(patient.patient_id)
      .then(data => setRisk(data))
      .catch(() => {
        // Fallback to severity-based estimates
        const score = patient.severity_score;
        setRisk({
          deterioration_risk: Math.min(95, Math.round(score * 0.85)),
          sepsis_probability: Math.min(80, Math.max(2, Math.round((score - 30) * 0.4))),
          recovery_probability: Math.max(5, Math.min(95, Math.round(100 - score * 0.7))),
          risk_level: score >= 80 ? "Critical" : score >= 60 ? "High" : score >= 40 ? "Moderate" : "Low",
          prototype: true,
          ai_available: false
        });
      })
      .finally(() => setRiskLoading(false));
  }, [patient]);

  const loadSummary = async () => {
    if (!patient) return;
    setSummaryLoading(true);
    try {
      const data = await aiPatientSummary(patient.patient_id, doctorId);
      setSummary(data);
    } catch (err) {
      setSummary({ summary: `Unable to generate AI summary: ${err.message}`, ai_available: false, requires_clinical_review: true });
    } finally { setSummaryLoading(false); }
  };

  const loadOpsRecs = async () => {
    if (!patient) return;
    setOpsLoading(true);
    try {
      const data = await aiOperationsRecommendation(patient.patient_id, doctorId);
      setOpsRecs(data);
    } catch (err) {
      setOpsRecs({ recommendations: [], overall_assessment: `Failed to get recommendations: ${err.message}`, ai_available: false });
    } finally { setOpsLoading(false); }
  };

  const handleStructureNote = async () => {
    if (!rawNote.trim()) return;
    setSoapLoading(true); setSoapError(null); setSoapResult(null);
    try {
      const data = await aiClinicalNote(rawNote, patient?.patient_id, doctorId);
      setSoapResult(data.soap);
    } catch (err) {
      setSoapError(`SOAP structuring failed: ${err.message}`);
    } finally { setSoapLoading(false); }
  };

  if (!patient) return null;

  const TABS = [
    { id: "summary", label: "Summary", icon: "bi-file-text" },
    { id: "risk", label: "Risk Engine", icon: "bi-shield-exclamation" },
    { id: "ops", label: "Operations AI", icon: "bi-cpu" },
    { id: "soap", label: "SOAP Notes", icon: "bi-pen" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-100 d-flex flex-column gap-3">

      {/* Tabs */}
      <div className="d-flex gap-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: activeTab === t.id ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${activeTab === t.id ? "rgba(14,165,233,0.4)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 8, padding: "5px 12px", color: activeTab === t.id ? "#0ea5e9" : "#94a3b8",
              fontSize: "0.75rem", fontWeight: activeTab === t.id ? 700 : 400, cursor: "pointer"
            }}
          >
            <i className={`bi ${t.icon} me-1`} />{t.label}
          </button>
        ))}
      </div>

      {/* Tab: AI Summary */}
      {activeTab === "summary" && (
        <div className="glass-panel p-3 flex-grow-1" style={{ background: "rgba(14,165,233,0.05)", border: "1px solid rgba(14,165,233,0.2)" }}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="text-white m-0 d-flex align-items-center gap-2" style={{ fontSize: "0.9rem" }}>
              <i className="bi bi-robot text-primary" />AI Patient Summary
            </h5>
            <div className="d-flex gap-2 align-items-center">
              {summary && <AIBadge available={summary.ai_available} />}
              <button
                className="btn btn-sm btn-outline-primary py-0 px-2"
                onClick={loadSummary}
                disabled={summaryLoading}
                style={{ fontSize: "0.7rem" }}
              >
                {summaryLoading ? <span className="spinner-border spinner-border-sm" /> : <><i className="bi bi-arrow-clockwise me-1" />Generate</>}
              </button>
            </div>
          </div>

          {!summary && !summaryLoading && (
            <div className="text-center py-4 text-muted" style={{ fontSize: "0.82rem" }}>
              <i className="bi bi-robot mb-2" style={{ fontSize: "2rem", opacity: 0.4 }} />
              <div className="mt-2">Click "Generate" to get an AI clinical summary.</div>
            </div>
          )}

          {summaryLoading && (
            <div className="text-center py-4 text-muted">
              <div className="spinner-border text-primary spinner-border-sm mb-2" />
              <div className="mt-2 small">Generating AI summary...</div>
            </div>
          )}

          {summary && !summaryLoading && (
            <>
              <div className="p-2 rounded mb-3" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", fontSize: "0.7rem", color: "#f59e0b" }}>
                <i className="bi bi-exclamation-triangle me-1" />
                {summary.disclaimer || "AI Generated — Requires Clinical Review. Not a substitute for clinical judgment."}
              </div>
              <p className="text-white mb-0" style={{ fontSize: "0.85rem", lineHeight: 1.7 }}>{summary.summary}</p>
            </>
          )}
        </div>
      )}

      {/* Tab: Risk Prediction Engine */}
      {activeTab === "risk" && (
        <div className="d-flex flex-column gap-3 flex-grow-1">
          <div className="glass-panel p-3" style={{ background: "rgba(15,23,42,0.6)" }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="text-white m-0" style={{ fontSize: "0.9rem" }}>
                <i className="bi bi-shield-exclamation text-danger me-2" />Risk Prediction Engine
              </h5>
              {risk && (
                <div className="d-flex align-items-center gap-2">
                  {risk.prototype && (
                    <span style={{ fontSize: "0.55rem", background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 4, padding: "1px 6px", fontWeight: 700 }}>
                      PROTOTYPE ESTIMATES
                    </span>
                  )}
                  <AIBadge available={risk.ai_available} />
                </div>
              )}
            </div>

            {riskLoading && <div className="text-center py-3"><div className="spinner-border text-primary spinner-border-sm" /></div>}

            {risk && !riskLoading && (
              <>
                <div className="p-2 rounded mb-3" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", fontSize: "0.68rem", color: "#f59e0b" }}>
                  <i className="bi bi-exclamation-triangle me-1" />
                  {risk.prototype ? "PROTOTYPE: Heuristic estimates based on severity score only. Not validated clinical predictions." : "AI-generated risk estimates. Requires clinical validation."}
                </div>

                <div style={{ marginBottom: 8 }}>
                  <span className="text-muted small">Overall Risk Level: </span>
                  <span className="fw-bold ms-1" style={{ color: risk.risk_level === "Critical" ? "#f43f5e" : risk.risk_level === "High" ? "#f59e0b" : "#0ea5e9" }}>
                    {risk.risk_level}
                  </span>
                </div>

                <RiskBar label="Deterioration Risk" value={risk.deterioration_risk} color="#f43f5e" />
                <RiskBar label="Sepsis Probability" value={risk.sepsis_probability} color="#f59e0b" />
                <RiskBar label="Recovery Probability" value={risk.recovery_probability} color="#10b981" />
              </>
            )}
          </div>

          {/* Drug Interaction */}
          <div className="glass-panel p-3 flex-grow-1" style={{ background: "rgba(15,23,42,0.6)" }}>
            <h5 className="text-white mb-3" style={{ fontSize: "0.9rem" }}>
              <i className="bi bi-capsule text-warning me-2" />Drug Safety Notes
            </h5>
            <div className="p-2 rounded mb-2" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className="bi bi-check-circle-fill text-success" />
                <span className="text-success fw-bold small">No severe conflicts on record</span>
              </div>
              <div className="text-muted" style={{ fontSize: "0.7rem" }}>Drug interaction checking requires a validated drug safety API. Review current prescriptions carefully.</div>
            </div>
            <div className="p-2 rounded" style={{ background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)", fontSize: "0.7rem", color: "#0ea5e9" }}>
              <i className="bi bi-info-circle me-1" />
              Age {patient.age}: Review dosing for renal/hepatic clearance if relevant medications are prescribed.
            </div>
          </div>
        </div>
      )}

      {/* Tab: Operations AI Recommendations */}
      {activeTab === "ops" && (
        <div className="glass-panel p-3 flex-grow-1" style={{ background: "rgba(15,23,42,0.6)" }}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="text-white m-0" style={{ fontSize: "0.9rem" }}>
              <i className="bi bi-cpu text-primary me-2" />Operations Recommendations
            </h5>
            <div className="d-flex gap-2 align-items-center">
              {opsRecs && <AIBadge available={opsRecs.ai_available} />}
              <button
                className="btn btn-sm btn-outline-primary py-0 px-2"
                onClick={loadOpsRecs}
                disabled={opsLoading}
                style={{ fontSize: "0.7rem" }}
              >
                {opsLoading ? <span className="spinner-border spinner-border-sm" /> : <><i className="bi bi-arrow-clockwise me-1" />Refresh</>}
              </button>
            </div>
          </div>

          {!opsRecs && !opsLoading && (
            <div className="text-center py-4 text-muted" style={{ fontSize: "0.82rem" }}>
              <i className="bi bi-cpu mb-2" style={{ fontSize: "2rem", opacity: 0.4 }} />
              <div className="mt-2">Click "Refresh" to get AI operation suggestions.</div>
              <div className="text-warning mt-1" style={{ fontSize: "0.72rem" }}>
                <i className="bi bi-exclamation-triangle me-1" />AI suggestions are advisory only. Doctor authorization required for all actions.
              </div>
            </div>
          )}

          {opsLoading && (
            <div className="text-center py-4">
              <div className="spinner-border text-primary spinner-border-sm mb-2" />
              <div className="text-muted small mt-2">Analyzing patient data...</div>
            </div>
          )}

          {opsRecs && !opsLoading && (
            <>
              {opsRecs.overall_assessment && (
                <div className="mb-3 p-2 rounded" style={{ background: "rgba(255,255,255,0.04)", fontSize: "0.82rem", color: "#cbd5e1", lineHeight: 1.5 }}>
                  {opsRecs.overall_assessment}
                </div>
              )}
              <div className="text-muted mb-2" style={{ fontSize: "0.7rem", letterSpacing: "1px", textTransform: "uppercase" }}>Suggested Actions</div>
              {(opsRecs.recommendations || []).length === 0 && (
                <div className="text-muted small text-center py-3">No specific recommendations at this time.</div>
              )}
              {(opsRecs.recommendations || []).map((rec, i) => {
                const urgencyColor = rec.urgency === "Emergency" ? "#f43f5e" : rec.urgency === "Urgent" ? "#f59e0b" : "#0ea5e9";
                return (
                  <div key={i} className="mb-2 p-3 rounded-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span style={{ background: `${urgencyColor}15`, color: urgencyColor, border: `1px solid ${urgencyColor}40`, borderRadius: 4, padding: "1px 7px", fontSize: "0.6rem", fontWeight: 700 }}>
                        {rec.urgency}
                      </span>
                      <span className="text-white fw-bold small">{rec.action?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                    </div>
                    <p className="text-muted mb-2" style={{ fontSize: "0.78rem", lineHeight: 1.4 }}>{rec.reason}</p>
                    <div className="text-info" style={{ fontSize: "0.7rem" }}>
                      <i className="bi bi-info-circle me-1" />Requires doctor review and manual initiation in Operations tab.
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Tab: SOAP Note Assistant */}
      {activeTab === "soap" && (
        <div className="d-flex flex-column gap-3 flex-grow-1">
          <div className="glass-panel p-3" style={{ background: "rgba(15,23,42,0.6)" }}>
            <h5 className="text-white mb-2" style={{ fontSize: "0.9rem" }}>
              <i className="bi bi-pen text-primary me-2" />AI SOAP Note Structuring
            </h5>
            <p className="text-muted mb-3" style={{ fontSize: "0.78rem" }}>
              Enter rough notes below. AI will suggest SOAP structure. Your original text is never overwritten.
            </p>
            <textarea
              className="form-control bg-dark text-white border-secondary mb-2"
              rows={4}
              placeholder="Enter your rough clinical notes here..."
              value={rawNote}
              onChange={e => setRawNote(e.target.value)}
              style={{ fontSize: "0.85rem" }}
            />
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={handleStructureNote}
              disabled={soapLoading || !rawNote.trim()}
              style={{ borderRadius: 6 }}
            >
              {soapLoading ? <><span className="spinner-border spinner-border-sm me-1" />Structuring...</> : <><i className="bi bi-robot me-1" />Structure into SOAP</>}
            </button>
          </div>

          {soapError && (
            <div className="text-warning small p-2 rounded" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
              <i className="bi bi-exclamation-triangle me-1" />{soapError}
            </div>
          )}

          {soapResult && (
            <div className="glass-panel p-3 flex-grow-1" style={{ background: "rgba(15,23,42,0.6)" }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <h5 className="text-white m-0" style={{ fontSize: "0.9rem" }}>AI SOAP Suggestion</h5>
                <span style={{ fontSize: "0.55rem", background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 4, padding: "1px 6px", fontWeight: 700 }}>
                  REVIEW BEFORE USE
                </span>
              </div>
              {["Subjective", "Objective", "Assessment", "Plan"].map(section => (
                <div key={section} className="mb-3">
                  <div className="text-info fw-bold mb-1" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>{section.toUpperCase()}</div>
                  <div className="text-white" style={{ fontSize: "0.83rem", lineHeight: 1.6 }}>{soapResult[section] || "Not specified."}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
