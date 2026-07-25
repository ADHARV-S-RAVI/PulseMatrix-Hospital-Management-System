import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import BioMatrixBackground from "../components/BioMatrixBackground";
import NotificationCenter from "../components/DoctorWidgets/NotificationCenter";
import GlobalSearch from "../components/DoctorWidgets/GlobalSearch";
import QuickActionMenu from "../components/DoctorWidgets/QuickActionMenu";
import AICopilotDrawer from "../components/DoctorWidgets/AICopilotDrawer";
import { getDoctorPatients, getDoctorDashboardStats } from "../services/api";

// Import Views
import CommandCenterHome from "../components/DoctorWidgets/Views/CommandCenterHome";
import MyPatientsView from "../components/DoctorWidgets/Views/MyPatientsView";
import GlobalClinicalWorkspace from "../components/DoctorWidgets/Views/GlobalClinicalWorkspace";
import GlobalOperationsCenter from "../components/DoctorWidgets/Views/GlobalOperationsCenter";
import GlobalAICenter from "../components/DoctorWidgets/Views/GlobalAICenter";
import GlobalTelemedicine from "../components/DoctorWidgets/Views/GlobalTelemedicine";
import ScheduleCenter from "../components/DoctorWidgets/Views/ScheduleCenter";
import PatientCommandWorkspace from "../components/DoctorWidgets/Views/PatientCommandWorkspace";

const SIDEBAR_ITEMS = [
  { id: "command_center", label: "Command Center", icon: "bi-grid-1x2-fill" },
  { id: "my_patients", label: "My Patients", icon: "bi-people-fill" },
  { id: "clinical", label: "Clinical Workspace", icon: "bi-journal-medical" },
  { id: "operations", label: "Operations", icon: "bi-sliders" },
  { id: "ai_center", label: "AI Clinical Center", icon: "bi-robot" },
  { id: "telemedicine", label: "Telemedicine", icon: "bi-camera-video-fill" },
  { id: "schedule", label: "Schedule", icon: "bi-calendar-week-fill" },
];

