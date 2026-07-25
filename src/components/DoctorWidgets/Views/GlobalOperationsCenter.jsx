import { useState } from "react";
import OperationsDashboard from "../Operations/OperationsDashboard";

export default function GlobalOperationsCenter({ doctorId, dashboardStats }) {
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' or 'requests'
  const [selectedRequest, setSelectedRequest] = useState(null);

  return (
    <div className="h-100 d-flex flex-column p-4 overflow-auto custom-scrollbar text-white">
      
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Operations Command Center</h4>
        <div className="text-muted small">Global view of all clinical operations and requests.</div>
      </div>

      <div className="row g-3 mb-4">
        {[
          { label: "Active Requests", value: dashboardStats?.activeOperations || 0, color: "#10b981", icon: "bi-activity" },
          { label: "Critical Priority", value: 0, color: "#f43f5e", icon: "bi-exclamation-triangle-fill" },
          { label: "Pending Review", value: 0, color: "#f59e0b", icon: "bi-clock-history" },
          { label: "Completed Today", value: 0, color: "#0ea5e9", icon: "bi-check-circle-fill" }
        ].map((stat, i) => (
          <div key={i} className="col-12 col-sm-6 col-md-3">
            <div className="p-3 rounded-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="text-muted" style={{ fontSize: "0.7rem", textTransform: "uppercase" }}>{stat.label}</div>
                <i className={`bi ${stat.icon}`} style={{ color: stat.color }}></i>
              </div>
              <div className="fw-bold fs-4">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-2">
        <button 
          className={`btn btn-sm ${activeTab === 'dashboard' ? 'btn-primary' : 'text-muted hover-white'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Operation Categories
        </button>
        <button 
          className={`btn btn-sm ${activeTab === 'requests' ? 'btn-primary' : 'text-muted hover-white'}`}
          onClick={() => setActiveTab('requests')}
        >
          Active Requests Queue
        </button>
      </div>

      <div className="flex-grow-1 position-relative">
        {activeTab === 'dashboard' && (
          <div className="glass-panel p-4 h-100 rounded-4" style={{ background: "rgba(10,15,28,0.7)" }}>
            <div className="text-muted mb-3"><i className="bi bi-info-circle me-2"></i>Select a patient from <b>My Patients</b> to initiate a new operation. Below are the available categories.</div>
            {/* We render the dashboard without a patient to show the categories only */}
            <OperationsDashboard patient={null} doctorId={doctorId} />
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="glass-panel p-4 h-100 rounded-4" style={{ background: "rgba(10,15,28,0.7)" }}>
            <div className="text-muted text-center py-5">
              <i className="bi bi-inbox fs-1 opacity-25 mb-3"></i>
              <div>No active requests found for your assigned patients.</div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
