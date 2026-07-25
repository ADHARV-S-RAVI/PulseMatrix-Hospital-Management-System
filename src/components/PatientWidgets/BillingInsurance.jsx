import { motion } from "motion/react";

const EXPENSES = [
  { item: "ICU Stay (3 nights)", amount: 12500, category: "Room" },
  { item: "Cardiac Monitoring", amount: 3200, category: "Diagnostics" },
  { item: "Medications", amount: 1850, category: "Pharmacy" },
  { item: "Lab Tests (CBC, CMP, ABG)", amount: 950, category: "Lab" },
  { item: "CT Scan - Chest", amount: 2100, category: "Imaging" },
  { item: "Physician Consultations", amount: 1500, category: "Physician" },
];

const PAYMENTS = [
  { date: "Jun 14", desc: "Admission Deposit", amount: 5000, status: "Paid" },
  { date: "Jun 16", desc: "Insurance Pre-Auth", amount: 8000, status: "Processed" },
];

export default function BillingInsurance() {
  const total = EXPENSES.reduce((s, e) => s + e.amount, 0);
  const paid = PAYMENTS.reduce((s, p) => s + p.amount, 0);
  const coverage = 15000;
  const balance = Math.max(0, total - paid - (coverage - paid));

  return (
    <motion.div className="glass-panel p-4 hud-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h3 className="hud-card-title mb-3"><i className="bi bi-credit-card me-2" />Billing & Insurance</h3>

      {/* Summary Cards */}
      <div className="row g-2 mb-3">
        <div className="col-6">
          <div className="p-2 rounded-2 text-center" style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.15)" }}>
            <div style={{ fontSize: "0.6rem", color: "#94a3b8" }}>Total Charges</div>
            <div className="fw-bold text-white" style={{ fontSize: "1.1rem" }}>${total.toLocaleString()}</div>
          </div>
        </div>
        <div className="col-6">
          <div className="p-2 rounded-2 text-center" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <div style={{ fontSize: "0.6rem", color: "#94a3b8" }}>Insurance Coverage</div>
            <div className="fw-bold" style={{ fontSize: "1.1rem", color: "#10b981" }}>${coverage.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="mb-3">
        <div className="x-small fw-bold text-muted mb-2" style={{ letterSpacing: 1 }}>EXPENSE BREAKDOWN</div>
        <div className="d-flex flex-column gap-1" style={{ maxHeight: 160, overflowY: "auto" }}>
          {EXPENSES.map(exp => (
            <div key={exp.item} className="d-flex justify-content-between align-items-center p-1 rounded-1" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div>
                <span style={{ fontSize: "0.7rem", color: "#e2e8f0" }}>{exp.item}</span>
                <span className="ms-2 badge" style={{ fontSize: "0.5rem", background: "rgba(255,255,255,0.06)", color: "#64748b" }}>{exp.category}</span>
              </div>
              <span className="fw-bold" style={{ fontSize: "0.7rem", color: "#f59e0b" }}>${exp.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div>
        <div className="x-small fw-bold text-muted mb-2" style={{ letterSpacing: 1 }}>PAYMENT HISTORY</div>
        {PAYMENTS.map(pay => (
          <div key={pay.date} className="d-flex justify-content-between align-items-center p-1">
            <div>
              <span style={{ fontSize: "0.65rem", color: "#64748b" }}>{pay.date}</span>
              <span className="ms-2" style={{ fontSize: "0.7rem", color: "#e2e8f0" }}>{pay.desc}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold" style={{ fontSize: "0.7rem", color: "#10b981" }}>${pay.amount.toLocaleString()}</span>
              <span className="badge" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", fontSize: "0.5rem" }}>{pay.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Balance Due */}
      <div className="mt-3 p-2 rounded-2 text-center" style={{ background: balance > 0 ? "rgba(244,63,94,0.08)" : "rgba(16,185,129,0.08)", border: `1px solid ${balance > 0 ? "rgba(244,63,94,0.2)" : "rgba(16,185,129,0.2)"}` }}>
        <div style={{ fontSize: "0.6rem", color: "#94a3b8" }}>Estimated Balance Due at Discharge</div>
        <div className="fw-bold" style={{ fontSize: "1.2rem", color: balance > 0 ? "#f43f5e" : "#10b981" }}>${balance.toLocaleString()}</div>
      </div>
    </motion.div>
  );
}