export default function DoctorDashboard({ doctorId = 1, onLogout }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeView, setActiveView] = useState("command_center");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [time, setTime] = useState("");
  
  // Real data state
  const [doctorName, setDoctorName] = useState("Doctor");
  const [dashboardStats, setDashboardStats] = useState(null);

  // Time ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real data
  useEffect(() => {
    // We just need doctor name from patients list for now, we could also fetch a /doctor endpoint
    getDoctorPatients(doctorId)
      .then(data => {
        if (data && data.length > 0 && data[0]?.assigned_doctor_name) {
          setDoctorName(data[0].assigned_doctor_name);
        }
      }).catch(() => {});

    getDoctorDashboardStats(doctorId)
      .then(data => setDashboardStats(data))
      .catch(() => {});
  }, [doctorId]);

  // View routing handler
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setActiveView("patient_workspace");
  };

  const renderActiveView = () => {
    if (activeView === "patient_workspace" && selectedPatient) {
      return <PatientCommandWorkspace patient={selectedPatient} doctorId={doctorId} onBack={() => setActiveView("my_patients")} />;
    }

    const props = { doctorId, onSelectPatient: handleSelectPatient, dashboardStats };

    switch (activeView) {
      case "command_center": return <CommandCenterHome {...props} />;
      case "my_patients": return <MyPatientsView {...props} />;
      case "clinical": return <GlobalClinicalWorkspace {...props} />;
      case "operations": return <GlobalOperationsCenter {...props} />;
      case "ai_center": return <GlobalAICenter {...props} />;
      case "telemedicine": return <GlobalTelemedicine {...props} />;
      case "schedule": return <ScheduleCenter {...props} />;
      default: return <CommandCenterHome {...props} />;
    }
  };

  const initials = doctorName.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase() || "DR";

  return (
    <div className="d-flex flex-column h-100 position-relative overflow-hidden" style={{ background: "#050A15" }}>
      <BioMatrixBackground />
      
      {/* Top Navigation Bar */}
      <nav className="navbar navbar-dark p-0 px-3 position-relative d-flex align-items-center justify-content-between" style={{ height: 64, zIndex: 1040, background: "rgba(10,15,28,0.85)", borderBottom: "1px solid rgba(14,165,233,0.3)" }}>
        
        {/* Left: Brand & Sidebar Toggle */}
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-link text-white p-0" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className="bi bi-list fs-4"></i>
          </button>
          <div className="d-flex align-items-center gap-2">
            <div className="logo-pulse"><i className="bi bi-heart-pulse-fill text-primary fs-4" /></div>
            <div className="d-none d-sm-block">
              <h5 className="m-0 text-white fw-bold" style={{ letterSpacing: "1px", fontSize: "1rem" }}>PULSE_MATRIX</h5>
              <div className="text-info" style={{ fontSize: "0.6rem", letterSpacing: "2px" }}>COMMAND CENTER</div>
            </div>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="d-none d-md-block">
          <GlobalSearch />
        </div>

        {/* Right: Actions, Notifications, Profile */}
        <div className="d-flex align-items-center gap-3">
          <div className="text-white font-monospace d-none d-lg-block" style={{ fontSize: "0.9rem" }}>{time}</div>
          
          <button className="btn btn-outline-info btn-sm rounded-pill d-none d-sm-flex align-items-center gap-1" onClick={() => setCopilotOpen(true)}>
            <i className="bi bi-stars"></i> <span style={{ fontSize: "0.75rem" }}>AI Copilot</span>
          </button>

          <QuickActionMenu />
          <NotificationCenter doctorId={doctorId} />

          <div className="d-flex align-items-center gap-2 border-start border-secondary border-opacity-50 ps-3">
            <div className="text-end d-none d-xl-block">
              <div className="text-white fw-bold" style={{ fontSize: "0.8rem" }}>{doctorName}</div>
              <div className="text-success" style={{ fontSize: "0.65rem" }}>
                <i className="bi bi-circle-fill me-1" style={{ fontSize: "0.4rem" }} />On Shift
              </div>
            </div>
            <div className="dropdown">
              <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold bg-primary border border-info cursor-pointer" data-bs-toggle="dropdown" style={{ width: 36, height: 36, fontSize: "0.8rem", cursor: "pointer" }}>
                {initials}
              </div>
              <ul className="dropdown-menu dropdown-menu-end bg-dark border-secondary shadow-lg">
                <li><button className="dropdown-item text-white hover-primary"><i className="bi bi-person me-2"></i>Profile</button></li>
                <li><button className="dropdown-item text-white hover-primary"><i className="bi bi-gear me-2"></i>Settings</button></li>
                <li><hr className="dropdown-divider border-secondary" /></li>
                <li><button className="dropdown-item text-danger hover-danger" onClick={onLogout}><i className="bi bi-box-arrow-right me-2"></i>Sign Out</button></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area: Sidebar + Workspace */}
      <div className="d-flex flex-grow-1 position-relative overflow-hidden" style={{ zIndex: 10 }}>
        
        {/* Left Sidebar */}
        <motion.div 
          initial={false}
          animate={{ width: sidebarOpen ? 240 : 64 }}
          className="h-100 flex-shrink-0 d-flex flex-column py-3 border-end border-secondary border-opacity-25"
          style={{ background: "rgba(10,15,28,0.6)", backdropFilter: "blur(10px)" }}
        >
          <div className="d-flex flex-column gap-2 px-2">
            {SIDEBAR_ITEMS.map(item => {
              const isActive = activeView === item.id || (item.id === "my_patients" && activeView === "patient_workspace");
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`btn d-flex align-items-center gap-3 w-100 border-0 ${isActive ? 'bg-primary bg-opacity-25 text-white' : 'text-muted'}`}
                  style={{ 
                    borderRadius: 8, 
                    padding: sidebarOpen ? "10px 16px" : "10px", 
                    justifyContent: sidebarOpen ? "flex-start" : "center",
                    transition: "all 0.2s"
                  }}
                  title={!sidebarOpen ? item.label : ""}
                >
                  <i className={`bi ${item.icon} fs-5 ${isActive ? 'text-primary' : ''}`}></i>
                  {sidebarOpen && <span style={{ fontSize: "0.85rem", fontWeight: isActive ? 600 : 400, whiteSpace: "nowrap" }}>{item.label}</span>}
                </button>
              );
            })}
          </div>

          <div className="mt-auto px-2 pt-3 border-top border-secondary border-opacity-25">
             <button
                onClick={onLogout}
                className="btn d-flex align-items-center gap-3 w-100 border-0 text-muted hover-danger"
                style={{ borderRadius: 8, padding: sidebarOpen ? "10px 16px" : "10px", justifyContent: sidebarOpen ? "flex-start" : "center" }}
                title={!sidebarOpen ? "Exit" : ""}
              >
                <i className="bi bi-box-arrow-left fs-5"></i>
                {sidebarOpen && <span style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>Exit Portal</span>}
              </button>
          </div>
        </motion.div>

        {/* Main Workspace */}
        <div className="flex-grow-1 h-100 overflow-hidden position-relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView + (selectedPatient?.patient_id || '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="h-100 w-100"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AICopilotDrawer open={copilotOpen} onClose={() => setCopilotOpen(false)} patient={selectedPatient} />

      <style>{`
        .hover-primary:hover { background-color: rgba(14, 165, 233, 0.2) !important; color: #fff !important; }
        .hover-danger:hover { background-color: rgba(244, 63, 94, 0.2) !important; color: #f43f5e !important; }
        .dropdown-menu { animation: fadeIn 0.2s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
