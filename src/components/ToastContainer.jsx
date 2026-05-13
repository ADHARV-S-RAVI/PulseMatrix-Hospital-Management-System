import { useState, useEffect } from "react";

export default function ToastContainer({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 3000, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastItem({ toast }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const iconMap = {
    success: "bi-check-circle-fill text-success",
    danger:  "bi-exclamation-triangle-fill text-danger",
    warning: "bi-exclamation-circle-fill text-warning",
    info:    "bi-info-circle-fill text-info",
  };

  const borderMap = {
    success: "#10b981",
    danger:  "#f43f5e",
    warning: "#f59e0b",
    info:    "#0ea5e9",
  };

  return (
    <div
      style={{
        background: "#0f172a",
        color: "#fff",
        padding: "1rem 1.25rem",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        borderLeft: `4px solid ${borderMap[toast.type] || "#0ea5e9"}`,
        minWidth: 300,
        maxWidth: 380,
        transform: visible ? "translateX(0)" : "translateX(120%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.3s ease, opacity 0.3s ease",
      }}
    >
      <i className={`bi ${iconMap[toast.type] || "bi-info-circle-fill"} fs-4`} />
      <div className="flex-grow-1">
        <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{toast.title}</div>
        <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>{toast.message}</div>
      </div>
    </div>
  );
}
