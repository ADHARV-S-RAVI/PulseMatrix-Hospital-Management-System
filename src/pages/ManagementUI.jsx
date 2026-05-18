import { useState } from "react";
import { useApp } from "../context/AppContext";
import { updateDoctor as updateDoctorAPI, updateBed as updateBedAPI } from "../services/api";

const DOC_STATUS_OPTIONS  = ["Available","In Surgery","On Rounds","Off Duty"];
const BED_STATUS_OPTIONS  = ["Available","Maintenance"];

function DoctorCard({ doc, onStatusChange }) {
  let statusCls = "text-success";
  if (doc.status === "In Surgery") statusCls = "text-danger";
  if (doc.status === "On Rounds" || doc.status === "Off Duty") statusCls = "text-warning";

  const initials = doc.name.replace("Dr. ", "").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="col-md-6 col-xl-4 mb-3">
      <div className="doctor-card h-100">
        <div className="doctor-avatar">{initials}</div>
        <div className="flex-grow-1 overflow-hidden">
          <div className="fw-bold text-truncate">{doc.name}</div>
          <div className="text-muted small">{doc.specialty}</div>
          <div className="d-flex justify-content-between align-items-center mt-2 pt-1 border-top">
            <span className={`small fw-semibold ${statusCls}`}>
              <i className="bi bi-circle-fill me-1" style={{ fontSize: "0.55rem" }} />{doc.status}
            </span>
            <span className="badge bg-light border" title="Patient load">
              <i className="bi bi-people-fill me-1 text-primary" />{doc.currentLoad || 0}
            </span>
          </div>
        </div>
        <div className="dropdown ms-2">
          <button className="btn btn-sm btn-light" data-bs-toggle="dropdown">
            <i className="bi bi-three-dots-vertical" />
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm">
            <li><h6 className="dropdown-header">Override Status</h6></li>
            {DOC_STATUS_OPTIONS.map(s => (
              <li key={s}>
                <button className="dropdown-item" onClick={() => onStatusChange(doc.id, doc.name, s)}>
                  Set {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function BedCard({ bed, onStatusChange }) {
  let borderCls = "status-available";
  let badgeEl = <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">Available</span>;
  if (bed.status === "Occupied")    { borderCls = "status-occupied";    badgeEl = <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">Occupied</span>; }
  if (bed.status === "Maintenance") { borderCls = "status-maintenance"; badgeEl = <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">Maintenance</span>; }

  return (
    <div className="col-sm-6 col-md-4 col-xl-3 mb-3">
      <div className={`bed-card h-100 ${borderCls}`}>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <span className="fs-6 fw-bold">{bed.id}</span>
            <div className="text-muted" style={{ fontSize: "0.75rem" }}>{bed.department || "General"}</div>
          </div>
          {badgeEl}
        </div>
        <div className="mt-3 pt-2 border-top">
          <div className="small fw-medium text-truncate">
            <i className="bi bi-person me-1" />
            {bed.patient ?? <span className="text-muted fst-italic">Unassigned</span>}
          </div>
          <div className="d-flex justify-content-between align-items-center mt-2">
            <span className="text-muted" style={{ fontSize: "0.7rem" }}>{bed.type || "General Ward"}</span>
            {bed.status !== "Occupied" && (
              <div className="dropdown">
                <span className="text-primary small text-decoration-underline" role="button" data-bs-toggle="dropdown" style={{ fontSize: "0.75rem", cursor: "pointer" }}>
                  Actions
                </span>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm" style={{ fontSize: "0.85rem" }}>
                  {BED_STATUS_OPTIONS.map(s => (
                    <li key={s}><button className="dropdown-item" onClick={() => onStatusChange(bed.numericId, bed.id, s)}>Mark {s}</button></li>
                  ))}
                </ul>
              </div>
            )}
            {bed.status === "Occupied" && (
              <span
                className="text-danger small text-decoration-underline"
                style={{ fontSize: "0.75rem", cursor: "pointer" }}
                onClick={() => {
                  if (window.confirm(`Clearing ${bed.id} will dissociate the patient. Proceed?`))
                    onStatusChange(bed.numericId, bed.id, "Available");
                }}
              >
                Clear
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManagementUI({ addToast }) {
  const { doctors, beds, updateDoctorStatus, updateBedStatus } = useApp();
  const [tab, setTab] = useState("doctors");

  const handleDocStatus = async (id, name, status) => {
    updateDoctorStatus(name, status);
    addToast("Status Overridden", `${name} → ${status}`, "info");

    try {
      if (id && !isNaN(id)) {
        await updateDoctorAPI(id, { availability: status });
      }
    } catch (err) {
      console.warn("Backend update skipped/offline", err);
    }
  };

  const handleBedStatus = async (numericId, id, status) => {
    updateBedStatus(id, status);
    addToast("Bed Updated", `${id} → ${status}`, "info");

    try {
      if (numericId && !isNaN(numericId)) {
        await updateBedAPI(numericId, { status: status });
      }
    } catch (err) {
      console.warn("Backend update skipped/offline", err);
    }
  };

  return (
    <div>
      <div className="mb-4 pb-2 border-bottom">
        <h2 className="fw-bold mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Personnel &amp; Clinical Unit Management</h2>
        <p className="text-muted small mb-0">Real-time staff schedule oversight and bed hardware readiness.</p>
      </div>

      {/* Pill Tabs */}
      <div className="d-flex gap-2 mb-4">
        <button
          className={`btn ${tab === "doctors" ? "btn-primary-gradient" : "btn-outline-secondary"} fw-semibold`}
          onClick={() => setTab("doctors")}
        >
          <i className="bi bi-person-hearts me-1" /> Doctors Roster
        </button>
        <button
          className={`btn ${tab === "beds" ? "btn-primary-gradient" : "btn-outline-secondary"} fw-semibold`}
          onClick={() => setTab("beds")}
        >
          <i className="bi bi-grid-3x3-gap-fill me-1" /> Bed Array
        </button>
      </div>

      {tab === "doctors" && (
        <div className="row" style={{ maxHeight: "75vh", overflowY: "auto", overflowX: "hidden" }}>
          {doctors.length === 0 ? (
            <div className="col-12 text-center text-muted py-4">No doctors available.</div>
          ) : doctors.map(doc => (
            <DoctorCard key={doc.id || doc.name} doc={doc} onStatusChange={handleDocStatus} />
          ))}
        </div>
      )}

      {tab === "beds" && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fs-6 fw-bold mb-0 text-primary"><i className="bi bi-display me-2"/>Animated Bed Array Matrix</h4>
            <span className="badge bg-light border">Hover over capsule to view assigned patient</span>
          </div>
          <div className="animated-bed-grid mb-4" style={{ maxHeight: "400px", overflowY: "auto" }}>
            {beds.map(bed => {
              const stCls = bed.status === "Occupied" ? "unit-occupied" : bed.status === "Maintenance" ? "unit-maintenance" : "unit-available";
              return (
                <div 
                  key={`anim-${bed.id}`} 
                  className={`animated-bed-unit ${stCls}`}
                  onClick={() => {
                    if (bed.status === "Occupied") {
                      if (window.confirm(`Clear ${bed.id} occupancy?`)) {
                        handleBedStatus(bed.numericId, bed.id, "Available");
                      }
                    } else {
                      const nxt = bed.status === "Available" ? "Maintenance" : "Available";
                      handleBedStatus(bed.numericId, bed.id, nxt);
                    }
                  }}
                >
                  <div className="bed-unit-header">{bed.id}</div>
                  <div className="bed-capsule-graphic" />
                  <div className="bed-unit-footer">{bed.status}</div>
                  <div className="bed-patient-tooltip">
                    {bed.status === "Occupied" ? `Assigned: ${bed.patient || "Active Patient"}` : `Status: ${bed.status}`}
                  </div>
                </div>
              );
            })}
          </div>

          <h4 className="fs-6 fw-bold mb-3 mt-4">Detailed Allocation Roster</h4>
          <div className="row" style={{ maxHeight: "50vh", overflowY: "auto", overflowX: "hidden" }}>
            {beds.length === 0 ? (
              <div className="col-12 text-center text-muted py-4">No beds available.</div>
            ) : beds.map(bed => (
              <BedCard key={bed.id} bed={bed} onStatusChange={handleBedStatus} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
