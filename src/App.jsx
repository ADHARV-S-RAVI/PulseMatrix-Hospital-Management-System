import { useState, useEffect, useCallback } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import HeroPage from "./pages/HeroPage";
import RoleSelectPage from "./pages/RoleSelectPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import PatientRegistration from "./pages/PatientRegistration";
import EmergencyQueue from "./pages/EmergencyQueue";
import ManagementUI from "./pages/ManagementUI";
import PatientDashboard from "./pages/PatientDashboard";
import Sidebar from "./components/Sidebar";
import ToastContainer from "./components/ToastContainer";
import "./App.css";

// ── Page transition wrapper ──────────────────────────────────
function PageTransition({ pageKey, children }) {
  return (
    <div className="content-area" key={pageKey}>
      {children}
    </div>
  );
}

// ── Main shell (needs context) ───────────────────────────────
function AppShell() {
  const { resetDB } = useApp();

  // 4-step flow:  "hero" → "roleSelect" → "login" → "app"
  const [screen,      setScreen]     = useState(() =>
    sessionStorage.getItem("pm_logged_in") === "true" ? "app" : "hero"
  );
  const [selectedRole, setSelectedRole] = useState(() =>
    sessionStorage.getItem("pm_role") || "admin"
  );
  const [userName,    setUserName]   = useState(() => sessionStorage.getItem("pm_user") || "Admin");
  const [patientId,   setPatientId]  = useState(() => sessionStorage.getItem("pm_patient_id") || null);
  const [userRole,    setUserRole]   = useState(() => sessionStorage.getItem("pm_role") || "admin");
  const [page,        setPage]       = useState("dashboard");
  const [toasts,      setToasts]     = useState([]);
  const [sidebarOpen, setSidebar]    = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Dark / Light mode toggle
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("pm_theme");
    if (saved === "dark") { document.body.classList.add("theme-dark"); return true; }
    return false;
  });
  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.body.classList.toggle("theme-dark", next);
    localStorage.setItem("pm_theme", next ? "dark" : "light");
  };

  // Live clock
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () => {
      const d  = new Date();
      let h    = d.getHours();
      const m  = String(d.getMinutes()).padStart(2, "0");
      const s  = String(d.getSeconds()).padStart(2, "0");
      const ap = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      setTime(`${String(h).padStart(2, "0")}:${m}:${s} ${ap}`);
    };
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, []);

  // Toast helper
  const addToast = useCallback((title, message, type = "info") => {
    const id = Date.now();
    setToasts(t => [...t, { id, title, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
  }, []);

  const handleLogin = ({ role, userName: name, patientId: pid }) => {
    sessionStorage.setItem("pm_logged_in", "true");
    sessionStorage.setItem("pm_user", name);
    sessionStorage.setItem("pm_role", role);
    if (pid) sessionStorage.setItem("pm_patient_id", pid);
    setUserName(name);
    setUserRole(role);
    if (pid) setPatientId(pid);
    setScreen("app");
    addToast(
      "Authenticated",
      role === "patient"
        ? `Welcome, ${name}. Your case file is ready.`
        : `Welcome back, ${name}. Command centre active.`,
      "success"
    );
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setScreen("hero");
    setPatientId(null);
    addToast("Session Ended", "Locked out securely.", "warning");
  };

  const handleReset = () => {
    resetDB();
    setPage("dashboard");
    addToast("System Re-initialized", "Factory defaults restored.", "success");
  };

  const handleNav = (p) => { setPage(p); setSidebar(false); };

  // ── Screen: Hero ─────────────────────────────────────────
  if (screen === "hero") return (
    <>
      <HeroPage onEnter={() => setScreen("roleSelect")} />
      <ToastContainer toasts={toasts} />
    </>
  );

  // ── Screen: Role Select ──────────────────────────────────
  if (screen === "roleSelect") return (
    <>
      <RoleSelectPage
        onSelectRole={(role) => { setSelectedRole(role); setScreen("login"); }}
        onBack={() => setScreen("hero")}
      />
      <ToastContainer toasts={toasts} />
    </>
  );

  // ── Screen: Login ────────────────────────────────────────
  if (screen === "login") return (
    <>
      <LoginPage
        onLogin={handleLogin}
        prefilledRole={selectedRole}
        onBack={() => setScreen("roleSelect")}
      />
      <ToastContainer toasts={toasts} />
    </>
  );

  // ── Screen: Patient Dashboard (standalone, no sidebar) ───
  if (screen === "app" && userRole === "patient") return (
    <div id="app-container">
      <main className="main-wrapper" style={{ marginLeft: 0, paddingLeft: 0 }}>
        <h1 className="visually-hidden">Pulse_Matrix – Patient Portal</h1>
        <PatientDashboard patientId={patientId} onLogout={handleLogout} />
      </main>
      <ToastContainer toasts={toasts} />
    </div>
  );

  // ── Main admin dashboard layout ───────────────────────────
  const pageEl = (() => {
    switch (page) {
      case "dashboard":    return <Dashboard onNavigate={handleNav} />;
      case "registration": return <PatientRegistration onNavigate={handleNav} addToast={addToast} />;
      case "queue":        return <EmergencyQueue addToast={addToast} />;
      case "management":   return <ManagementUI addToast={addToast} />;
      default:             return <Dashboard onNavigate={handleNav} />;
    }
  })();

  return (
    <div id="app-container">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebar(false)} />}

      <Sidebar active={page} onNavigate={handleNav} onReset={handleReset} onLogout={handleLogout} sidebarOpen={sidebarOpen} />

      <main className="main-wrapper">
        {/* Sticky Header */}
        <header className="top-header">
          <div className="header-left">
            <button className="btn btn-link text-dark p-0 fs-4 d-lg-none border-0" onClick={() => setSidebar(o => !o)}>
              <i className="bi bi-list" />
            </button>
            <div className="hospital-status-badge d-none d-sm-flex">
              <span className="status-dot" />
              <span>Hospital Status: Standard Operating</span>
            </div>
          </div>

          <div className="header-right">
            <div className="header-time d-none d-md-flex">
              <i className="bi bi-clock-history text-primary" />
              <span>{time}</span>
            </div>

            {/* Dark / Light mode toggle */}
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              <i className={`bi ${darkMode ? "bi-sun-fill" : "bi-moon-stars-fill"}`} />
            </button>

            <div className="dropdown">
              <div className="user-profile" role="button" data-bs-toggle="dropdown" style={{ cursor: "pointer" }}>
                <div className="avatar">PM</div>
                <div className="user-info d-none d-xl-block">
                  <div className="user-name">{userName}</div>
                  <div className="user-role">Emergency Admin</div>
                </div>
                <i className="bi bi-chevron-down text-muted small ms-1" />
              </div>
              <ul className="dropdown-menu dropdown-menu-end shadow">
                <li><h6 className="dropdown-header">System Profile</h6></li>
                <li>
                  <button className="dropdown-item d-flex align-items-center" onClick={() => setShowProfileModal(true)}>
                    <i className="bi bi-person-badge me-2 text-primary" /> View Profile
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger d-flex align-items-center" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2" /> Signout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>

        <h1 className="visually-hidden">Pulse_Matrix Smart Hospital Emergency Management System</h1>

        <PageTransition pageKey={page}>{pageEl}</PageTransition>
      </main>

      {/* Administrator Profile Modal */}
      {showProfileModal && (
        <div className="modal-backdrop-custom" onClick={() => setShowProfileModal(false)}>
          <div className="glass-panel p-4 text-start" style={{ maxWidth: 440, width: "100%", color: "#0f172a" }} onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h3 className="m-0 fs-5 fw-bold d-flex align-items-center gap-2" style={{ color: "#0f172a" }}>
                <i className="bi bi-person-bounding-box text-primary" />
                Administrator Profile
              </h3>
              <button className="btn-close" onClick={() => setShowProfileModal(false)} />
            </div>
            <div className="text-center my-3">
              <div className="avatar mx-auto mb-2" style={{ width: 64, height: 64, fontSize: "1.5rem" }}>PM</div>
              <h4 className="fw-bold m-0" style={{ color: "#0f172a" }}>{userName}</h4>
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 mt-1">Emergency Operations Lead</span>
            </div>
            <div className="bg-light p-3 rounded-3 mb-4 small border">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Access Level:</span>
                <span className="fw-semibold">Command Level 1 (Full)</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Assigned Node:</span>
                <span className="fw-semibold">Core Engine v2.0</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Session Status:</span>
                <span className="text-success fw-semibold"><i className="bi bi-shield-check me-1" /> Active & Secure</span>
              </div>
            </div>
            <button className="btn btn-primary-gradient w-100 py-2 justify-content-center" onClick={() => setShowProfileModal(false)}>
              Close Profile
            </button>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
