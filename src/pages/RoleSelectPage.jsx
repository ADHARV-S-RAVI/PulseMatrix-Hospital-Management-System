/**
 * RoleSelectPage.jsx  –  Pulse_Matrix Role Selection Gateway
 *
 * Shown after the Hero landing page, before the Login form.
 * The user selects whether they are an Admin or a Patient.
 * Choice is passed via onSelectRole(role) → "admin" | "patient"
 */
import { useState } from "react";

const ROLES = [
  {
    key: "admin",
    icon: "bi-shield-lock-fill",
    title: "Administrator",
    subtitle: "Command & Control Access",
    description:
      "Full dashboard access: patient management, emergency queue, doctor & bed oversight, analytics.",
    color: "var(--pm-blue)",
    gradient: "linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)",
    badge: "Admin",
    badgeCls: "badge-admin",
  },
  {
    key: "doctor",
    icon: "bi-stethoscope",
    title: "Doctor",
    subtitle: "Clinical Command Center",
    description:
      "Manage assigned patients, view live telemetry, prescribe treatments, and coordinate emergency responses.",
    color: "#0ea5e9",
    gradient: "linear-gradient(135deg,#0ea5e9 0%,#3b82f6 100%)",
    badge: "Doctor",
    badgeCls: "badge-doctor",
  },
  {
    key: "patient",
    icon: "bi-person-fill-check",
    title: "Patient",
    subtitle: "Case Portal Access",
    description:
      "View your personal case file, treatment status, assigned doctor & bed, and discharge information.",
    color: "#10b981",
    gradient: "linear-gradient(135deg,#10b981 0%,#06b6d4 100%)",
    badge: "Patient",
    badgeCls: "badge-patient",
  },
];

export default function RoleSelectPage({ onSelectRole, onBack }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="role-root">
      {/* Animated blobs */}
      <div className="login-blob blob-1" />
      <div className="login-blob blob-2" />
      <div className="login-blob blob-3" />

      <div className="role-container">
        {/* Back button */}
        <button
          className="role-back-btn"
          onClick={onBack}
          title="Return to home"
        >
          <i className="bi bi-arrow-left me-1" /> Back
        </button>

        {/* Header */}
        <div className="role-header">
          <div className="role-logo-ring mx-auto mb-4">
            <i className="bi bi-heart-pulse-fill" />
          </div>
          <h1 className="role-title">Welcome to Pulse_Matrix</h1>
          <p className="role-subtitle">
            Please identify your access level to continue.
          </p>
        </div>

        {/* Cards */}
        <div className="role-cards-row">
          {ROLES.map((r) => (
            <div
              key={r.key}
              className={`role-card ${hovered === r.key ? "role-card-hovered" : ""}`}
              onMouseEnter={() => setHovered(r.key)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelectRole(r.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelectRole(r.key)}
            >
              {/* Gradient top bar */}
              <div
                className="role-card-bar"
                style={{ background: r.gradient }}
              />

              {/* Icon */}
              <div
                className="role-card-icon"
                style={{ background: r.gradient }}
              >
                <i className={`bi ${r.icon}`} />
              </div>

              {/* Content */}
              <div className="role-card-body">
                <span className={`role-badge ${r.badgeCls}`}>{r.badge}</span>
                <h2 className="role-card-title">{r.title}</h2>
                <p className="role-card-sub">{r.subtitle}</p>
                <p className="role-card-desc">{r.description}</p>
              </div>

              {/* CTA */}
              <div className="role-card-footer" style={{ background: r.gradient }}>
                <span>Continue as {r.title}</span>
                <i className="bi bi-arrow-right ms-2" />
              </div>
            </div>
          ))}
        </div>

        <p className="role-footer-note">
          <i className="bi bi-shield-check me-1 text-success" />
          Secure · HIPAA Compliant · All sessions are encrypted
        </p>
      </div>
    </div>
  );
}
